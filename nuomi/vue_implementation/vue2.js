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
        this._convert(data)
        this.event = new Event()
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
                console.log(`你访问了 ${key}`)
                return val 
            },
            set: function(newVal){
                console.log(`你设置了 ${key},新的值是${newVal}`)
                if(val === newVal) return 
                self.event.emit(key,newVal)
                val = newVal
            }
        })
    })
    }
}
let app1 = new Observer({
  name: 'youngwind',
  age: 25
});
app1.$watch('age',function(age){
    console.log(`我年纪变了，现在是：${age}岁了`)
})
app1.data.age = 100