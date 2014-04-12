console.log("hello, world");
self.port.on("message", function(addonsNames) {
    for (var i=0; i<addonsNames.length; ++i){
        $("#Names").append(
            $("<li>").append(addonsNames[i])
        );
    }
});

