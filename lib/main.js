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
var gBrowser = windowUtils.getMostRecentBrowserWindow().getBrowser();

var dumpPanel = panels.Panel({
    width: 400,
    height: 550,
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
    contentURL: data.url("./icon-16.png"),
    panel: dumpPanel,
    onClick: function() {
        /* panel html */ 
        dumpPanel.contentURL = data.url("./dumplist.html");
        /* import AddonManager */
        Cu.import("resource://gre/modules/AddonManager.jsm");
        AddonManager.getAddonsByTypes(["extension"], function(addons) {
            let config = ["id", "name", "icons", "isActive", 
                          "version", "description", "homepageURL", "installDate", "isCompatible"];
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
});

