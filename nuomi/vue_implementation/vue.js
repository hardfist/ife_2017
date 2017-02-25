class Event{
    constructor(){
        this.handlers = {}
    }
    on(type,cb){
        (this.handlers[type] || (this.handlers[type]=[])).push(cb)
    }
    emit(type,...args){
        const handlers = this.handlers[type] || []
        handlers.forEach(handler =>{
            handler(...args)
        })
    }
}
class Observer{
    constructor(data){
        this.data = data 
        this.event = new Event()
        this._convert(data)
        
    }
    $watch(key,cb){
        this.event.on(key,cb);
    }
    _convert(obj){
        let self = this 
        Object.keys(obj).forEach((key)=>{
        let val = obj[key]
        if(typeof val === 'object'){
            this._convert(val)
        }
        Object.defineProperty(obj,key,{
            enumerable: true,
            configurable: true,
            get : function(){
                return val 
            },
            set: function(newVal){
                if(val === newVal) return 
                if(typeof newVal === 'object'){
                    self._convert(newVal)
                }
                self.event.emit(key,newVal)
                val = newVal
            }
        })
    })
    }
}

exports.Observer = Observer
