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
    width: 350,
    height: 400,
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
        dumpPanel.contentURL = data.url("./dumplist.html");
        // import AddonManager
        Cu.import("resource://gre/modules/AddonManager.jsm");
        // Extensions or themes
        // AddonManager.getAllAddons(function(aAddons) {
        //     console.log(aAddons.length);
        // });
        AddonManager.getAddonsByTypes(["extension"], function(addons) {
            // console.log(addons);
            /* name icons isActive */
            var config = ["id", "name", "icons", "isActive", 
                          "version", "description", "homepageURL", "installDate", "isCompatible"];
            var addonsConfig = new Array(addons.length);

            for(var i = 0; i < addons.length; i++) {
                addonsConfig[i] = []; 
                for(var j = 0; j < config.length; j++) {
                    // console.log(i + " " + j);
                    addonsConfig[i].push( addons[i][config[j]] );  
                }
            }
            console.log(addons);
            dumpPanel.port.emit("Config", addonsConfig);
        });
    }
});

var os_info = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime);
console.log(os_info.OS+os_info.XPCOMABI);
var browser_info = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
console.log(browser_info.name+browser_info.version+browser_info.appBuildID);

console.log(prefs.version);

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
    prefs.active = 0;
});

