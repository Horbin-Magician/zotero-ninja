import { config } from "../package.json";
import { getString, initLocale } from "./utils/locale";
import { registerPrefsScripts, registerPrefs } from "./utils/prefs";
import ColumnManager from "./modules/columnManager";

async function onStartup() {
  // registerPrefs();

  // Register the callback in Zotero as an item observer
  const notifierID = Zotero.Notifier.registerObserver(
    { notify: onNotify },
    ["tab"]
  );

  // Unregister callback when the window closes (important to avoid a memory leak)
  window.addEventListener(
    "unload",
    (e: Event) => {
      Zotero.Notifier.unregisterObserver(notifierID);
    },
    false
  );

  ztoolkit.ProgressWindow.setIconURI(
    "default",
    `chrome://${config.addonRef}/content/icons/favicon.png`
  );

  await Promise.all([
    Zotero.initializationPromise,
    Zotero.unlockPromise,
    Zotero.uiReadyPromise,
  ]);
  initLocale();
  
  // 开启所有功能
  const columnManager = new ColumnManager()
  const tasks = [
    columnManager.registerColumns(),
    columnManager.initItemSelectListener(),
  ];
  try {
    await Promise.all(tasks);
  } catch (e) {
    ztoolkit.log("ERROR", e);
  }
}

function onShutdown(): void {
  ztoolkit.unregisterAll();
  ztoolkit.ItemTree.unregisterAll()
  // Remove addon object
  addon.data.alive = false;
  delete Zotero[config.addonInstance];

  /* onShutdown of ZoteroStyle
  try {
    ztoolkit.unregisterAll()
    ztoolkit.UI.unregisterAll()
    
    // 移除创建的按钮
    document.querySelector("#zotero-style-show-hide-graph-view")?.remove();
    // 恢复嵌套标签
    (document.querySelector(".tag-selector") as HTMLDivElement).style.display = ""
  } catch (e) {
    console.log("ERROR onShutdown", e)
  } finally {
    addon.data.alive = false;
    delete Zotero.ZoteroStyle;
  }
  */
}

/**
 * This function is just an example of dispatcher for Notify events.
 * Any operations should be placed in a function to keep this funcion clear.
 */
async function onNotify(
  event: string,
  type: string,
  ids: Array<string | number>,
  extraData: { [key: string]: any }
) {
  // You can add your code to the corresponding notify type
  // if (
  //   event == "select" &&
  //   type == "tab" &&
  //   extraData[ids[0]].type == "reader"
  // ) {
  //   // Do something
  // }
}

/**
 * This function is just an example of dispatcher for Preference UI events.
 * Any operations should be placed in a function to keep this funcion clear.
 * @param type event type
 * @param data event data
 */
async function onPrefsEvent(type: string, data: { [key: string]: any }) {
  switch (type) {
    case "load":
      registerPrefsScripts(data.window);
      break;
    default:
      return;
  }
}

// Add your hooks here. For element click, etc.
// Keep in mind hooks only do dispatch. Don't add code that does real jobs in hooks.
// Otherwise the code would be hard to read and maintian.

export default {
  onStartup,
  onShutdown,
  onNotify,
  onPrefsEvent,
};
