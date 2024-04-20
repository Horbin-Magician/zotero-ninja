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
            dataProvider: (item: Zotero.Item, dataKey: string) => ztoolkit.ExtraField.getExtraField(item, "citation") || '#' + item.getField('DOI'),
            renderCell: (index: any, data: any, column: any) => {
                const span = document.createElement('span')
                span.className = `cell ${column.className} ${key}`;

                if (data[0] == '#') {
                    span.textContent = "N/A1";
                    const doi = data.substr(1);
                    if (doi=='') { span.textContent =  "N/A2"; } // There is no DOI; skip item
                    else{
                        window.fetch('https://doi.org/' + doi, {
                            headers: { 
                                Accept: 'application/vnd.citationstyles.csl+json',
                                'User-Agent': `mailto:${config.addonID}; ${window.navigator.userAgent}`
                        }})
                            .then(res => res.json())
                            .then( json =>  span.textContent = json['is-referenced-by-count'])
                            .catch(_ =>  span.textContent = "N/A3");
                    }

                } else span.textContent = data;

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
}