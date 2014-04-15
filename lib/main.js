const {Cc, Ci, Cu} = require("chrome");
var self = require("sdk/self");
var data = self.data;
var panels = require("sdk/panel");
var tabs = require("sdk/tabs");
var widgets = require("sdk/widget");
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
/* 下一個工作要完成偏好設定的部份 */



// var phs = Cc["@mozilla.org/plugin/host;1"].getService(Ci.nsIPluginHost);
// var plugins = phs.getPluginTags({ });
// console.log(plugins);

// var XPIProvider = Cu.import("resource://gre/modules/XPIProvider.jsm");
// var addons_db = XPIProvider.XPIDatabase.getAddons();
// for(var i = 0; i < addons_db.length; i++) {
//     console.log(addons_db[i]["id"]);
// }


// var ELDumper = {
// //	dump_output: "",

// 	init: function() {
// 		tabs.open("chrome://extensionlistdumper/content/output.xul");		
// 		ELDumper.updateDumpButton();
// 		var v_group = document.getElementById("viewGroup");
// 		if (v_group != null) {
// 			var childs = v_group.childNodes;
// 			for (var i=0; i<childs.length; i++) {
// 				childs[i].addEventListener("command", ELDumper.updateDumpButton, true);
// 			}
// 		}
// 		else if (typeof gCategories != "undefined") {
// 			document.addEventListener("ViewChanged", ELDumper.updateDumpButton, true);
// 		}
// 	},
	
// 	updateDumpButton: function() {
// 		var d_button = document.getElementById("ELDumperButton");
		
// 		if (typeof gView != "undefined") {
// 			if ((gView == "extensions") || (gView == "themes") || (gView == "plugins")) {
// 				d_button.hidden = false;
// 			}
// 			else {
// 				d_button.hidden = true;
// 			}
// 		}
// 		else if (typeof gCategories != "undefined") {
// 			// Firefox >= 4.0
// 			var d_menuitem = document.getElementById("ELDumperMenuitem");
// 			var d_menuseparator = document.getElementById("ELDumperMenuseparator");
// 			var categ_id = gCategories.node.selectedItem.id;
// 			if ((categ_id == "category-extensions") || (categ_id == "category-extension") || (categ_id == "category-themes") || (categ_id == "category-theme") || (categ_id == "category-plugins") || (categ_id == "category-plugin")) {
// 				d_button.hidden = false;
// 				d_menuitem.hidden = false;
// 				d_menuseparator.hidden = false;
// 			}
// 			else {
// 				d_button.hidden = true;
// 				d_menuitem.hidden = true;
// 				d_menuseparator.hidden = true;
// 			}
// 		}
// 		else {
// 			d_button.hidden = true;
// 		}
// 	},
	
// 	dump: function() {
// /*		var items = [];
// 		var children = gExtensionsView.children;
// 		var item;
// 		var out = "";
// 		for (var i = 0; i < children.length; ++i) {
// 			item = gExtensionManager.getItemForID(getIDFromResourceURI(children[i].id));
// 			out += "- " + item.name + " " + item.version + "\n";
// 		}
		
// 		var app_info = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
// 		var out_info = "";
// 		out_info += "Application: " + app_info.name + " " + app_info.version + " (" + app_info.appBuildID + ")\n";
// 		var app_info2 = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime);
// 		out_info += "Operating System: " + app_info2.OS + " (" + app_info2.XPCOMABI + ")\n";
		
// 		this.dump_output = out_info + "\n" + out;*/
// 		// document.window.open("chrome://extensionlistdumper/content/output.xul", "Extension List Dumper", "chrome,centerscreen,resizable");
// 		tabs.open("chrome://extensionlistdumper/content/output.xul");		
// 	}
// };

// for each (let window in windowUtils.windows()) {
//     window.addEventListener("load", ELDumper.dump, true);
// }

