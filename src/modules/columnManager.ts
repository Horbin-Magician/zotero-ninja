import { config } from "../../package.json";
import { getString } from "../utils/locale";

export default class ColumnManager {
    /**
    * 模仿Endnote评级
    */
    public getRatingColumn() {
        const key = "Rating"
        return {
            dataKey: key,
            label: getString(`column.${key}`),
            staticWidth: true, // don't allow column to be resized when the tree is resized
            minWidth: 70,
            pluginID: config.addonID,
            dataProvider: (item: Zotero.Item, dataKey: string) => ztoolkit.ExtraField.getExtraField(item, "rate") || "0",
            renderCell: (index: any, data: any, column: any) => {
                const span = document.createElement('span')
                span.className = `cell ${column.className} ${key}`;
        
                const keys = ZoteroPane.getSelectedItems().map(i=>i.key)
                const isSelected = keys.indexOf(ZoteroPane.getSortedItems()[index].key) != -1
                const maxNum = 5
                const rate = Number(data)
        
                for (let i = 0; i < maxNum; i++){
                    const text: string = (i < rate) ? "★" : (isSelected ? "•" : "")
                    const sub_span = document.createElement('span')
                    sub_span.className = "option"
                    sub_span.style.display = "inline-block";
                    sub_span.style.height = "1em";
                    sub_span.style.width = "1em";
                    sub_span.style.textAlign = "center";
                    sub_span.innerText = text
                    span.appendChild(sub_span)
                }
        
                return span
            },
            zoteroPersist: ["width", "hidden", "sortDirection"],
        };
    }
    
    /**
     * 创建引用数列
     */
    public getCitationColumn() {
        const key = "Citation"
        return {
            dataKey: key,
            label: getString(`column.${key}`),
            staticWidth: true, // don't allow column to be resized when the tree is resized
            minWidth: 40,
            pluginID: config.addonID,
            dataProvider: (item: Zotero.Item, dataKey: string) => ztoolkit.ExtraField.getExtraField(item, "citation") || 'N/A',
            renderCell: (index: any, data: any, column: any) => {
                const span = document.createElement('span')
                span.className = `cell ${column.className} ${key}`;
                span.textContent = data;
                return span
            },
            zoteroPersist: ["width", "hidden", "sortDirection"],
        };
    }

    /**
     * 注册所有数列
     */
    public async registerColumns() {
        const columns = [];
        if (Zotero.Prefs.get(`${config.prefsPrefix}.function.ratingColumn.enable`, true) as boolean) { 
            columns.push(this.getRatingColumn())
        }
        if (Zotero.Prefs.get(`${config.prefsPrefix}.function.citationColumn.enable`, true) as boolean) {
            columns.push(this.getCitationColumn())
        }
        const registeredDataKeys = await Zotero.ItemTreeManager.registerColumns(columns);
    }

