const OutputStreams = require('./OutputStreams');
const { expect } = require('chai');
const fs = require('fs');

describe('OutputStreams', () => {
    const files = ['a.test.csv', 'b.test.csv', 'c.test.csv'];

    describe('#add', () => {
        it('добавление', (done) => {
            const outputStreams = new OutputStreams();
    
            outputStreams.add('a', files[0])
                .then((outputStreams) => outputStreams.add('b', files[1]))
                .then((outputStreams) => outputStreams.add('c', files[2]))
                .then((outputStreams) => outputStreams.closeAll())
                .then((outputStreams) => {
                    expect(files.every(file => fs.existsSync(file))).to.be.true;
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
    });

    describe('#init', () => {
        it('создание с пустым объектом', (done) => {
            const outputStreams = new OutputStreams();
    
            outputStreams.init({})
                .then((outputStreams) => outputStreams.closeAll())
                .then((outputStreams) => {
                    expect(outputStreams).to.exist;
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
        it('создание', (done) => {
            const outputStreams = new OutputStreams();
    
            outputStreams.init({a: files[0], b: files[1], c: files[2]})
                .then((outputStreams) => outputStreams.closeAll())
                .then((outputStreams) => {
                    expect(files.every(file => fs.existsSync(file))).to.be.true;
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
    });

    describe('#write', () => {
        it('запись в файл', (done) => {
            const outputStreams = new OutputStreams();
    
            outputStreams.init({a: files[0], b: files[1], c: files[2]})
                .then((outputStreams) => {
                    outputStreams
                        .write('a', '1')
                        .write('a', '2')
                        .write('a', '3')
                        .write('b', '1')
                        .write('b', '2');
                    return outputStreams;
                })
                .then((outputStreams) => outputStreams.closeAll())
                .then((outputStreams) => {
                    expect(fs.readFileSync(files[0], 'utf8')).to.equal('123');
                    expect(fs.readFileSync(files[1], 'utf8')).to.equal('12');
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });

        it('запись в файл больше чем количество частей', (done) => {
            const outputStreams = new OutputStreams({maxChunks: 3});
    
            outputStreams.init({a: files[0], b: files[1], c: files[2]})
                .then((outputStreams) => {
                    outputStreams
                        .write('a', '1')
                        .write('a', '2')
                        .write('a', '3')
                        .write('a', '4')
                        .write('a', '5');
                    return outputStreams;
                })
                .then((outputStreams) => outputStreams.closeAll())
                .then((outputStreams) => {
                    expect(fs.readFileSync(files[0], 'utf8')).to.equal('12345');
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
    });

    describe('#force', () => {
        it('запись в файл части', (done) => {
            const outputStreams = new OutputStreams();
    
            outputStreams.init({a: files[0], b: files[1], c: files[2]})
                .then((outputStreams) => {
                    outputStreams
                        .write('a', '1')
                        .write('a', '2')
                        .write('a', '3')
                        .force('a');
                    return outputStreams;
                })
                .then((outputStreams) => outputStreams.closeAll())
                .then((outputStreams) => {
                    expect(fs.readFileSync(files[0], 'utf8')).to.equal('123');
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
    });

    describe('#writeTo', () => {
        it('запись в произвольный файл', (done) => {
            const outputStreams = new OutputStreams();
    
            outputStreams.init({a: files[0]})
                .then((outputStreams) => {
                    outputStreams
                        .writeTo(files[1], '1')
                        .writeTo(files[1], '2')
                        .writeTo(files[1], '3')
                        .writeTo(files[2], '1')
                        .writeTo(files[2], '2')
                    return outputStreams;
                })
                .then((outputStreams) => outputStreams.closeAll())
                .then((outputStreams) => {
                    expect(fs.readFileSync(files[1], 'utf8')).to.equal('123');
                    expect(fs.readFileSync(files[2], 'utf8')).to.equal('12');
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
    });

    afterEach((done) => {
        files.forEach((file) => {
            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
            }
        });
        setTimeout(done, 10);
    });
});