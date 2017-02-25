let vue = require('./vue.js')
let assert = require('assert')
let chai = require('chai')
let spies = require('chai-spies')
let Observer = vue.Observer

chai.use(spies)
let should = chai.should()
let expect = chai.expect


describe('动态数据绑定(一)', function () {
    let app1 = new Observer({
        name: 'youngwind',
        age: 25
    });

    let app2 = new Observer({
        university: 'bupt',
        major: 'computer'
    });
    it('should be gettter/setter', function () {
        assert.equal('set' in Object.getOwnPropertyDescriptor(app1.data, 'name'), true)
    })
    it('should reutrn the origin val', function () {
        assert.equal(app1.data.name, 'youngwind')
        assert.equal(app1.data.age, 25)
        assert.equal(app2.data.university, 'bupt')
        assert.equal(app2.data.major, 'computer')
    })
    it('should return the newVal', function () {
        app1.data.age = 100;
        app2.data.major = 'science'

        assert.equal(app1.data.age, 100)
        assert.equal(app2.data.major, 'science')
    })

})
describe('动态数据绑定(二)', function () {

    it('newVal should be responsive', function () {
        let app1 = new Observer({
            name: 'youngwind',
            age: 25
        });

        app1.data.name = {
            lastName: 'liang',
            firstName: 'shaofeng'
        };
       assert.equal('set' in Object.getOwnPropertyDescriptor(app1.data,'name'),true)

    })

    it('callback should be called', function () {
        let app1 = new Observer({
            name: 'youngwind',
            age: 25
        })
        function callback() {
        }
        let spy = chai.spy(callback)
        app1.$watch('age', spy);
        app1.data.age = 100
        expect(spy).to.have.been.called()
    })
})
describe('动态数据绑定(三)', function () {

})