    /**
     * 监测Item点击
     */
    public async initItemSelectListener() {
        const getChildrenTarget = (event: any, nodes: any) => {
            const target = [...nodes].find((span: any) => {
                if (!span || !span.getBoundingClientRect) { return false }
                const rect = span.getBoundingClientRect()
                return (
                    event.clientX >= rect.x &&
                    event.clientX <= rect.x + rect.width &&
                    event.clientY >= rect.y && 
                    event.clientY <= rect.y + rect.height
                )
            })
            return target
        }
        const p = "#zotero-items-tree .virtualized-table-body"
        while (!document.querySelector(p)) {
            await Zotero.Promise.delay(10)
        }

        let lastKey: string
        const table = document.querySelector(p)
        table?.addEventListener("mousemove", (event) => {
            const target = event.target as HTMLDivElement
            if (!target || !target.classList.contains("selected")) { return }
            const items = ZoteroPane.getSelectedItems()

            if (items.length == 1) {
                const item = items[0]

                const target = getChildrenTarget(event, (event.target! as HTMLDivElement).childNodes) as HTMLSpanElement
                if (target?.classList.contains("Rating")) {
                    const optionNodes = [...target.querySelectorAll("span.option")] as HTMLScriptElement[]
                    const optionNode = getChildrenTarget(event, optionNodes)
                    const index = optionNodes.indexOf(optionNode)
                    let rate: number
                    if (index == -1) {
                        rate = Number(ztoolkit.ExtraField.getExtraField(item, "rate"))
                    } else {
                        rate = index + 1
                    }

                    const mark = Zotero.Prefs.get(`${config.prefsPrefix}.ratingColumn.mark`, true) as string
                    const option = Zotero.Prefs.get(`${config.prefsPrefix}.ratingColumn.option`, true) as string
                    
                    for (let i = 0; i < optionNodes.length; i++){
                        if (i < rate) {
                            optionNodes[i].innerText = mark
                        } else {
                            optionNodes[i].innerText = option
                        }
                    }
                }
            }
        })

        table?.addEventListener("click", async (event: any) => {
            const target = getChildrenTarget(event, (event.target! as HTMLDivElement).childNodes)

            const today = new Date();
            const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
            const yyyy = today.getFullYear();
            const date = yyyy + '-' + mm;

            const items = ZoteroPane.getSelectedItems()

            for (const item of items) {
                const citation = ztoolkit.ExtraField.getExtraField(item, "citation");
                const citation_date = ztoolkit.ExtraField.getExtraField(item, "citation_date") as string;

                if (!citation || citation_date < date || citation=="N/A") {
                    const doi = item.getField("DOI");
                    if (doi) {
                        window.fetch('https://doi.org/' + doi, {
                            headers: {
                                Accept: 'application/vnd.citationstyles.csl+json',
                                'User-Agent': `mailto:${config.addonID}; ${window.navigator.userAgent}`
                        }})
                            .then( res => res.json() )
                            .then( 
                                json => {
                                    ztoolkit.ExtraField.setExtraField(item, "citation_date", date);
                                    ztoolkit.ExtraField.setExtraField(item, "citation", json['is-referenced-by-count']);
                                    ztoolkit.ItemTree.refresh();
                                }
                            )
                            .catch( _ => {
                                ztoolkit.ExtraField.setExtraField(item, "citation_date", date);
                                ztoolkit.ExtraField.setExtraField(item, "citation", "N/A");
                                ztoolkit.ItemTree.refresh();
                            } );
                    }
                }
            }

            // if (target?.classList.contains("PublicationTags")) {
            //   try {
            //     const item = ZoteroPane.getSelectedItems()[0]
            //     const publicationTitle = getPublicationTitle(item)
            //     if (!publicationTitle) {
            //       console.log("No publicationTitle")
            //     } else {
            //       new ztoolkit.ProgressWindow("Publication Tags", {closeTime: 3000})
            //         .createLine({ text: publicationTitle, type: "default" }).show()
            //       updatePublicationTags(this.localStorage, item, true)
            //       ztoolkit.ItemTree.refresh()
            //     }
            //   } catch { /* empty */ }
            // }

            if (items.length == 1) {
                const item = items[0]
                if (lastKey == item.key) {
                    // for rating
                    if (target?.classList.contains("Rating")) {
                        const optionNodes = [...target.querySelectorAll("span.option")] as HTMLScriptElement[]
                        const optionNode = getChildrenTarget(event, optionNodes)
                        const index = optionNodes.indexOf(optionNode)
                        const rate = Number(ztoolkit.ExtraField.getExtraField(item, "rate") || "0")
                        if (index + 1 == rate) {
                            await ztoolkit.ExtraField.setExtraField(item, "rate", String(index))
                        } else {
                            await ztoolkit.ExtraField.setExtraField(item, "rate", String(index + 1))
                        }
                    }
                } else {
                    lastKey = item.key
                }
            }
        })
    }
}