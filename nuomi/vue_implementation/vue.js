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

    // 事件对象
    class Event {
        constructor(parent = null) {
            this.handlers = {}
            this._parent = parent
        }
        on(type, cb) {
            (this.handlers[type] || (this.handlers[type] = [])).push(cb)
        }
        off(type, fn) {
            if (type === undefined) {
                this.handlers = {}
            }
            if (fn === undefined) {
                this.handlers[type] = []
            }
            let handlers = this.handlers[type] || []
            let idx = handlers.indexOf(handlers)
            if (idx !== -1) {
                handlers.splice(idx, 1)
            }
        }
        emit(type, ...args) {
            const handlers = this.handlers[type] || []
            handlers.forEach(handler => {
                handler(...args)
            })
        }
        notify(type, ...args) {
            this.emit(type, ...args)
            if (this._parent != null) {
                this._parent.emit(type, ...args)
            }
        }
    }

    //观察者对象
    class Observer extends Event {
        constructor(data, parent = null) {
            super(parent)
            this.data = data
            this._convert(data)
        }
        static create(value, parent = null) {
            return new Observer(value, parent)
        }
        $watch(key, cb) {
            this.on(`set:${key}`, cb);
        }
        _convert(obj) {
            let self = this
            Object.keys(obj).forEach((key) => {
                let val = obj[key]
                if (typeof val === 'object') {
                    obj[key] = new Observer(val, self)
                }
                if (Array.isArray(val)) {
                    const aryMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']
                    const arrayAugmentations = []
                    aryMethods.forEach((method) => {
                        let original = Array.prototype[method]
                        arrayAugmentations[method] = function () {
                            let val = original.apply(this, arguments)
                            self.notify('set', key, val)
                            self.notify(`set:${key}`, key, val)
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
                            val = new Observer(newVal, self)
                        } else {
                            val = newVal
                        }
                        self.notify(`set`, key, val)
                        self.notify(`set:${key}`, key, val)
                    }
                })
            })
        }
    }

    let fragment, currentNodeList = []
    class Vue {
        constructor(options) {
            this.$options = options
            this.$data = options.data
            this.$el = document.querySelector(options.el)
            this.$template = this.$el.cloneNode(true)

            //创建观察对象
            this.observer = Observer.create(this.$data)
            this.observer.on('set', this.$mount.bind(this))

            //挂载
            this.$mount()
        }
        $mount() {
            console.log('rerender')
            this._compile()
        }
        _compile() {
            fragment = document.createDocumentFragment()
            currentNodeList.push(fragment)
            this._compileNode(this.$template)

            this.$el.parentNode.replaceChild(fragment, this.$el)
            this.$el = document.querySelector(this.$options.el)
        }
        _compileNode(node) {
            switch (node.nodeType) {
                //node
                case 1:
                    this._compileElement(node)
                    break
                // text
                case 3:
                    this._compileText(node)
                    break
                default:
                    return
            }
        }
        _compileText(node) {
            let self = this 
            const reg = /{{([^}]*)}}/g
            let content = node.textContent.replace(reg, function (word, prop) {
                console.log('prop:',prop)
                console.log('data:',self.$data)
                return self._getField(prop)
            })
            currentNodeList[currentNodeList.length - 1].appendChild(document.createTextNode(content))
        }
        _compileElement(node) {
            let newNode = document.createElement(node.tagName)
            if (node.hasAttributes()) {
                let attrs = node.attributes
                for (let attr of attrs) {
                    newNode.setAttribute(attr.name, attr.value)
                }
            }
            let currentNode = currentNodeList[currentNodeList.length - 1].appendChild(newNode)
            if (node.hasChildNodes()) {
                currentNodeList.push(currentNode)
                for (let childNode of node.childNodes) {
                    this._compileNode(childNode)
                }
            }
        }
        _getField(props){
            let list = props.split('.')
            let model = this.$data || {}
            for(let i=0;i<list.length;i++){
                if(model != null){
                    model = model[list[i]]
                }
            }
            return model 
        }
    }

    class Batcher {
        constructor() {
            this.reset()
        }
        reset() {
            this.has = {}
            this.queue = []
            this.wating = false
        }
        push(job) {
            if (!this.has[job.id]) {
                this.queue.push(job)
                this.has[job.id] = job
                if (!this.wating) {
                    this.wating = true
                    setTimeout(() => {
                        this.flush()
                    })
                }
            }
        }
        flush() {
            this.queue.forEach((job) => {
                job.cb.call(job.ctx)
            })
            this.reset()
        }
    }

    class Directive {
        constructor(name, el, vm, expression) {
            this.name = name
            this.vm = vm
            this.expression = expression
            this.attr = 'nodeValue'
            this.update()
        }
        update() {
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
