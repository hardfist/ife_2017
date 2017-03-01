class Vue{
    _initData(){
        var dataFn = this.$options.data 
        var data = this._data = dataFn ? dataFn() : {}
        if(!isPlainObject(data)){
            data = {}
            
        }
        var props = this._props 
        var keys = Object.keys(data)

        var i,key 
        i = keys.length 
        while(i--){
            key = keys[i]
            if(!props || !hasOwn(props,key)){
                this._proxy(key)
            }else if(process.env.NODE_ENV !== 'production'){

            }
        }
        observe(data,this)
    }
    _proxy(key){
        if(!isReversed(key)){
            var self = this 
            Object.defineProperty(self,key,{
                configurable : true,
                enumerable : true,
                get : function proxyGetter(){
                    return self._data[key]
                },
                set: function proxySetter(val){
                    self._data[key] = val 
                }
            })
        }
    }
}


function observe(){
    var ob = new Observer(value)
    ob.addVm(vm)
    return ob
}
class Observer{
    constructor(value){
        this.value = value 
        this.dep = new Dep()

        if(isArray(value)){
            var augment = hasProto ? protoAugment : copyAugment 
            augment(value,arrayMethods,arrayKeys)
        }else{
            this.walk(value)
        }
    }
    walk(obj){
        var keys = Object.keys(obj)
        for(var i=0;i<keys.length;i++){
            this.convert(keys[i],obj[keys[i]])
        }
    }
    convert(key,val){
        defineReactive(this.value,key,value)
    }
}
function defineReactive(obj,key,val){
    var dep = new Dep()
    var property = Object.getOwnPropertyDescriptor(obj,key)
    if(property && property.configurable === false){
        return 
    }

    var getter = property && property.get 
    var setter = property && property.set 

    Object.defineProperty(obj,key,{
        enumerable : true,
        configurable : true,
        get : function reactiveGetter(){
            var value = getter ? getter.call(obj) : val 
            if(Dep.target){
                dep.depend()
                if(childOb){
                    childOb.dep.depend()
                }
                if(isArray(value)){
                    for(var e,i=0,l=value.length;i<l;i++){
                        e = value[i]
                        e && e.__ob__ && e.__ob__.dep.depend()
                    }
                }
            }
            return value
        },
        set: function reactiveSetter(newVal){
            var value = getter ? getter.call(obj): val 
            if(newVal === value){
                return 
            }
            if(setter){
                setter.call(obj,newVal)
            }else{
                val = newVal 
            }
            childOb = observe(newVal)
            dep.notify()
        }
    })
}

class Dep{
    constructor(){
        this.id = uid++ 
        this.subs = []
    }
    depend(){
        Dep.target.addDep(this)
    }
    notify(){
        var subs =toArray(this.subs)
        for(var i=0;i<subs.length;i++){
            subs[i].update()
        }
    }
}