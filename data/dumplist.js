console.log("hello, world");
var config = ["id", "name", "icons", "isActive", "version", 
              "description", "homepageURL", "installDate", "isCompatible"];
const addon = {
    id: 0,
    name: 1,
    icons: 2,
    isActive: 3,
    version: 4,
    description: 5,
    homepageURL: 6,
    installDate: 7,
    isCompatible: 8
};

self.port.on("Config", function(addonsConfig) {
    for (var i=0; i<addonsConfig.length; ++i){
        $("#items").append("hello");
    }
});
