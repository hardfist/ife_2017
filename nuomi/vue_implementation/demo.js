var WatchJS = require("watchjs")
var watch = WatchJS.watch;
var unwatch = WatchJS.unwatch;
var callWatchers = WatchJS.callWatchers;

//defining our object no matter which way we want
var ex = {
    l1a: "bla bla",
    l1b: {
        l2a: "lo lo",
        l2b: "hey hey"        
    }
};

watch(ex, function (prop, action, difference, oldvalue){

    console.log("prop: "+prop+"\n action: "+action+"\n difference: "+JSON.stringify(difference)+"\n old: "+JSON.stringify(oldvalue)+"\n ... and the context: "+JSON.stringify(this));    

}, 0, true);


ex.l1b.l2c = "new attr"; //it is not instantaneous, you may wait 50 miliseconds

setTimeout(function(){
    callWatchers(ex)
}, 100);
