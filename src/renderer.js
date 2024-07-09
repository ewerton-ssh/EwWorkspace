const appKeys = ["gMail", "gCalendar", "gDrive", "gSheets", "gDocs", "whatsapp", "notion"];

const getControlsHeight = () => {
  const controls = document.querySelector(".titlebar");
  if (controls) {
    return controls.offsetHeight;
  }
  return 0;
};

const calculateLayoutSize = () => {
  const windowWidth = document.documentElement.clientWidth;
  const windowHeight = document.documentElement.clientHeight;
  const controlsHeight = getControlsHeight();
  const webviewHeight = windowHeight - controlsHeight;

  appKeys.forEach(appKey => {
    const webview = document.querySelector(`#webview-${appKey}`);
    webview.style.width = windowWidth + "px";
    webview.style.height = webviewHeight + "px";
  });
};

const switchApp = (appKey) => {
  appKeys.forEach(key => {
    const webview = document.querySelector(`#webview-${key}`);
    webview.style.display = key === appKey ? '' : 'none';
  });
};

function actBtn(e) {
  window.electron.ipcRenderer.send(e);
}

window.addEventListener("DOMContentLoaded", () => {
  calculateLayoutSize();
  window.onresize = calculateLayoutSize;

  //Sidebar buttons
  document.querySelector("#btnGmail").onclick = () => switchApp('gMail');
  document.querySelector("#btnCalendar").onclick = () => switchApp('gCalendar');
  document.querySelector("#btnDrive").onclick = () => switchApp('gDrive');
  document.querySelector("#btnSheets").onclick = () => switchApp('gSheets');
  document.querySelector("#btnDocs").onclick = () => switchApp('gDocs');
  document.querySelector("#btnWhatsapp").onclick = () => switchApp('whatsapp');
  document.querySelector("#btnNotion").onclick = () => switchApp('notion');

  //Title bar drag buttons
  document.querySelector("#minimizeBtn").onclick = () => actBtn("minimizeApp");
  document.querySelector("#maximizeBtn").onclick = () => actBtn("maximizeApp");
  document.querySelector("#closeBtn").onclick = () => actBtn("closeApp");
});
