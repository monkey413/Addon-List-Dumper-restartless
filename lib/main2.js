const { Cc, Ci, Cu } = require('chrome');
// var buttons = require('sdk/ui/button/action');
var panel = require("sdk/panel");
var self = require("sdk/self");
var tabs = require("sdk/tabs");
var sp = require("sdk/simple-prefs");
var prefs = sp.prefs;
var data = self.data;
var panel = require("sdk/panel").Panel({
  contentURL: "about:blank",
  onHide: function () {
    panel.contentURL = "about:blank";
  }
});

require("sdk/widget").Widget({
  id: "bing",
  label: "Bing",
  contentURL: "http://www.bing.com/favicon.ico",
  panel: panel,
  onClick: function() {
    panel.contentURL = "http://m.bing.com/";
  }
});

require("sdk/widget").Widget({
  id: "google",
  label: "Google",
  contentURL: "http://www.google.com/favicon.ico",
  panel: panel,
  onClick: function() {
      panel.contentURL = data.url("list.html");
      var children = gExtensionsView.children;
  }
});

// var button = buttons.ActionButton({
//   id: "mozilla-link",
//   label: "Visit Mozilla",
//   icon: {
//     "16": "./icon-16.png",
//     "32": "./icon-32.png",
//     "64": "./icon-64.png"
//   },
//   onClick: handleClick
// });

// function handleClick(state) {
//   console.log("hello, world");
//   tabs.open("http://www.mozilla.org/");
// }

// var { ToggleButton } = require('sdk/ui/button/toggle');
// var panels = require("sdk/panel");
// var self = require("sdk/self");

// var button = ToggleButton({
//     id: "my-button",
//     label: "my button",
//     icon: {
//         "16": "./icon-16.png",
//         "32": "./icon-32.png",
//         "64": "./icon-64.png"
//     },
//     onChange: handleChange
// });

// var panel = panels.Panel({
//     contentURL: self.data.url("http://www.google.com.tw"),
//     onHide: handleHide
// });

// function handleChange(state) {
//     console.log("hello");
//     if (state.checked) {
//         panel.show({
//             position: button
//         });
//     }
// }

// function handleHide() {
//     button.state('window', {checked: false});
// }
