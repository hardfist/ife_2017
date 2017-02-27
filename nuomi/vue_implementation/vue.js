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
        constructor(data) {
            this.data = data
            this.event = new Event()
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
                    this._convert(val)
                }
                if (Array.isArray(val)) {
                    const aryMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']
                    const arrayAugmentations = []
                    aryMethods.forEach((method) => {
                        let original = Array.prototype[method]
                        arrayAugmentations[method] = function () {
                            let val = original.apply(this, arguments)
                            self.event.emit(key, val)
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
                        if (val === newVal) return
                        if (typeof newVal === 'object') {
                            self._convert(newVal)
                        }
                        self.event.emit(key, newVal)
                        val = newVal
                    }
                })
            })
        }
    }
    class Vue {
        constructor(config) {
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
    return {
        Observer,
        Vue
    }
})
