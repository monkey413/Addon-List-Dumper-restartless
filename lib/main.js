const {Cc, Ci, Cu} = require("chrome");
var self = require("sdk/self");
var data = self.data;
var panels = require("sdk/panel");
var tabs = require("sdk/tabs");
var widgets = require("sdk/widget");
var sp = require("sdk/simple-prefs");
var prefs = sp.prefs;

var windows = require("sdk/windows").browserWindows;
const windowUtils = require("sdk/window/utils");
var window = windowUtils.getMostRecentBrowserWindow();
var gBrowser = window.getBrowser();


var dumpPanel = panels.Panel({
    width: 400,
    height: 540,
    contentURL: "about:blank",
    contentScriptFile: [data.url("jquery-2.1.0.js"),
                        data.url("dumplist.js")],
    onHide: function() {
        dumpPanel.contentURL = "about:blank";
    }
});

require("sdk/widget").Widget({
    id: "eldumper",
    label: "eldumper",
    contentURL: data.url("./icon_list.png"),
    panel: dumpPanel,
    onClick: function() {
        /* panel html */ 
        dumpPanel.contentURL = data.url("./dumplist.html");
        /* import AddonManager */
        Cu.import("resource://gre/modules/AddonManager.jsm");
        AddonManager.getAllAddons(function(addons) {
            let config = ["id", "name", "icons", "isActive", 
                          "version", "description", "homepageURL", 
                          "installDate", "isCompatible", "type"];
            let addonsConfig = new Array(addons.length);

            for(let i = 0; i < addons.length; i++) {
                addonsConfig[i] = []; 
                for(let j = 0; j < config.length; j++) {
                    addonsConfig[i].push( addons[i][config[j]] );  
                }
            }
            // console.log(addons);
            /* send addons information */
            dumpPanel.port.emit("Config", addonsConfig);
            
            /* send the softInfo */
            let browserServ = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo),
                browserInfo = "Software:"+browserServ.name+" "+browserServ.version+" ("+browserServ.appBuildID+")",
                osServ = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime),
                osInfo = "OS:"+osServ.OS+" ("+osServ.XPCOMABI+")",
                softInfo = browserInfo + "\n" +osInfo ; 
            dumpPanel.port.emit("SoftInfo", softInfo);

            /* send the preference */
            dumpPanel.port.emit("Prefs", JSON.stringify(prefs));
            
        });
        
        
    }
});


/* preference listener for the reset button */
sp.on("reset", function(){
    prefs.version = true;
    prefs.description = false;
    prefs.url = false;
    prefs.id = false;
    prefs.softInfo = true;
    prefs.total = false;
    prefs.date = false;
    prefs.installDate = false;
    prefs.active = "All";
    prefs.type = "All";
    prefs.sort = "Name";
});

/* get the text and copy the text to clipboard */
dumpPanel.port.on("Clipboard", function(text){
    let clipboard = Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper);
    clipboard.copyString(text);
    notify("Extension List Dumper Notifier", "text copied to clipboard");
});

/* get the text and save to the file */
dumpPanel.port.on("SaveText", function(text){
    const nsIFilePicker = Ci.nsIFilePicker;
    let fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    fp.init(window, "Save a File", nsIFilePicker.modeSave);
    
    let res = fp.show(); // the result of filefiter
    if ((res == nsIFilePicker.returnOK) || (res == nsIFilePicker.returnReplace)) {
	let file = fp.file;
	text = text.replace(/\n/g, "\r\n"); // Fix new lines in some Win text editors (like notepad)
	let outputStream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
	outputStream.init(file, 0x02 | 0x08 | 0x20, 777, 0);
	outputStream.write('\u00EF\u00BB\u00BF', 3); //write UTF-8 BOM
	let converterOutputStream = Cc["@mozilla.org/intl/converter-output-stream;1"].createInstance(Ci.nsIConverterOutputStream);
	converterOutputStream.init(outputStream, "UTF-8", 0, 0x0000);
	converterOutputStream.writeString(text);
	converterOutputStream.close();
    }
});

/** Notifier **/
var notify = (function () { // https://github.com/fwenzel/copy-shorturl/blob/master/lib/simple-notify.js
    return function (title, text, clickable, link) {
        try {
            let alertServ = Cc["@mozilla.org/alerts-service;1"].
                getService(Ci.nsIAlertsService);
            alertServ.showAlertNotification(data.url("notification.png"), title, text, clickable, link,
                                            function (subject, topic, data) {
                                                if (topic == "alertclickcallback") {
                                                    timer.setTimeout(function () {
                                                        // If main window is not focused, restore it first!
                                                        windows.active.focus();
                                                        timer.setTimeout(onCommand, 100);
                                                    }, 100);
                                                }
                                            }, "");
        }
        catch(e) {
            let browser = window.active.gBrowser,
                notificationBox = browser.getNotificationBox();

            notification = notificationBox.appendNotification(text, 'jetpack-notification-box',
                                                              data.url("notification.png"), notificationBox.PRIORITY_INFO_MEDIUM, []
                                                             );
            timer.setTimeout(function() {
                notification.close();
            }, config.desktopNotification);
        }
    }
})();

