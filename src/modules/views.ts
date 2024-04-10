import { config } from "../../package.json";
import { getString } from "../utils/locale";

// import field2Info from "./easyscholar";
// import { updatePublicationTags, getPublicationTitle } from "./utils";
// import LocalStorage from "./localStorage";
// var ColorRNA = require('color-rna');


export default class Views {
  // private localStorage = new LocalStorage(config.addonRef)
  constructor() {
    Zotero[config.addonInstance].data.views = this
  }

  // /**
  //  * 创建分区影响因子列
  //  * 不同分区用不同颜色表示，不同影响因子用长度表示，默认是当前collection最大影响因子
  //  */
  // public async createPublicationTagsColumn() {
  //   await this.localStorage.lock.promise;
  //   if (!Zotero.Prefs.get(`${config.addonRef}.function.PublicationTagsColumn.enable`) as boolean) { return }
  //   const key = "PublicationTags"
  //   await ztoolkit.ItemTree.register(
  //     key,
  //     getString(`column.${key}`),
  //     (
  //       field: string,
  //       unformatted: boolean,
  //       includeBaseMapped: boolean,
  //       item: Zotero.Item
  //     ) => {
  //       if (!item.isRegularItem()) { return ""}
  //       try {
  //         const data = this.localStorage.get(item, "publication")
  //         if (data == undefined) {
  //           // 自动更新
  //           window.setTimeout(async () => {
  //             await updatePublicationTags(this.localStorage, item)
  //           })
  //           return ""
  //         }
  //         if (data == "") { return data }
  //         // 排序
  //         let sortBy: any = Zotero.Prefs.get(`${config.addonRef}.${key}Column.sortBy`) as string
  //         sortBy = sortBy.split(/,\s*/g)
  //         let s = sortBy.map((k: string) => {
  //           let value
  //           if (k.startsWith("-")) {
  //             k = k.slice(1)
  //             if (!data[k]) {
  //               value = 1e5
  //             } else {
  //               value = (1e5 - parseInt(String(Number(data[k].replace(/[^0-9\.]/g, "")) * 1e3)))
  //             }
  //           } else {
  //             if (!data[k]) {
  //               value = 1e5
  //             } else {
  //               value = parseInt(String(Number(data[k].replace(/[^0-9\.]/g, "")) * 1e3))
  //             }
  //           }
  //           value = String(value)
  //           value = value.slice(0, 6)
  //           while (value.length < 6) {
  //             value = "0" + value
  //           }
  //           return value
  //         }).join(".")
  //         return s + " \n" + JSON.stringify(data)
  //       } catch (e) {
  //         console.log(e)
  //         return ""
  //       }
  //     },
  //     {
  //       renderCellHook: (index: any, data: any, column: any) => {
  //         const span = ztoolkit.UI.createElement(document, "span", {
  //           styles: {
  //             display: "block",
  //             width: "100%",
  //           }
  //         }) as HTMLSpanElement
  //         if (data == "") {
  //           span.style.height = "20px"
  //           return span
  //         }
  //         try {
  //           try {
  //             data = JSON.parse(data.split("\n")[1])
  //           } catch {
  //             return span
  //           }
  //           if (Object.keys(data).length == 0) { return span }
  //           // 渲染逻辑
  //           let rankColors = (Zotero.Prefs.get(`${config.addonRef}.${key}Column.rankColors`) as string).split(/,\s*/g)
  //           const defaultColor = Zotero.Prefs.get(`${config.addonRef}.${key}Column.defaultColor`) as string
  //           const textColor = Zotero.Prefs.get(`${config.addonRef}.${key}Column.textColor`) as string
  //           const opacity = Zotero.Prefs.get(`${config.addonRef}.${key}Column.opacity`) as string
  //           const margin = Zotero.Prefs.get(`${config.addonRef}.${key}Column.margin`) as string
  //           const padding = Zotero.Prefs.get(`${config.addonRef}.${key}Column.padding`) as string
  //           let fields: any = Zotero.Prefs.get(`${config.addonRef}.${key}Column.fields`) as string
  //           fields = fields.split(/,\s*/g).filter((i: string) => data[i])
  //           let mapString: any = Zotero.Prefs.get(`${config.addonRef}.${key}Column.map`) as string
  //           let mapArr: [RegExp | string, string][] = mapString.split(/[,;]\s*/g).filter((s: string)=>s.trim().length).map((ss: string) => {
  //             let [s1, s2] = ss.split("=")
  //             // 如果s1是正则转化为正则
  //             const res = s1.match(/\/(.+)\/(\w*)/)
  //             if (res) {
  //               return [
  //                 new RegExp(res[1], res[2]),
  //                 s2
  //               ]
  //             } else {
  //               return [
  //                 s1,
  //                 s2
  //               ]
  //             }
  //           })
  //           let getMapString = (s: string) => {
  //             try {
  //               for (let i = 0; i < mapArr.length; i++){
  //                 if (typeof mapArr[i][0] == "string") {
  //                   if (mapArr[i][0] == s) {
  //                     s = mapArr[i][1]
  //                   }
  //                 } else if ((mapArr[i][0] as RegExp).test(s)) {
  //                   s = s.replace(mapArr[i][0], mapArr[i][1])
  //                   break
  //                 }
  //               }
  //               return s
  //             } catch (e) {
  //               ztoolkit.log(e)
  //               return s
  //             }
  //           }
  //           for (let i = 0; i < fields.length; i++) {
  //             let field = fields[i]
  //             let fieldValue = data[field]
  //             let text, color
  //             if (field in field2Info) {
  //               let info = field2Info[field](fieldValue)
  //               let rankIndex = info.rank - 1
  //               color = rankIndex >= rankColors.length ? rankColors.slice(-1)[0] : rankColors[rankIndex]
  //               text = [getMapString(info.key), getMapString(info.value)].filter(i => i.length > 0).join(" ")
  //             } else {
  //               if (field.toUpperCase() == fieldValue.toUpperCase()) {
  //                 text = getMapString(fieldValue.toUpperCase())
  //               } else {
  //                 text = `${getMapString(field.toUpperCase())} ${getMapString(fieldValue)}`
  //               }
  //               // let color: string
  //               if (["A", "B", "C", "D"].indexOf(fieldValue)) {
  //                 switch (fieldValue) {
  //                   case "A":
  //                     color = rankColors[0]
  //                     break;
  //                   case "B":
  //                     color = rankColors[1]
  //                     break;
  //                   case "C":
  //                     color = rankColors[2]
  //                     break;
  //                   case "D":
  //                     color = rankColors[3]
  //                     break;
  //                   case "E":
  //                     color = rankColors[4]
  //                     break
  //                   default:
  //                     color = defaultColor
  //                     break;
  //                 }
  //               } else {
  //                 color = defaultColor
  //               }
  //             }
  //             const c = new ColorRNA(color)
  //             let [red, green, blue] = c.rgb()
  //             const hsl = c.HSL()
  //             hsl[2] = 40
  //             // 如果文本颜色是auto，则进行处理
  //             span.appendChild(ztoolkit.UI.createElement(document, "span", {
  //               styles: {
  //                 backgroundColor: `rgba(${red}, ${green}, ${blue}, ${opacity})`,
  //                 // color: textColor == "auto" ? `rgba(${red}, ${green}, ${blue}, 1)` : textColor,
  //                 color: textColor == "auto" ? c.HSL(hsl).getHex() as string : textColor,
  //                 padding: `0.05em ${padding}em`,
  //                 borderRadius: "3px",
  //                 margin: `${margin}em`
  //               },
  //               properties: {
  //                 innerText: text
  //               }
  //             }))
  //           }
  //           if (!span.querySelector("span")) {
  //             span.style.height = "20px"
  //           }
  //           return span;
  //         } catch (e) {
  //           ztoolkit.log(e)
  //           return span
  //         }
  //       },
  //     }
  //   );

