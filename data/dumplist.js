// console.log("hello, world");

var addonsInfo = [[]];
var softInfo = "";
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

/* Get the needed addons information */

self.port.on("Config", function(addonsConfig) {
    addonsInfo = addonsConfig;
});

/* Get softInfo */

self.port.on("SoftInfo", function(softwareInfo) {
    softInfo = softwareInfo;
});

/* Get prefs to widget */

self.port.on("Prefs", function(preferences) {
    prefs = JSON.parse(preferences);
    //console.log(prefs.version);
    $("input[name='version']").prop("checked", prefs.version);
    $("input[name='description']").prop("checked", prefs.description);
    $("input[name='url']").prop("checked", prefs.url); 
    $("input[name='id']").prop("checked", prefs.id); 
    $("input[name='softInfo']").prop("checked", prefs.softInfo); 
    $("input[name='total']").prop("checked",prefs.total);
    $("input[name='date']").prop("checked",prefs.date);
    $("input[name='installDate']").prop("checked",prefs.installDate); 
    $("select[name='active']").val(prefs.active);
    
    // console.log($("input[name='version']").prop("checked"));
    // console.log(softInfo);
    
    buildOutput();
    
});

/* Build the output string */

function buildOutput(){
    let option = {
        softInfo: $("input[name='softInfo']").prop("checked"),
        version: $("input[name='version']").prop("checked"),
        description: $("input[name='description']").prop("checked"),
        url: $("input[name='url']").prop("checked"),
        id: $("input[name='id']").prop("checked"),
        total: $("input[name='total']").prop("checked"),
        date: $("input[name='date']").prop("checked"),
        installDate: $("input[name='installDate']").prop("checked"),
        active: $("select[name='active']").val(),
        
        selectActive: {
            All: function(){
                let addonItems = $.extend(true, [], addonsInfo);
                for(let i = 0; i < addonItems.length; i++) {
                    if (!addonItems[i][addon.isActive])
                        addonItems[i][addon.version] += " (Disabled)";
                    if (!addonItems[i][addon.isCompatible])
                        addonItems[i][addon.version] += " (Incompatible)";
                }
                return addonItems;
            },
            Enabled: function(){
                return $.extend(true, [], addonsInfo.filter(function(elem){
                    return elem[addon.isActive];
                }));
            }, 
            Incompatible: function(){
                let addonItems = $.extend(true, [], addonsInfo.filter(function(elem){
                    return !elem[addon.isCompatible];
                }));
                
                for(let i = 0; i < addonItems.length; i++) {
                    addonItems[i][addon.version] += " (Incompatible)";
                }

                return addonItems;
            },
            Disabled: function(){
                let addonItems = $.extend(true, [], addonsInfo.filter(function(elem){
                    return !elem[addon.isActive];
                }));
                
                for(let i = 0; i < addonItems.length; i++) {
                    addonItems[i][addon.version] += " (Disabled)";
                }
                
                return addonItems;
            }
        }
    };
    $("#items").val("");

    if (option.softInfo) 
        $("#items").val($("#items").val()+softInfo+"\n\n");
    
    let dt = new Date(); 
    if (option.date)
        $("#items").val($("#items").val()+dt.toDateString()+"\n\n");

    /* Select All or Enabled or Disabled or Incompatible */
    let addonItems = option.selectActive[option.active]();
    
    $("h4[name='total']").text("Total: "+addonItems.length);
    if (option.total)
        $("#items").val($("#items").val()+"Total number of items: "+
                        addonItems.length+"\n\n");

    for (let i=0; i<addonItems.length; ++i){
        $("#items").val($("#items").val()+"-"+addonItems[i][addon.name]+" "+
                        (option.version ? addonItems[i][addon.version]+"\n" : "\n") +  
                        (option.description ? "    "+addonItems[i][addon.description]+"\n" : "") + 
                        (option.url && !(addonItems[i][addon.homepageURL]===null) ? "    "+addonItems[i][addon.homepageURL]+"\n" : "") + 
                        (option.id ? "    "+addonItems[i][addon.id]+"\n" : "") + 
                        (option.installDate ? "    "+addonItems[i][addon.installDate]+"\n" : ""));
    }
}

/* Update */
$("select[name='active'], input[type='checkbox']").change(function(){
    buildOutput();
});

/* copy to clipboard */
$("input[name='clipboard']").click(function(){
    self.port.emit("Clipboard", $("#items").val());
});

/* save to file */
$("input[name='save']").click(function(){
    self.port.emit("SaveText", $("#items").val());
});

/* print */
$("input[name='print']").click(function(){
    $('#printHelper').text($('textarea').val());
    window.print();
});
