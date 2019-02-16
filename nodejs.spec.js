const Nodejs = require('./nodejs');
const { expect } = require('chai');
const sinon = require('sinon');
const fs = require('fs');

describe('Nodejs', () => {
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
            Nodejs.readFile(fileName + '.' + fileNameType, spy)
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
            Nodejs.readFile(fileName + '.' + fileNameType, spy)
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
            Nodejs.readFile(fileName + '.' + fileNameType, spy)
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
            Nodejs.splitFile(fileName, fileNameType, (line, count) => {
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
            Nodejs.splitFile(fileName, fileNameType, (line, count) => {
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
            Nodejs.readFiles(dirname, fileNameType, onEachFileStub, onEachLineSpy)
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
            Nodejs.readFiles(dirname, fileNameType, onEachFileStub, onEachLineSpy)
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