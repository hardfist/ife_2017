var WatchJS = require("watchjs")
var watch = WatchJS.watch;
var unwatch = WatchJS.unwatch;
var callWatchers = WatchJS.callWatchers;

//defining our object no matter which way we want
var ex1 = {
    attr1: "initial value of attr1",
    attr2: "initial value of attr2"
};

//defining a 'watcher' for an attribute
watch(ex1, "attr1", function (prop, action, newvalue, oldvalue) {
    console.log(prop + " - action: " + action + " - new: " + newvalue + ", old: " + oldvalue + "... and the context: " + JSON.stringify(this));
});

//when changing the attribute its watcher will be invoked
ex1.attr1 = "other value"