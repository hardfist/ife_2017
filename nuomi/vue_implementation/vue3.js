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

let app2 = new Observer({
    name: {
        firstName: 'shaofeng',
        lastName: 'liang'
    },
    age: 25
});

app2.$watch('name', function (newName) {
    console.log('我的姓名发生了变化，可能是姓氏变了，也可能是名字变了。')
});

app2.data.name.firstName = 'hahaha';
// 输出：我的姓名发生了变化，可能是姓氏变了，也可能是名字变了。
app2.data.name.lastName = 'blablabla';
// 输出：我的姓名发生了变化，可能是姓氏变了，也可能是名字变了。