  //   this.patchSetting(
  //     key,
  //     [
  //       {
  //         prefKey: `${key}Column.fields`,
  //         name: "Fields",
  //         type: "input",
  //       },
  //       {
  //         prefKey: `${key}Column.map`,
  //         name: "Map",
  //         type: "input",
  //       },
  //       {
  //         prefKey: `${key}Column.rankColors`,
  //         name: "Rank Colors",
  //         type: "input"
  //       },
  //       {
  //         prefKey: `${key}Column.defaultColor`,
  //         name: "Default Color",
  //         type: "input"
  //       },
  //       {
  //         prefKey: `${key}Column.textColor`,
  //         name: "Text Color",
  //         type: "input"
  //       },
  //       {
  //         prefKey: `${key}Column.sortBy`,
  //         name: "Sort By",
  //         type: "input"
  //       },
  //       {
  //         prefKey: `${key}Column.opacity`,
  //         name: "Opacity",
  //         type: "range",
  //         range: [0, 1, 0.01],
  //       },
  //       {
  //         prefKey: `${key}Column.margin`,
  //         name: "Margin",
  //         type: "range",
  //         range: [0, 0.5, 0.001]
  //       },
  //       {
  //         prefKey: `${key}Column.padding`,
  //         name: "Padding",
  //         type: "range",
  //         range: [0, 1, 0.001]
  //       },
  //     ],
  //     500
  //   )
  // }

  /**
   * 模仿Endnote评级
   */
  public async createRatingColumn() {
    if (!Zotero.Prefs.get(`${config.prefsPrefix}.function.ratingColumn.enable`, true) as boolean) { return }

    const key = "Rating"
    await Zotero.ItemTreeManager.registerColumns({
      dataKey: key,
      label: getString(`column.${key}`),
      staticWidth: true, // don't allow column to be resized when the tree is resized
      minWidth: 70,
      pluginID: config.addonID,
      dataProvider: (item, dataKey) => ztoolkit.ExtraField.getExtraField(item, "rate") || "0",
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
    });
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

      const items = ZoteroPane.getSelectedItems()
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