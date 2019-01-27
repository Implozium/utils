const Utils = require('./utils');
const { assert, expect } = require('chai');
const sinon = require('sinon');
const fs = require('fs');

describe('Utils', () => {
    describe('#parseCSVLine', () => {
        it('пустая строка', () => {
            expect(Utils.parseCSVLine(''))
                .to.eql(['']);
        });
        it('строка с разделителями', () => {
            expect(Utils.parseCSVLine('a,b,c'))
                .to.eql(['a', 'b', 'c']);
        });
        it('строка с разделителями с пустыми значениями', () => {
            expect(Utils.parseCSVLine('a,,c'))
                .to.eql(['a', '', 'c']);
        });
        it('строка с разделителями и оборачивателями', () => {
            expect(Utils.parseCSVLine('a,"b","c"'))
                .to.eql(['a', 'b', 'c']);
        });
        it('строка с разделителями и оборачивателями с пустыми значениями', () => {
            expect(Utils.parseCSVLine('a,"","c"'))
                .to.eql(['a', '', 'c']);
        });
        it('строка с разделителями и оборачивателями c разделителями внутри', () => {
            expect(Utils.parseCSVLine('a,"b,b","c"'))
                .to.eql(['a', 'b,b', 'c']);
        });
        it('строка с разделителями и оборачивателями c оборачивателями внутри', () => {
            expect(Utils.parseCSVLine('a,"""b""","c"'))
                .to.eql(['a', '"b"', 'c']);
        });
        it('строка с разделителями и оборачивателями c оборачивателями и разделителями внутри', () => {
            expect(Utils.parseCSVLine('a,""",b,""","c"'))
                .to.eql(['a', '",b,"', 'c']);
        });
        it('строка с разделителями и оборачивателями c оборачивателями и разделителями внутри, с другими разделителями', () => {
            expect(Utils.parseCSVLine('a;""";b;""";"c"', ';'))
                .to.eql(['a', '";b;"', 'c']);
        });
        it('строка с незакрытой кавычкой', () => {
            expect(Utils.parseCSVLine('a,",c'))
                .to.eql(['a', ',c']);
        });
        it('строка с символами перед кавычкой', () => {
            expect(Utils.parseCSVLine('a,b"b"b,c'))
                .to.eql(['a', 'bbb', 'c']);
        });
    });

    describe('#stringifyCSVLine', () => {
        it('пустой массив', () => {
            expect(Utils.stringifyCSVLine([]))
                .to.equal('');
        });
        it('массив из строк', () => {
            expect(Utils.stringifyCSVLine(['a', 'b', 'c']))
                .to.equal('a,b,c');
        });
        it('массив из цифр', () => {
            expect(Utils.stringifyCSVLine([1, 2, 3]))
                .to.equal('1,2,3');
        });
        it('массив из строк и цифр', () => {
            expect(Utils.stringifyCSVLine(['a', 2, 'c']))
                .to.equal('a,2,c');
        });
        it('массив с разделителями', () => {
            expect(Utils.stringifyCSVLine(['a', ',b', 'c']))
                .to.equal('a,",b",c');
        });
        it('массив с разделителями и оборачивателями', () => {
            expect(Utils.stringifyCSVLine(['a', '",b', 'c']))
                .to.equal('a,""",b",c');
        });
    });

    describe('#collect', () => {
        it('пустой массив', () => {
            expect(Utils.collect([], 3))
                .to.eql([]);
        });
        it('массив из 3 элементов', () => {
            expect(Utils.collect([1, 2, 3], 3))
                .to.eql([[1, 2, 3]]);
        });
        it('массив из 4 элементов', () => {
            expect(Utils.collect([1, 2, 3, 4], 3))
                .to.eql([[1, 2, 3], [4]]);
        });
        it('массив из 7 элементов', () => {
            expect(Utils.collect([1, 2, 3, 4, 5, 6, 7], 3))
                .to.eql([[1, 2, 3], [4, 5, 6], [7]]);
        });
    });

    describe('#collectObj', () => {
        it('пустой объект', () => {
            expect(Utils.collectObj({}, 3))
                .to.eql([]);
        });
        it('объект из 3 элементов', () => {
            expect(Utils.collectObj({a: 1, b: 2, c: 3}, 3))
                .to.eql([{a: 1, b: 2, c: 3}]);
        });
        it('объект из 4 элементов', () => {
            expect(Utils.collectObj({a: 1, b: 2, c: 3, d: 4}, 3))
                .to.eql([{a: 1, b: 2, c: 3}, {d: 4}]);
        });
        it('объект из 7 элементов', () => {
            expect(Utils.collectObj({a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7}, 3))
                .to.eql([{a: 1, b: 2, c: 3}, {d: 4, e: 5, f: 6}, {g: 7}]);
        });
    });

    describe('#groupArrToObjBySameKeyValue', () => {
        it('пустой массив', () => {
            expect(Utils.groupArrToObjBySameKeyValue([], 'a'))
                .to.eql({});
        });
        it('массив из объектов', () => {
            expect(Utils.groupArrToObjBySameKeyValue([{a: 1, b: 2}, {a: 2, b: 3}, {a: 3, b: 2}], 'b'))
                .to.eql({2: [{a: 1, b: 2}, {a: 3, b: 2}], 3: [{a: 2, b: 3}]});
        });
        it('массив из объектов без указаного ключа', () => {
            expect(Utils.groupArrToObjBySameKeyValue([{a: 1, b: 2}, {a: 2, b: 3}, {a: 3, b: 2}], 'c'))
                .to.eql({undefined: [{a: 1, b: 2}, {a: 2, b: 3}, {a: 3, b: 2}]});
        });
    });

    describe('#readFile', () => {
        const fileName = 'readFile.test';
        const fileNameType = 'csv';
        const fileContent = 
`group,name,value
managers,Union,31
managers,Jane,26
managers,Max,45

clients,Jack,41
clients,Kite,54
designers,Fray,27`;

        it('чтение пустого файла', (done) => {
            fs.writeFileSync(fileName + '.' + fileNameType, '');
            const spy = sinon.spy();
            Utils.readFile(fileName + '.' + fileNameType, spy)
                .then((amount) => {
                    expect(spy.callCount).to.equal(0);
                    expect(amount).to.equal(0);
                    done();
                })
                .catch(err => {done(err);});
        });
        it('чтение файла', (done) => {
            fs.writeFileSync(fileName + '.' + fileNameType, fileContent);
            const spy = sinon.spy();
            Utils.readFile(fileName + '.' + fileNameType, spy)
                .then((amount) => {
                    expect(spy.callCount).to.equal(8);
                    expect(amount).to.equal(8);
                    done();
                })
                .catch(err => {done(err);});
        });
        it('чтение файла с пустой последней строкой', (done) => {
            fs.writeFileSync(fileName + '.' + fileNameType, fileContent + '\n');
            const spy = sinon.spy();
            Utils.readFile(fileName + '.' + fileNameType, spy)
                .then((amount) => {
                    expect(spy.callCount).to.equal(8);
                    expect(amount).to.equal(8);
                    done();
                })
                .catch(err => {done(err);});
        });

        afterEach(() => {
            if (fs.existsSync(fileName + '.' + fileNameType)) {
                fs.unlinkSync(fileName + '.' + fileNameType);
            }
        });
    });

    describe('#splitFile', () => {
        const fileName = 'splitFile.test';
        const fileNameType = 'csv';
        const fileContent = 
`group,name,value
managers,Union,31
managers,Jane,26
managers,Max,45

clients,Jack,41
clients,Kite,54
designers,Fray,27`;

        it('разбиение пустого файла', (done) => {
            fs.writeFileSync(fileName + '.' + fileNameType, '');
            Utils.splitFile(fileName, fileNameType, (line, count) => {
                return line ? line[0] : undefined;
            })
                .then((amount) => {
                    expect(fs.existsSync(fileName)).to.be.true;
                    expect(fs.readdirSync(fileName).length).to.equal(0);
                    expect(amount).to.equal(0);
                    done();
                })
                .catch(err => {done(err);});
        });
        it('разбиение файла', (done) => {
            fs.writeFileSync(fileName + '.' + fileNameType, fileContent);
            Utils.splitFile(fileName, fileNameType, (line, count) => {
                return line ? line[0] : undefined;
            })
                .then((amount) => {
                    const files = fs.readdirSync(fileName);
                    expect(fs.existsSync(fileName)).to.be.true;
                    expect(files.length).to.equal(4);
                    expect(files).to.have.members(['g.csv', 'm.csv', 'c.csv', 'd.csv']);
                    expect(fs.readFileSync(fileName + '/' + 'g.csv', 'utf8').split('\n').length)
                        .to.equal(1 + 1);
                    expect(fs.readFileSync(fileName + '/' + 'm.csv', 'utf8').split('\n').length)
                        .to.equal(3 + 1);
                    expect(fs.readFileSync(fileName + '/' + 'c.csv', 'utf8').split('\n').length)
                        .to.equal(2 + 1);
                    expect(fs.readFileSync(fileName + '/' + 'd.csv', 'utf8').split('\n').length)
                        .to.equal(1 + 1);
                    expect(amount).to.equal(8);
                    done();
                })
                .catch(err => {done(err);});
        });

        afterEach(() => {
            if (fs.existsSync(fileName + '.' + fileNameType)) {
                fs.unlinkSync(fileName + '.' + fileNameType);
            }
            if (fs.existsSync(fileName)) {
                const files = fs.readdirSync(fileName);
                files.forEach(file => fs.unlinkSync(fileName + '/' + file));
                fs.rmdirSync(fileName);
            }
        });
    });

    describe('#readFiles', () => {
        const dirname = 'splitFile.test';
        const fileNameType = 'csv';
        const filesContent = {
            'g.csv': `group,name,value`,
            'm.csv': `managers,Union,31
managers,Jane,26
managers,Max,45`,
            'c.csv': `clients,Jack,41
clients,Kite,54`,
            'd.line': `designers,Fray,27`,
            'j.csv': ``
        };

        it('чтение пустого каталога', (done) => {
            if (!fs.existsSync(dirname)) {
                fs.mkdirSync(dirname);
            }
            const onEachFileStub = sinon.stub().callsArg(1);
            const onEachLineSpy = sinon.spy();
            Utils.readFiles(dirname, fileNameType, onEachFileStub, onEachLineSpy)
                .then((amount) => {
                    expect(onEachFileStub.callCount).to.equal(0);
                    expect(onEachLineSpy.callCount).to.equal(0);
                    expect(amount).to.equal(0);
                    done();
                })
                .catch(err => {done(err);});
        });
        it('чтение каталога с файлами', (done) => {
            if (!fs.existsSync(dirname)) {
                fs.mkdirSync(dirname);
            }
            Object.keys(filesContent)
                .forEach((file) => fs.writeFileSync(dirname + '/' + file, filesContent[file]));
            const onEachFileStub = sinon.stub().callsArg(1);
            const onEachLineSpy = sinon.spy();
            Utils.readFiles(dirname, fileNameType, onEachFileStub, onEachLineSpy)
                .then((amount) => {
                    expect(onEachFileStub.callCount).to.equal(4);
                    expect(onEachLineSpy.callCount).to.equal(6);
                    expect(amount).to.equal(6);
                    done();
                })
                .catch(err => {done(err);});
        });

        afterEach(() => {
            if (fs.existsSync(dirname)) {
                const files = fs.readdirSync(dirname);
                files.forEach(file => fs.unlinkSync(dirname + '/' + file));
                fs.rmdirSync(dirname);
            }
        });
    });
});