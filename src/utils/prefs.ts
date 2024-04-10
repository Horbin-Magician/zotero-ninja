import { config } from "../../package.json";
import { getString } from "../utils/locale";

export function registerPrefs() {
  const prefOptions = {
    pluginID: config.addonID,
    src: rootURI + "chrome/content/preferences.xhtml",
    label: "Style",
    image: `chrome://${config.addonRef}/content/icons/favicon@32x32.png`,
    extraDTD: [`chrome://${config.addonRef}/locale/overlay.dtd`],
    defaultXUL: true,
  };
  ztoolkit.PreferencePane.register(prefOptions);
}

export function registerPrefsScripts(_window: Window) {
  // This function is called when the prefs window is opened
  // See addon/chrome/content/preferences.xul onpaneload
  if (!addon.data.prefs) {
    addon.data.prefs = {
      window: _window,
      columns: [
        {
          dataKey: "title",
          label: "prefs.table.title",
          fixedWidth: true,
          width: 100,
        },
        {
          dataKey: "detail",
          label: "prefs.table.detail",
        },
      ],
      rows: [
        {
          title: "Orange",
          detail: "It's juicy",
        },
        {
          title: "Banana",
          detail: "It's sweet",
        },
        {
          title: "Apple",
          detail: "I mean the fruit APPLE",
        },
      ],
    };
  } else {
    addon.data.prefs.window = _window;
  }
  updatePrefsUI();
  bindPrefEvents();
}

async function updatePrefsUI() {
  // You can initialize some UI elements on prefs window
  // with addon.data.prefs.window.document
  // Or bind some events to the elements
  const renderLock = ztoolkit.getGlobal("Zotero").Promise.defer();
  if (addon.data.prefs?.window == undefined) return;
  const tableHelper = new ztoolkit.VirtualizedTable(addon.data.prefs?.window)
    .setContainerId(`${config.addonRef}-table-container`)
    .setProp({
      id: `${config.addonRef}-prefs-table`,
      // Do not use setLocale, as it modifies the Zotero.Intl.strings
      // Set locales directly to columns
      columns: addon.data.prefs?.columns.map((column) =>
        Object.assign(column, {
          label: getString(column.label) || column.label,
        })
      ),
      showHeader: true,
      multiSelect: true,
      staticColumns: true,
      disableFontSizeScaling: true,
    })
    .setProp("getRowCount", () => addon.data.prefs?.rows.length || 0)
    .setProp(
      "getRowData",
      (index) =>
        addon.data.prefs?.rows[index] || {
          title: "no data",
          detail: "no data",
        }
    )
    // Show a progress window when selection changes
    .setProp("onSelectionChange", (selection) => {
      new ztoolkit.ProgressWindow(config.addonName)
        .createLine({
          text: `Selected line: ${addon.data.prefs?.rows
            .filter((v, i) => selection.isSelected(i))
            .map((row) => row.title)
            .join(",")}`,
          progress: 100,
        })
        .show();
    })
    // When pressing delete, delete selected line and refresh table.
    // Returning false to prevent default event.
    .setProp("onKeyDown", (event: KeyboardEvent) => {
      if (event.key == "Delete" || (Zotero.isMac && event.key == "Backspace")) {
        addon.data.prefs!.rows =
          addon.data.prefs?.rows.filter(
            (v, i) => !tableHelper.treeInstance.selection.isSelected(i)
          ) || [];
        tableHelper.render();
        return false;
      }
      return true;
    })
    // For find-as-you-type
    .setProp(
      "getRowString",
      (index) => addon.data.prefs?.rows[index].title || ""
    )
    // Render the table.
    .render(-1, () => {
      renderLock.resolve();
    });
  await renderLock.promise;
  ztoolkit.log("Preference table rendered!");
}

function bindPrefEvents() {
  addon.data
    .prefs!.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-enable`
    )
    ?.addEventListener("command", (e) => {
      ztoolkit.log(e);
      addon.data.prefs!.window.alert(
        `Successfully changed to ${(e.target as XUL.Checkbox).checked}!`
      );
    });

  addon.data
    .prefs!.window.document.querySelector(
      `#zotero-prefpane-${config.addonRef}-input`
    )
    ?.addEventListener("change", (e) => {
      ztoolkit.log(e);
      addon.data.prefs!.window.alert(
        `Successfully changed to ${(e.target as HTMLInputElement).value}!`
      );
    });
}

// /**
//  * Get preference value.
//  * Wrapper of `Zotero.Prefs.get`.
//  * @param key
//  */
// export function getPref(key: string) {
//   return Zotero.Prefs.get(`${config.prefsPrefix}.${key}`, true);
// }

// /**
//  * Set preference value.
//  * Wrapper of `Zotero.Prefs.set`.
//  * @param key
//  * @param value
//  */
// export function setPref(key: string, value: string | number | boolean) {
//   return Zotero.Prefs.set(`${config.prefsPrefix}.${key}`, value, true);
// }

// /**
//  * Clear preference value.
//  * Wrapper of `Zotero.Prefs.clear`.
//  * @param key
//  */
// export function clearPref(key: string) {
//   return Zotero.Prefs.clear(`${config.prefsPrefix}.${key}`, true);
// }

/* registerPrefsScripts of ZoteroStyle
export function registerPrefsScripts(_window: Window) {
  if (!addon.data.prefs) {
    addon.data.prefs = {
      window: _window,
    };
  } else {
    addon.data.prefs.window = _window;
  }
  const doc = addon.data.prefs!.window.document
  const fileKey = `${config.addonRef}.storage.filename`
  const filename = Zotero.Prefs.get(fileKey) as string
  const fileRadio = doc.querySelector("#storage-file") as XUL.Radio
  if (filename && filename.length) {
    fileRadio.setAttribute("disabled", "false")
  }
  doc.querySelector("#choose-path")?.addEventListener("command", async () => {
    const filename = await new ztoolkit.FilePicker(
      "Select File",
      "open",
      [
        ["JSON File(*.json)", "*.json"],
        ["Any", "*.*"],
      ],
      "zoterostyle.json"
    ).open();
    if (filename) {
      Zotero.Prefs.set(fileKey, filename)
      fileRadio.setAttribute("disabled", "false")
      // 用本地笔记更新
      // 检查key
      let addonItem = new AddonItem()
      await addonItem.init()
      console.log(addonItem)
      let ids = addonItem.item.getNotes()
      const storage = new LocalStorage(filename)
      await storage.lock.promise;
      ids.forEach(async (id: number) => {
        try {
          let noteItem = Zotero.Items.get(id)
          const item = Zotero.Items.getByLibraryAndKey(1, noteItem._displayTitle)
          const data = addonItem.getNoteData(noteItem)
          if (!storage.get(item, "readingTime") && data["readingTime"]) {
            console.log("Write ...", data["readingTime"])
            await storage.set(item, "readingTime", data["readingTime"])
          }
        } catch(e) {console.log(e)}
      })
      Object.keys(storage.cache).forEach((_id: string) => {
        let id = Number(_id)
        let key = Zotero.Items.get(id).key
        let data = storage.cache[key]
        if (!data.readingTime?.data) {
          storage.cache[key] = storage.cache[id]
        }
      })
      window.setTimeout(async () => {
        await Zotero.File.putContentsAsync(storage.filename, JSON.stringify(storage.cache));
        ztoolkit.getGlobal("alert")("Please restart Zotero.")
      })
    }
  })
}
 */