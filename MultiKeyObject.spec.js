const MultiKeyObject = require('./MultiKeyObject');
const { expect } = require('chai');

describe('MultiKeyObject', () => {
    describe('#constructor', () => {
        it('без параметров', () => {
            const multiKeyObject = new MultiKeyObject();
            expect(multiKeyObject.object).to.eql({});
        });
        it('с параметром', () => {
            const multiKeyObject = new MultiKeyObject({a: {b: 4}, c: 3});
            expect(multiKeyObject.object).to.eql({a: {b: 4}, c: 3});
        });
    });
    describe('#prepareKeys', () => {
        it('массив', () => {
            expect(MultiKeyObject.prepareKeys(['a', 'b', 'c']))
                .to.eql(['a', 'b', 'c']);
        });
        it('строка', () => {
            expect(MultiKeyObject.prepareKeys('a.b.c'))
                .to.eql(['a', 'b', 'c']);
        });
        it('строка с другим разделитем', () => {
            expect(MultiKeyObject.prepareKeys('a/b/c', '/'))
                .to.eql(['a', 'b', 'c']);
        });
        it('пустой массив', () => {
            expect(() => MultiKeyObject.prepareKeys([])).to.throw(Error);
        });
        it('пустая строка', () => {
            expect(() => MultiKeyObject.prepareKeys('')).to.throw(Error);
        });
    });
    describe('#set', () => {
        it('без вложености', () => {
            const multiKeyObject = new MultiKeyObject();
            multiKeyObject.set(['a'], 14);
            expect(multiKeyObject.object).to.eql({a: 14});
        });
        it('двойная вложеность', () => {
            const multiKeyObject = new MultiKeyObject();
            multiKeyObject.set(['a', 'b'], 4);
            expect(multiKeyObject.object).to.eql({a: {b: 4}});
        });
        it('тройная вложеность и дополнение', () => {
            const multiKeyObject = new MultiKeyObject();
            multiKeyObject
                .set(['a', 'b'], 4)
                .set(['a', 'b', 'c'], 4);

            expect(multiKeyObject.object).to.eql({a: {b: {c: 4}}});
        });
        it('тройная вложеность и дополнение (ключи заданы в виде строки)', () => {
            const multiKeyObject = new MultiKeyObject();
            multiKeyObject
                .set('a.b', 4)
                .set('a.b.c', 4);

            expect(multiKeyObject.object).to.eql({a: {b: {c: 4}}});
        });
        it('пустой массив с ключами', () => {
            const multiKeyObject = new MultiKeyObject();
            expect(() => multiKeyObject.set([], 4)).to.throw(Error);
        });
    });
    describe('#get', () => {
        it('без вложености', () => {
            const multiKeyObject = new MultiKeyObject({a: {b: {c: 4}}});
            expect(multiKeyObject.get(['a'])).to.eql({b: {c: 4}});
        });
        it('двойная вложеность', () => {
            const multiKeyObject = new MultiKeyObject({a: {b: {c: 4}}});
            expect(multiKeyObject.get(['a', 'b'])).to.eql({c: 4});
        });
        it('тройная вложеность', () => {
            const multiKeyObject = new MultiKeyObject({a: {b: {c: 4}}});
            expect(multiKeyObject.get(['a', 'b', 'c'])).to.eql(4);
        });
        it('искомого ключа нет', () => {
            const multiKeyObject = new MultiKeyObject({a: {b: {c: 4}}});
            expect(multiKeyObject.get(['a', 'c', 'c'])).to.be.undefined;
        });
        it('искомого ключа нет в не объекте', () => {
            const multiKeyObject = new MultiKeyObject({a: {b: {c: 4}}});
            expect(multiKeyObject.get(['a', 'b', 'c', 'd'])).to.be.undefined;
        });
        it('искомого ключа нет в не объекте с null в пути', () => {
            const multiKeyObject = new MultiKeyObject({a: {b: {c: null}}});
            expect(multiKeyObject.get(['a', 'b', 'c', 'd'])).to.be.undefined;
        });
        it('искомого ключа нет в не объекте с undefined в пути', () => {
            const multiKeyObject = new MultiKeyObject({a: {b: {c: undefined}}});
            expect(multiKeyObject.get(['a', 'b', 'c', 'd'])).to.be.undefined;
        });
        it('пустой массив с ключами', () => {
            const multiKeyObject = new MultiKeyObject({a: {b: {c: 4}}});
            expect(() => multiKeyObject.get([])).to.throw(Error);
        });
    });
    describe('#has', () => {
        it('без вложености', () => {
            const multiKeyObject = new MultiKeyObject({a: {b: {c: 4}}});
            expect(multiKeyObject.has(['a'])).to.be.true;
        });
        it('тройная вложеность', () => {
            const multiKeyObject = new MultiKeyObject({a: {b: {c: 4}}});
            expect(multiKeyObject.has(['a', 'b', 'c'])).to.be.true;
        });
        it('искомого ключа нет', () => {
            const multiKeyObject = new MultiKeyObject({a: {b: {c: 4}}});
            expect(multiKeyObject.has(['a', 'c', 'c'])).to.be.false;
        });
        it('пустой массив с ключами', () => {
            const multiKeyObject = new MultiKeyObject({a: {b: {c: 4}}});
            expect(() => multiKeyObject.has([])).to.throw(Error);
        });
    });
    describe('#delete', () => {
        describe('без рекурсии', () => {
            it('без вложености', () => {
                const multiKeyObject = new MultiKeyObject({a: {b: {c: 4}}});
                expect(multiKeyObject.delete(['a'])).to.be.true;
                expect(multiKeyObject.object).to.eql({});
            });
            it('двойная вложеность', () => {
                const multiKeyObject = new MultiKeyObject({a: {b: {c: 4}}});
                expect(multiKeyObject.delete(['a', 'b'])).to.be.true;
                expect(multiKeyObject.object).to.eql({a: {}});
            });
            it('тройная вложеность', () => {
                const multiKeyObject = new MultiKeyObject({a: {b: {c: 4}}});
                expect(multiKeyObject.delete(['a', 'b', 'c'])).to.be.true;
                expect(multiKeyObject.object).to.eql({a: {b: {}}});
            });
            it('искомого ключа нет', () => {
                const multiKeyObject = new MultiKeyObject({a: {b: {c: 4}}});
                expect(multiKeyObject.delete(['a', 'c', 'c'])).to.be.false;
                expect(multiKeyObject.object).to.eql({a: {b: {c: 4}}});
            });
            it('пустой массив с ключами', () => {
                const multiKeyObject = new MultiKeyObject({a: {b: {c: 4}}});
                expect(() => multiKeyObject.delete([])).to.throw(Error);
            });
        });
        describe('с рекурсией', () => {
            it('без вложености', () => {
                const multiKeyObject = new MultiKeyObject({a: {b: {c: 4}}});
                expect(multiKeyObject.delete(['a'], true)).to.be.true;
                expect(multiKeyObject.object).to.eql({});
            });
            it('двойная вложеность', () => {
                const multiKeyObject = new MultiKeyObject({a: {b: {c: 4}}});
                expect(multiKeyObject.delete(['a', 'b'], true)).to.be.true;
                expect(multiKeyObject.object).to.eql({});
            });
            it('двойная вложеность многоключного объекта', () => {
                const multiKeyObject = new MultiKeyObject({a: 1, b: {c: 4}});
                expect(multiKeyObject.delete(['b', 'c'], true)).to.be.true;
                expect(multiKeyObject.object).to.eql({a: 1});
            });
            it('двойная вложеность многоключного объекта и искомого ключа нет', () => {
                const multiKeyObject = new MultiKeyObject({a: 1, b: {c: 4}});
                expect(multiKeyObject.delete(['a', 'a'], true)).to.be.false;
                expect(multiKeyObject.object).to.eql({a: 1, b: {c: 4}});
            });
            it('тройная вложеность', () => {
                const multiKeyObject = new MultiKeyObject({a: {b: {c: 4}}});
                expect(multiKeyObject.delete(['a', 'b', 'c'], true)).to.be.true;
                expect(multiKeyObject.object).to.eql({});
            });
            it('искомого ключа нет', () => {
                const multiKeyObject = new MultiKeyObject({a: {b: {c: 4}}});
                expect(multiKeyObject.delete(['a', 'c', 'c'], true)).to.be.false;
                expect(multiKeyObject.object).to.eql({a: {b: {c: 4}}});
            });
            it('пустой массив с ключами', () => {
                const multiKeyObject = new MultiKeyObject({a: {b: {c: 4}}});
                expect(() => multiKeyObject.delete([])).to.throw(Error);
            });
        });
    });
    describe('#generateForEachKey', () => {
        it('пустой объект', () => {
            expect(Array.from(MultiKeyObject.generateForEachKey({})))
                .to.eql([]);
        });
        it('единичная вложеность', () => {
            expect(Array.from(MultiKeyObject.generateForEachKey({a: 4, d: 8})))
                .to.eql([[['a'], 4], [['d'], 8]]);
        });
        it('двойная вложеность', () => {
            expect(Array.from(MultiKeyObject.generateForEachKey({a: {b: 4}, d: {e: 4}})))
                .to.eql([[['a', 'b'], 4], [['d', 'e'], 4]]);
        });
        it('двойная вложеность с двумя объектами', () => {
            expect(Array.from(MultiKeyObject.generateForEachKey({a: {b: 1, c: 2}, d: {e: 3, f: 4}})))
                .to.eql([[['a', 'b'], 1], [['a', 'c'], 2], [['d', 'e'], 3], [['d', 'f'], 4]]);
        });
        it('единичная вложеность с пустым объектом', () => {
            expect(Array.from(MultiKeyObject.generateForEachKey({a: {}, d: {}})))
                .to.eql([[['a'], {}], [['d'], {}]]);
        });
    });
    describe('#makeArrayForEachKey', () => {
        it('пустой объект', () => {
            expect(MultiKeyObject.makeArrayForEachKey({}))
                .to.eql([]);
        });
        it('единичная вложеность', () => {
            expect(MultiKeyObject.makeArrayForEachKey({a: 4, d: 8}))
                .to.eql([[['a'], 4], [['d'], 8]]);
        });
        it('двойная вложеность', () => {
            expect(MultiKeyObject.makeArrayForEachKey({a: {b: 4}, d: {e: 4}}))
                .to.eql([[['a', 'b'], 4], [['d', 'e'], 4]]);
        });
        it('двойная вложеность с двумя объектами', () => {
            expect(MultiKeyObject.makeArrayForEachKey({a: {b: 1, c: 2}, d: {e: 3, f: 4}}))
                .to.eql([[['a', 'b'], 1], [['a', 'c'], 2], [['d', 'e'], 3], [['d', 'f'], 4]]);
        });
        it('единичная вложеность с пустым объектом', () => {
            expect(MultiKeyObject.makeArrayForEachKey({a: {}, d: {}}))
                .to.eql([[['a'], {}], [['d'], {}]]);
        });
    });
    describe('#keys', () => {
        it('пустой объект', () => {
            const multiKeyObject = new MultiKeyObject();
            expect(Array.from(multiKeyObject.keys()))
                .to.eql([]);
        });
        it('заполненный объект', () => {
            const multiKeyObject = new MultiKeyObject({a: {b: 1, c: 2}, d: {e: 3, f: 4}, j: {}});
            expect(Array.from(multiKeyObject.keys()))
                .to.eql([['a', 'b'], ['a', 'c'], ['d', 'e'], ['d', 'f'], ['j']]);
        });
    });
    describe('#entries', () => {
        it('пустой объект', () => {
            const multiKeyObject = new MultiKeyObject();
            expect(Array.from(multiKeyObject.entries()))
                .to.eql([]);
        });
        it('заполненный объект', () => {
            const multiKeyObject = new MultiKeyObject({a: {b: 1, c: 2}, d: {e: 3, f: 4}, j: {}});
            expect(Array.from(multiKeyObject.entries()))
                .to.eql([[['a', 'b'], 1], [['a', 'c'], 2], [['d', 'e'], 3], [['d', 'f'], 4], [['j'], {}]]);
        });
    });
    describe('#values', () => {
        it('пустой объект', () => {
            const multiKeyObject = new MultiKeyObject();
            expect(Array.from(multiKeyObject.values()))
                .to.eql([]);
        });
        it('заполненный объект', () => {
            const multiKeyObject = new MultiKeyObject({a: {b: 1, c: 2}, d: {e: 3, f: 4}, j: {}});
            expect(Array.from(multiKeyObject.values()))
                .to.eql([1, 2, 3, 4, {}]);
        });
    });
});