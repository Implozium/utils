const Common = require('./common');
const { expect } = require('chai');
const sinon = require('sinon');
const fs = require('fs');

describe('Common', () => {
    describe('#parseCSVLine', () => {
        it('пустая строка', () => {
            expect(Common.parseCSVLine(''))
                .to.eql(['']);
        });
        it('строка с разделителями', () => {
            expect(Common.parseCSVLine('a,b,c'))
                .to.eql(['a', 'b', 'c']);
        });
        it('строка с разделителями с пустыми значениями', () => {
            expect(Common.parseCSVLine('a,,c'))
                .to.eql(['a', '', 'c']);
        });
        it('строка с разделителями и оборачивателями', () => {
            expect(Common.parseCSVLine('a,"b","c"'))
                .to.eql(['a', 'b', 'c']);
        });
        it('строка с разделителями и оборачивателями с пустыми значениями', () => {
            expect(Common.parseCSVLine('a,"","c"'))
                .to.eql(['a', '', 'c']);
        });
        it('строка с разделителями и оборачивателями c разделителями внутри', () => {
            expect(Common.parseCSVLine('a,"b,b","c"'))
                .to.eql(['a', 'b,b', 'c']);
        });
        it('строка с разделителями и оборачивателями c оборачивателями внутри', () => {
            expect(Common.parseCSVLine('a,"""b""","c"'))
                .to.eql(['a', '"b"', 'c']);
        });
        it('строка с разделителями и оборачивателями c оборачивателями и разделителями внутри', () => {
            expect(Common.parseCSVLine('a,""",b,""","c"'))
                .to.eql(['a', '",b,"', 'c']);
        });
        it('строка с разделителями и оборачивателями c оборачивателями и разделителями внутри, с другими разделителями', () => {
            expect(Common.parseCSVLine('a;""";b;""";"c"', ';'))
                .to.eql(['a', '";b;"', 'c']);
        });
        it('строка с незакрытой кавычкой', () => {
            expect(Common.parseCSVLine('a,",c'))
                .to.eql(['a', ',c']);
        });
        it('строка с символами перед кавычкой', () => {
            expect(Common.parseCSVLine('a,b"b"b,c'))
                .to.eql(['a', 'bbb', 'c']);
        });
    });

    describe('#stringifyCSVLine', () => {
        it('пустой массив', () => {
            expect(Common.stringifyCSVLine([]))
                .to.equal('');
        });
        it('массив из строк', () => {
            expect(Common.stringifyCSVLine(['a', 'b', 'c']))
                .to.equal('a,b,c');
        });
        it('массив из цифр', () => {
            expect(Common.stringifyCSVLine([1, 2, 3]))
                .to.equal('1,2,3');
        });
        it('массив из строк и цифр', () => {
            expect(Common.stringifyCSVLine(['a', 2, 'c']))
                .to.equal('a,2,c');
        });
        it('массив с разделителями', () => {
            expect(Common.stringifyCSVLine(['a', ',b', 'c']))
                .to.equal('a,",b",c');
        });
        it('массив с разделителями и оборачивателями', () => {
            expect(Common.stringifyCSVLine(['a', '",b', 'c']))
                .to.equal('a,""",b",c');
        });
    });

    describe('#collect', () => {
        it('пустой массив', () => {
            expect(Common.collect([], 3))
                .to.eql([]);
        });
        it('массив из 3 элементов', () => {
            expect(Common.collect([1, 2, 3], 3))
                .to.eql([[1, 2, 3]]);
        });
        it('массив из 4 элементов', () => {
            expect(Common.collect([1, 2, 3, 4], 3))
                .to.eql([[1, 2, 3], [4]]);
        });
        it('массив из 7 элементов', () => {
            expect(Common.collect([1, 2, 3, 4, 5, 6, 7], 3))
                .to.eql([[1, 2, 3], [4, 5, 6], [7]]);
        });
    });

    describe('#collectObj', () => {
        it('пустой объект', () => {
            expect(Common.collectObj({}, 3))
                .to.eql([]);
        });
        it('объект из 3 элементов', () => {
            expect(Common.collectObj({a: 1, b: 2, c: 3}, 3))
                .to.eql([{a: 1, b: 2, c: 3}]);
        });
        it('объект из 4 элементов', () => {
            expect(Common.collectObj({a: 1, b: 2, c: 3, d: 4}, 3))
                .to.eql([{a: 1, b: 2, c: 3}, {d: 4}]);
        });
        it('объект из 7 элементов', () => {
            expect(Common.collectObj({a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7}, 3))
                .to.eql([{a: 1, b: 2, c: 3}, {d: 4, e: 5, f: 6}, {g: 7}]);
        });
    });

    describe('#groupArrToObjBySameKeyValue', () => {
        it('пустой массив', () => {
            expect(Common.groupArrToObjBySameKeyValue([], 'a'))
                .to.eql({});
        });
        it('массив из объектов', () => {
            expect(Common.groupArrToObjBySameKeyValue([{a: 1, b: 2}, {a: 2, b: 3}, {a: 3, b: 2}], 'b'))
                .to.eql({2: [{a: 1, b: 2}, {a: 3, b: 2}], 3: [{a: 2, b: 3}]});
        });
        it('массив из объектов без указаного ключа', () => {
            expect(Common.groupArrToObjBySameKeyValue([{a: 1, b: 2}, {a: 2, b: 3}, {a: 3, b: 2}], 'c'))
                .to.eql({undefined: [{a: 1, b: 2}, {a: 2, b: 3}, {a: 3, b: 2}]});
        });
    });

    describe('#maxmin', () => {
        it('пустой массив', () => {
            expect(Common.maxmin([], 0))
                .to.be.null;
        });
        it('массив из чисел больше заданого', () => {
            expect(Common.maxmin([1, 2, 3], 0))
                .to.be.null;
        });
        it('массив из чисел меньше заданого', () => {
            expect(Common.maxmin([-1, -2, -3], 0))
                .to.equal(-1);
        });
        it('массив с данными', () => {
            expect(Common.maxmin([-1, 2, 12, 23, 11, 8], 10))
                .to.equal(8);
        });
    });
    
    describe('#minmax', () => {
        it('пустой массив', () => {
            expect(Common.minmax([], 0))
                .to.be.null;
        });
        it('массив из чисел больше заданого', () => {
            expect(Common.minmax([1, 2, 3], 0))
                .to.equal(1);
        });
        it('массив из чисел меньше заданого', () => {
            expect(Common.minmax([-1, -2, -3], 0))
                .to.be.null;
        });
        it('массив с данными', () => {
            expect(Common.minmax([-1, 2, 12, 23, 11, 8], 10))
                .to.equal(11);
        });
    });
    
    describe('#mapArrayForDistanceOfDeltas', () => {
        it('пустой массив', () => {
            expect(Common.mapArrayForDistanceOfDeltas([]))
                .to.eql([]);
        });
        it('массив из 1 числа', () => {
            expect(Common.mapArrayForDistanceOfDeltas([100]))
                .to.eql([0]);
        });
        it('массив с данными', () => {
            expect(Common.mapArrayForDistanceOfDeltas([-1, 2, 12, 23, 11, 8]))
                .to.eql([0, 64, 128, 192, 96, 80]);
        });
        it('массив с повторяющимися данными', () => {
            expect(Common.mapArrayForDistanceOfDeltas([-1, 2, 12, 23, 11, 8, 8]))
                .to.eql([0, 64, 128, 192, 96, 80, 80]);
        });
        it('массив с данными и расстоянием', () => {
            expect(Common.mapArrayForDistanceOfDeltas([-1, 2, 12, 23, 11, 8], 10))
                .to.eql([0, 10, 20, 30, 15, 12.5]);
        });
    });
    
    describe('#handleParallel', () => {
        describe('#функция возвращает промис', () => {
            it('пустой массив', (done) => {
                const arr = [];
                const onEachElement = sinon.stub().resolvesArg(0);
                Common.handleParallel(arr, onEachElement)
                    .then((results) => {
                        expect(onEachElement.called)
                            .to.be.false;
                        expect(results)
                            .to.eql([]);
                        done();
                    })
                    .catch(done);
            });
            it('массив из 1 числа', (done) => {
                const arr = [1];
                const onEachElement = sinon.stub().resolvesArg(0);
                Common.handleParallel(arr, onEachElement)
                    .then((results) => {
                        expect(onEachElement.callCount)
                            .to.equal(1);
                        expect(results)
                            .to.eql([1]);
                        done();
                    })
                    .catch(done);
            });
            it('массив с данными', (done) => {
                const arr = [1, 2, 3, 4];
                const onEachElement = sinon.stub().resolvesArg(0);
                Common.handleParallel(arr, onEachElement)
                    .then((results) => {
                        expect(onEachElement.callCount)
                            .to.equal(4);
                        expect(results)
                            .to.eql([1, 2, 3, 4]);
                        done();
                    })
                    .catch(done);
            });
            it('выброс исключения', (done) => {
                const arr = [1];
                const onEachElement = sinon.stub().rejects('Error');
                Common.handleParallel(arr, onEachElement)
                    .then((results) => {
                        done(new Error());
                    })
                    .catch((err) => {
                        expect(onEachElement.callCount)
                            .to.equal(1);
                        expect(err)
                            .to.be.instanceof(Error);
                        done();
                    });
            });
            it('выброс исключения на 3 элементе', (done) => {
                const arr = [1, 2, 3, 4, 5];
                const onEachElement = sinon.stub();
                onEachElement.withArgs(3, 2).rejects('Error');
                onEachElement.resolvesArg(0);
                Common.handleParallel(arr, onEachElement, 2)
                    .then((results) => {
                        done(new Error());
                    })
                    .catch((err) => {
                        expect(err)
                            .to.be.instanceof(Error);
                        done();
                    });
            });
        });
        describe('#функция не возвращает промис', () => {
            it('массив с данными', (done) => {
                const arr = [1, 2, 3, 4];
                const onEachElement = sinon.stub().returnsArg(0);
                Common.handleParallel(arr, onEachElement)
                    .then((results) => {
                        expect(onEachElement.callCount)
                            .to.equal(4);
                        expect(results)
                            .to.eql([1, 2, 3, 4]);
                        done();
                    })
                    .catch(done);
            });
            it('выброс исключения', (done) => {
                const arr = [1];
                const onEachElement = sinon.stub().throws('Error');
                Common.handleParallel(arr, onEachElement)
                    .then((results) => {
                        done(new Error());
                    })
                    .catch((err) => {
                        expect(onEachElement.callCount)
                            .to.equal(1);
                        expect(err)
                            .to.be.instanceof(Error);
                        done();
                    });
            });
            it('выброс исключения на 3 элементе', (done) => {
                const arr = [1, 2, 3, 4, 5];
                const onEachElement = sinon.stub();
                onEachElement.withArgs(3, 2).throws('Error');
                onEachElement.returnsArg(0);
                Common.handleParallel(arr, onEachElement, 2)
                    .then((results) => {
                        done(new Error());
                    })
                    .catch((err) => {
                        expect(err)
                            .to.be.instanceof(Error);
                        done();
                    });
            });
        });
        describe('#параллельный запуск 3', () => {
            it('пустой массив', (done) => {
                const arr = [];
                const onEachElement = sinon.stub().resolvesArg(0);
                Common.handleParallel(arr, onEachElement, 3)
                    .then((results) => {
                        expect(onEachElement.called)
                            .to.be.false;
                        expect(results)
                            .to.eql([]);
                        done();
                    })
                    .catch(done);
            });
            it('массив из 1 числа', (done) => {
                const arr = [1];
                const onEachElement = sinon.stub().resolvesArg(0);
                Common.handleParallel(arr, onEachElement, 3)
                    .then((results) => {
                        expect(onEachElement.callCount)
                            .to.equal(1);
                        expect(results)
                            .to.eql([1]);
                        done();
                    })
                    .catch(done);
            });
            it('массив с данными', (done) => {
                const arr = [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4];
                const onEachElement = sinon.stub().resolvesArg(0);
                Common.handleParallel(arr, onEachElement, 3)
                    .then((results) => {
                        expect(onEachElement.callCount)
                            .to.equal(12);
                        expect(results)
                            .to.eql([1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4]);
                        done();
                    })
                    .catch(done);
            });
        });
    });

    describe('#handleParallelWithCatchingError', () => {
        describe('#функция возвращает промис', () => {
            it('пустой массив', (done) => {
                const arr = [];
                const onEachElement = sinon.stub().resolvesArg(0);
                Common.handleParallelWithCatchingError(arr, onEachElement)
                    .then((results) => {
                        expect(onEachElement.called)
                            .to.be.false;
                        expect(results)
                            .to.eql([]);
                        done();
                    })
                    .catch(done);
            });
            it('массив из 1 числа', (done) => {
                const arr = [1];
                const onEachElement = sinon.stub().resolvesArg(0);
                Common.handleParallelWithCatchingError(arr, onEachElement)
                    .then((results) => {
                        expect(onEachElement.callCount)
                            .to.equal(1);
                        expect(results)
                            .to.eql([[1, undefined]]);
                        done();
                    })
                    .catch(done);
            });
            it('массив с данными', (done) => {
                const arr = [1, 2, 3, 4];
                const onEachElement = sinon.stub().resolvesArg(0);
                Common.handleParallelWithCatchingError(arr, onEachElement)
                    .then((results) => {
                        expect(onEachElement.callCount)
                            .to.equal(4);
                        expect(results)
                            .to.eql([[1, undefined], [2, undefined], [3, undefined], [4, undefined]]);
                        done();
                    })
                    .catch(done);
            });
            it('выброс исключения', (done) => {
                const arr = [1];
                const onEachElement = sinon.stub().rejects(-1);
                Common.handleParallelWithCatchingError(arr, onEachElement)
                    .then((results) => {
                        expect(onEachElement.callCount)
                            .to.equal(1);
                        expect(results)
                            .to.eql([[undefined, -1]]);
                        done();
                    })
                    .catch(done);
            });
            it('выброс исключения на 3 элементе', (done) => {
                const arr = [1, 2, 3, 4, 5];
                const onEachElement = sinon.stub();
                onEachElement.withArgs(3, 2).rejects(-1);
                onEachElement.resolvesArg(0);
                Common.handleParallelWithCatchingError(arr, onEachElement, 2)
                    .then((results) => {
                        expect(onEachElement.callCount)
                            .to.equal(5);
                        expect(results)
                            .to.eql([[1, undefined], [2, undefined], [undefined, -1], [4, undefined], [5, undefined]]);
                        done();
                    })
                    .catch(done);
            });
        });
        describe('#функция не возвращает промис', () => {
            it('массив с данными', (done) => {
                const arr = [1, 2, 3, 4];
                const onEachElement = sinon.stub().returnsArg(0);
                Common.handleParallelWithCatchingError(arr, onEachElement)
                    .then((results) => {
                        expect(onEachElement.callCount)
                            .to.equal(4);
                        expect(results)
                            .to.eql([[1, undefined], [2, undefined], [3, undefined], [4, undefined]]);
                        done();
                    })
                    .catch(done);
            });
            it('выброс исключения', (done) => {
                const arr = [1];
                const onEachElement = sinon.stub().throws(-1);
                Common.handleParallelWithCatchingError(arr, onEachElement)
                    .then((results) => {
                        expect(onEachElement.callCount)
                            .to.equal(1);
                        expect(results)
                            .to.eql([[undefined, -1]]);
                        done();
                    })
                    .catch(done);
            });
            it('выброс исключения на 3 элементе', (done) => {
                const arr = [1, 2, 3, 4, 5];
                const onEachElement = sinon.stub();
                onEachElement.withArgs(3, 2).throws(-1);
                onEachElement.returnsArg(0);
                Common.handleParallelWithCatchingError(arr, onEachElement, 2)
                    .then((results) => {
                        expect(onEachElement.callCount)
                            .to.equal(5);
                        expect(results)
                            .to.eql([[1, undefined], [2, undefined], [undefined, -1], [4, undefined], [5, undefined]]);
                        done();
                    })
                    .catch(done);
            });
        });
        describe('#параллельный запуск 3', () => {
            it('пустой массив', (done) => {
                const arr = [];
                const onEachElement = sinon.stub().resolvesArg(0);
                Common.handleParallelWithCatchingError(arr, onEachElement, 3)
                    .then((results) => {
                        expect(onEachElement.called)
                            .to.be.false;
                        expect(results)
                            .to.eql([]);
                        done();
                    })
                    .catch(done);
            });
            it('массив из 1 числа', (done) => {
                const arr = [1];
                const onEachElement = sinon.stub().resolvesArg(0);
                Common.handleParallelWithCatchingError(arr, onEachElement, 3)
                    .then((results) => {
                        expect(onEachElement.callCount)
                            .to.equal(1);
                        expect(results)
                            .to.eql([[1, undefined]]);
                        done();
                    })
                    .catch(done);
            });
            it('массив с данными', (done) => {
                const arr = [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4];
                const onEachElement = sinon.stub().resolvesArg(0);
                Common.handleParallelWithCatchingError(arr, onEachElement, 3)
                    .then((results) => {
                        expect(onEachElement.callCount)
                            .to.equal(12);
                        expect(results)
                            .to.eql([[1, undefined], [2, undefined], [3, undefined], [4, undefined], [1, undefined], [2, undefined], [3, undefined], [4, undefined], [1, undefined], [2, undefined], [3, undefined], [4, undefined]]);
                        done();
                    })
                    .catch(done);
            });
        });
    });
});