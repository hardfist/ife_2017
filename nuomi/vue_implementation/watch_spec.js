let assert = require('assert')
let chai = require('chai')
let spies = require('chai-spies')
chai.use(spies)
let should = chai.should()
let expect = chai.expect

var WatchJS = require('./watch')
var watch = WatchJS.watch
var unwatch = WatchJS.unwatch
var callWatchers = WatchJS.callWatchers



describe('#测试对象属性变化', function () {
    it('单个属性测试', function () {
        var ex1 = {
            attr1: "initial value of attr1",
            attr2: "initial value of attr2"
        }
        var cnt = 0
        watch(ex1, "attr1", function () {
            cnt++;
        })
        assert.equal(cnt, 0)
        ex1.attr1 = "other value"
        assert.equal(cnt, 1)
    })
    it('数组操作测试', function () {
        var ex = {
            arr: [1, 2, 3]
        }
        var cnt = 0
        watch(ex, function () {
            cnt++
        })
        assert.equal(cnt, 0)
        ex.arr.push('test')
        assert.equal(cnt, 1)
    })
    it('嵌套属性变化', function () {
        var ex = {
            user: {
                name: 'yj'
            }
        }
        var cnt = 0
        watch(ex, function () {
            cnt++
        })
        assert.equal(cnt, 0)
        ex.user.name = 'ty'
        assert.equal(cnt, 1)
    })
    it('多个属性变化', function () {
        var ex2 = {
            attr1: 0,
            attr2: 0,
            attr3: 0
        }
        var cnt = 0
        watch(ex2, ["attr2", "attr3"], function () {
            cnt++;
        })
        assert.equal(cnt, 0)
        ex2.attr2 = 50
        assert.equal(cnt, 1)
        ex2.attr3 = 100
        assert.equal(cnt, 2)
    })
    it('所有属性变化', function () {
        var ex3 = {
            attr1: 0,
            attr2: "initial value of attr2",
            attr3: ["a", 3, null]
        }
        var cnt = 0
        watch(ex3, function () {
            cnt++
        })
        ex3.attr1 = 1
        assert.equal(cnt, 1)
        ex3.attr2 = "change"
        assert.equal(cnt, 2)
        ex3.attr3.push('test')
        assert.equal(cnt, 3)
    })

    it('删除watcher', function () {
        var cnt1 = 0, cnt2 = 0
        var obj = {
            name: "yj",
            age: 20,
            alert1: function () {
                cnt1++;
            },
            alert2: function () {
                cnt2++
            }
        }
        watch(obj, "name", obj.alert1)
        watch(obj, "name", obj.alert2)
        assert.equal(cnt1, 0)
        assert.equal(cnt2, 0)

        obj.name = 'test'
        assert.equal(cnt1, 1)
        assert.equal(cnt2, 1)
        unwatch(obj, "name", obj.alert1)
        obj.name = "test2"
        assert.equal(cnt1, 1)
        assert.equal(cnt2, 2)
    })
    it('watchJS更多的信息', function () {
        var ex1 = {
            attr1: "initial value of attr1",
            attr2: "initial value of attr2"
        };

        //defining a 'watcher' for an attribute
        watch(ex1, "attr1", function (prop, action, newvalue, oldvalue) {
            assert.equal(prop,"attr1")
            assert.equal(action,"set")
            assert.equal(newvalue,"other value")
            assert.equal(oldvalue,"initial value of attr1")
        });

        //when changing the attribute its watcher will be invoked
        ex1.attr1 = "other value"
    })

    it('无限循环',function(){
        var ex1 = {
            attr1 : "initial value of attr1",
            attr2 : "initial value of attr2"
        }
        var cnt = 0 
        assert.equal(cnt,0)
        watch(ex1,"attr1",function(){
            cnt++
            assert.equal(cnt,1)
            WatchJS.noMore = true 
            ex1.attr1 +=" + 1"
        })
        ex1.attr1 = "other value to 1"
    })
})