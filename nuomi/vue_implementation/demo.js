
var uid$1 = 0 
class Watcher{
    constructor(exp,vm,cb){
        this.exp = exp 
        this.cb = cb 
        this.vm = vm 

        this.value = null 
        this.getter = parseExpression(exp).get 
        this.uid = uid$1++ 
        this.update()
    }
    get(){
        Dep.target = this 
        
        var value = this.getter ? this.getter(this.vm) : ''
        
        Dep.target = null 
        return value 
    }
    update(){
        var newVal = this.get()
        if(this.value != newVal){
            this.cb && this.cb(newVal,this.value)
            this.value = newVal 
        }
    }
}




function isObject(obj){
    return obj != null && typeof(obj) === 'object'
}
function isPlainObject(obj){
    return Object.prototype.toString.call(obj) === '[object Object]'
}

function observe(data){
    if(!isObject(data) || !isPlainObject(data)){
        return 
    }
    return new Observer(data)
}
class Observer{
    constructor(data){
        this.data = data 
        this.transform(data)
    }
    transform(data){
        for(var key in data){
            this.defineReactive(data,key,data[key])
        }
    }
    defineReactive(data,key,val){
        var  dep = new Dep()
        Object.defineProperty(data,key,{
            enumerable : true,
            configurable : false,
            get : function(){
                console.log(`get ${key}:${val}`)
                if(Dep.target){
                    //收集订阅者
                    dep.addSub(Dep.target)
                }
                return val
            },
            set:function(newVal){
                console.log(`set ${key}:${newVal}`)
                if(newVal === val){
                    return 
                }
                val = newVal 
                observe(newVal)
                //发送事件给订阅者
                dep.notify(newVal)
            }
        })
        observe(value)
    }
}
class Dep {
    constructor(){
        this.subs = {}
    }
    addSub(target){
        if(!this.subs[target.uid]){
            this.subs[target.uid]= target
        }
    }
    notify(newVal){
        for(var uid in this.subs){
            this.subs[uid].update(newVal)
        }
    }
}
Dep.target = null 



class Vue {
    constructor(options){
        this.$data = options.data 
        this.$el = options.el 
        this._proxy(options.data)
        this._proxy(options.method)
        var ob = observe(this.$data)
        if(!ob) return 
        compile(options.el,this)
    }
    _proxy(data){
        var self = this 
        for(let key in data){
            Object.defineProperty(self,key,{
                get: function(){
                    return data[key]
                },
                set: function(newVal){
                    data[key] = newVal
                }
            })
        }
    }
}