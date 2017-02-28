"use strict";
(function (factory) {
    if (typeof exports === 'object') {
        module.exports = factory()
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        window.WatchJS = factory()
        window.watch = window.WatchJS.watch
        window.unwatch = window.WatchJS.unwatch
        window.callWatchers = window.WatchJS.callWatchers
    }
}(function () {

    // utility function 
    function isFunction(obj) {
        return Object.prototype.toString.call(obj) === '[object Function]'
    }
    function isArray(obj) {
        return Array.isArray(obj)
    }
    function defineProp(obj, propName, value) {
        try {
            Object.defineProperty(obj, propName, {
                enumerable: false,
                configurable: true,
                writable: false,
                value: value
            })
        } catch (err) {
            obj[propName] = value
        }
    }

    var WatchJS = {
        noMore: false
    }

    function watch(obj, prop, watcher) {
        if (arguments.length == 2) {
            watchAll.apply(this, arguments)
        } else if (isArray(arguments[1])) {
            watchMany.apply(this, arguments)
        } else {
            watchOne.apply(this, arguments)
        }
    }

    function watchAll(obj, watcher) {
        if (obj instanceof String || (!(obj instanceof Object) && !isArray(obj))) {
            return
        }
        var props = []
        if (isArray(obj)) {
            for (var prop = 0; prop < obj.length; prop++) {
                props.push(prop)
            }
        } else {
            for (var prop2 in obj) {
                props.push(prop2)
            }
        }
        watchMany(obj, props, watcher)
    }
    function watchOne(obj, prop, watcher) {
        if (obj[prop] === undefined || isFunction(obj[prop])) {
            return
        }
        if(obj[prop] !=null){
            watchAll(obj[prop],watcher) //嵌套watch
        }
        defineWatcher(obj, prop, watcher)
    }
    function watchMany(obj, props, watcher) {
        if (isArray(obj)) {
            for (var prop in props) {
                watchOne(obj, props[prop], watcher)
            }
        } else {
            for (var prop2 in props) {
                watchOne(obj, props[prop2], watcher)
            }
        }
    }
    function unwatch() {
        if(arguments.length ==2){
            unwatchAll.apply(this,arguments)
        }else if(isArray(arguments[1])){
            unwatchMany.apply(this,arguments)
        }else{
            unwatchOne.apply(this,arguments)
        }
    }

    function unwatchMany(obj,props,watcher){
        if(isArray(obj)){
            for(var prop in props){
                unwatchOne(obj,props[prop],watcher)
            }
        }else{
            for(var prop2 in props){
                unwatchOne(obj,props[prop2],watcher)
            }
        }
    }
    function unwatchAll(obj,watcher){
        if(obj instanceof String || (!(obj instanceof Object) && !isArray(obj))){
            return 
        }
        var props = []
        if(isArray(obj)){
            for(var prop =0;prop<obj.length;prop++){
                props.push(prop)
            }
        }else{
            for(var prop2 in obj){
                props.push(prop2)
            }
        }
        unwatchMany(obj,props,watcher)
    }
    function unwatchOne(obj,prop,watcher){
        var idx = obj.watchers[prop].indexOf(watcher)
        if(idx != -1){
            obj.watchers[prop].splice(idx,1)
        }
    }


    function callWatchers() {

    }
    function defineWatcher(obj, prop, watcher) {
        var val = obj[prop]
        watchArray(obj, prop) // 如果是数组，则对数组操作进行监听
        if (!obj.watchers) {
            defineProp(obj, 'watchers', {})
        }

        if (!obj.watchers[prop]) {
            obj.watchers[prop] = []
        }

        obj.watchers[prop].push(watcher)

        var getter = function () {
            return val
        }
        var setter = function (newval) {
            var oldval = val
            val = newval
            if (obj[prop]) {

            }
            if (JSON.stringify(oldval) !== JSON.stringify(newval)) {
                if(!WatchJS.noMore){
                    callWatchers(obj, prop, newval, oldval)
                    WatchJS.noMore = false 
                }
                
            }
        }
        Object.defineProperty(obj, prop, {
            get: getter,
            set: setter,
            enumerable: true,
            configurable: true
        })
    }



    var methodNames = ['pop', 'push', 'reverse', 'shift', 'sort', 'slice', 'unshift']

    var defineArrayMethodWatcher = function (obj, prop, original, methodName) {
        defineProp(obj[prop], methodName, function () {
            var response = original.apply(obj[prop], arguments)
            watchOne(obj, obj[prop])
            if (methodName !== 'slice') {
                callWatchers(obj, prop,methodName,arguments)
            }
            return response
        })
    }

    // 若对象属性为数组，对数组进行监听
    function watchArray(obj, prop) {
        if (!obj[prop] || (obj[prop] instanceof String) || (!isArray(obj[prop]))) {
            return
        }
        for (var i = 0; i < methodNames.length; i++) {
            var methodName = methodNames[i]
            defineArrayMethodWatcher(obj, prop, obj[prop][methodName], methodName)
        }
    }


    function callWatchers(obj, prop, newval, oldval) {
        obj.watchers[prop].forEach((cb) => {
            cb.call(obj, prop,"set", newval, oldval)
        })
    }

    WatchJS.watch = watch
    WatchJS.unwatch = unwatch
    WatchJS.callWatchers = callWatchers
    return WatchJS
}))