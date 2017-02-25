var obj = {}
var val = 100
Object.defineProperty(obj, 'age', {
    enumerable: true,
    configurable: true,
    get: function () {
        return val
    }, 
    set:function(newVal) {
        val = newVal
    }
})
console.log('set' in Object.getOwnPropertyDescriptor(obj,'age'))