var test = require('tape');
var Collection = require('../collection');
var underscoreMixins = require('../underscoreMixins');
var inBrowser = (typeof window !== 'undefined');
var restMixins = inBrowser ? require('../restMixins') : {};

test('basics', function (t) {
    var c = new Collection();
    var obj = {hey: 'there'};
    t.ok(c);
    c.add(obj);
    t.equals(c.length, 1);
    t.equals(c.at(0), obj);
    t.end();
});

test('indexes: should do `id` by default', function (t) {
    var c = new Collection();
    var obj = {id: '47'};
    var obj2 = {id: '48'};
    c.add([obj, obj2]);
    t.equal(c.get('47'), obj);
    t.equal(c.get('48'), obj2);
    t.end();
});

test('indexes: optionally create other indexes', function (t) {
    var C = Collection.extend({indexes: ['id', 'username']});
    var c = new C();
    var larry = {id: 1, username: 'larry'};
    var curly = {id: 2, username: 'curly'};
    var moe = {id: 3, username: 'moe'};
    c.add([larry, curly, moe]);

    t.equal(larry, c.get('larry', 'username'));
    t.equal(larry, c.get(1));
    t.equal(curly, c.get('curly', 'username'));
    t.equal(curly, c.get(2));
    t.equal(moe, c.get('moe', 'username'));
    t.equal(moe, c.get(3));
    t.end();
});

test('models: support for model constructors', function (t) {
    var Model = function (attributes) {
        this.attributes = attributes;
    };
    var C = Collection.extend({
        model: Model
    });
    var m = new Model({name: 'moe'});
    var plain = {name: 'moe'};
    var c = new C();
    c.add([plain, m]);
    t.equal(m, c.at(1));
    t.ok(c.at(0) instanceof Model);
    t.ok(c.at(1) instanceof Model);
    t.notEqual(plain, c.at(0));
    t.end();
});

test('extend: multi-extend for easy mixins', function (t) {
    var hey = {hey: function () {return 'hey';}};
    var hi = {hi: function () {return 'hi';}};
    var C = Collection.extend(hey, hi);
    var c = new C();
    t.equal(c.hey(), 'hey');
    t.equal(c.hi(), 'hi');
    var C2 = C.extend({woah: function () {return 'woah';}});
    var c2 = new C2();
    t.equal(c2.woah(), 'woah');
    t.end();
});

test('underscore mixins: should be able easily add underscore mixins', function (t) {
    var C = Collection.extend(underscoreMixins);
    var larry = {name: 'larry'};
    var curly = {name: 'curly'};
    var moe = {name: 'moe'};
    var c = new C([larry, curly, moe]);

    var filtered = c.filter(function (stooge) {
        return stooge.name.length === 5;
    });
    t.equal(filtered.length, 2);
    var sorted = c.sortBy('name');
    t.equal(sorted[0], curly);
    t.end();
});

// only run these in a browser (npm start open browser)
if (inBrowser) {
    test('rest mixins: should be able to extend to be restful collection', function (t) {
        var C = Collection.extend(restMixins, {
            url: '/test/stooges.json'
        });
        var c = new C();
        c.fetch();
    });
}
