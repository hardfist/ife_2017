; (function (name, definition) {
    var hasDefine = typeof define === 'function'
    var hasExports = typeof module !== 'undefined' && module.exports
    if (hasDefine) {
        define(definition)
    } else if (hasExports) {
        module.exports = definition();
    } else {
        this[name] = definition()
    }
})('vue', function () {


    // 常用函数

    function eq(a, b) {
        const typeA = Object.prototype.toString.call(a).slice(8, -1).toLowerCase()
        const typeB = Object.prototype.toString.call(b).slice(8, -1).toLowerCase()
        if (typeA !== typeB) return false
        if (typeA === 'function') {
            let k1 = Object.keys(a)
            let k2 = Object.keys(b)
            if (k1.length !== k2.length) return false
            k1.sort()
            k2.sort()
            for (let i = 0; i < k1.length; i++) {
                if (!eq(k1[i], k2[i])) {
                    return false
                }
            }
            return true
        }
        if (typeA === 'array') {
            if (a.length != b.length) return false
            a.sort()
            b.sort()
            for (let i = 0; i < a.length; i++) {
                if (!eq(a[i], b[i])) {
                    return false
                }
            }
            return true
        }
        return a === b
    }

    class Event {
        constructor() {
            this.handlers = {}
        }
        on(type, cb) {
            (this.handlers[type] || (this.handlers[type] = [])).push(cb)
        }
        emit(type, ...args) {
            const handlers = this.handlers[type] || []
            handlers.forEach(handler => {
                handler(...args)
            })
        }
    }
    class Observer {
        constructor(data,parent=null) {
            this.data = data
            this.event = new Event()
            this._parent = parent 
            this._convert(data)
        }
        $watch(key, cb) {
            this.event.on(key, cb);
        }
        _convert(obj) {
            let self = this
            Object.keys(obj).forEach((key) => {
                let val = obj[key]
                if (typeof val === 'object') {
                    obj[key] = new Observer(val,self)
                }
                if (Array.isArray(val)) {
                    const aryMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']
                    const arrayAugmentations = []
                    aryMethods.forEach((method) => {
                        let original = Array.prototype[method]
                        arrayAugmentations[method] = function () {
                            let val = original.apply(this, arguments)
                            self.event.emit(key, val)
                            if(self._parent !=null){
                                self._parent.event.emit(key,val)
                            }
                            return val
                        }
                    })
                    val.__proto__ = arrayAugmentations
                }
                Object.defineProperty(obj, key, {
                    enumerable: true,
                    configurable: true,
                    get: function () {
                        return val
                    },
                    set: function (newVal) {
                        if (eq(val, newVal)) return
                        if (typeof newVal === 'object') {
                            val = new Observer(newVal,self)
                        }else{
                            val = newVal
                        }
                        self.event.emit(key, val)
                        if(self._parent !=null){
                            self._parent.event.emit(key,val)
                        }
                    }
                })
            })
        }
    }
    class Vue {
        constructor(config) {
            let self = this 
            const $el = document.querySelector(config.el)
            const data = config.data || {}
            this._render($el, data)
        }
        _getField(model, prop) {
            let keys = prop.split('.')
            for (let key of keys) {
                if (model[key] == null) {
                    return
                } else {
                    model = model[key]
                }
            }
            return model
        }
        _render(el, model) {
            const reg = /{{([^}]*)}}/g
            let self = this
            //文本节点替换文本内容
            if (el.nodeType == 3) {
                el.textContent = el.textContent.replace(reg, function (word, prop) {
                    return self._getField(model, prop)
                })
            } else {
                //非文本节点替换属性内容
                let attributes = Array.prototype.slice.call(el.attributes)
                for (let attr of attributes) {
                    let value = attr.value
                    value = value.replace(reg, function (work, prop) {
                        return self._getField(model, prop)
                    })
                    attr.value = value
                }
            }

            // 递归替换子节点
            let childNodes = Array.prototype.slice.call(el.childNodes)
            for (let child of childNodes) {
                self._render(child, model)
            }
        }
    
    }

    class Batcher{
        constructor(){
            this.reset() 
        }
        reset(){
            this.has  = {}
            this.queue = []
            this.wating = false 
        }
        push(job){
            if(!this.has[job.id]){
                this.queue.push(job)
                this.has[job.id] = job 
                if(!this.wating){
                    this.wating = true 
                    setTimeout(()=>{
                        this.flush()
                    })
                }
            }
        }
        flush(){
            this.queue.forEach((job)=>{
                job.cb.call(job.ctx)
            })
            this.reset()
        }
    }

    class Directive{
        constructor(name,el,vm,expression){
            this.name = name 
            this.vm = vm 
            this.expression = expression
            this.attr = 'nodeValue'
            this.update()
        }
        update(){
            this.el[this.attr] = this.vm.$data[this.expression]
            console.log(`更新了Dom-${this.expression}`)
        }
    }
    return {
        Observer,
        Vue,
        Batcher
    }
})
