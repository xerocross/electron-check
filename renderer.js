const {ChecklistApp} = require("./check-desktop");
const { remote, BrowserWindow } = require('electron')
const currentWindow = remote.getCurrentWindow()
const Vue = require("vue");

currentWindow.webContents.once('dom-ready', () => {
       new Vue({
        el : "#checklist-app",
        components : {
            ChecklistApp
        },
        render : function (createElement) {
            return createElement(ChecklistApp);
        }
    });
});