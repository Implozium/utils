const fs = require('fs');
const readline = require('readline');
const OutputStreams = require('./OutputStreams');
const MultiKeyObject = require('./MultiKeyObject');
const Common = require('./common');

const Nodejs = {
    /**
     * Возвращает количество занимаемой памяти в виде строки
     * @return {string}
     */
    getMemory() {
        const memory = process.memoryUsage().rss;
        const mem = [Math.floor(memory / 1000000) + 'MB', Math.floor((memory % 1000000) / 1000) + 'KB', Math.floor((memory % 1000)) + 'B'];
        return mem.map(e => (' '.repeat(7) + e).slice(-7)).join(' ');
    },

    /**
     * Производит построчное считывание файла
     * @param {string} filename имя файла
     * @param {function (string, number)} onEachLine функция, которая будет вызвана для каждой строки с параметрами:
     *      `line` - строка;
     *      `count` - номер строки по счету
     * @param {object} options объект с опциями, с ключами:
     *      @param {boolean=} options.infoOnEnd - для уведомления о завершении чтения файла;
     *      @param {number=} options.infoOnRow - для уведомления о прочтении `infoOnRow` строк файла
     * @return {Promise.<number>} промис, который завершиться по окончанию обработки файла, с количеством строк в файле
     */
    readFile(filename, onEachLine, options = {}) {
        //return new Promise((res, rej) => {});
        return new Promise((res, rej) => {
            const time = Date.now();
            let iterationTime = Date.now();
            let count = 0;

            readline.createInterface({
                input: fs.createReadStream(filename)
            }).on('close', () => {
                if (options.infoOnEnd) {
                    console.log(`Всего прочитано из файла: ${filename}, количество в файле: ${count}, время: ${Date.now() - time} мс`);
                }
                res(count);
            }).on('line', (line) => {
                if (options.infoOnRow && count && count % options.infoOnRow === 0) {
                    console.log(`Прочитано: ${count}, занятая память: ${this.getMemory()}, время: ${Date.now() - iterationTime} мс`);
                    iterationTime = Date.now();
                }
                onEachLine(line, count);
                count++;
            });
        });
    },

    /**
     * Разбивает файл на подфайлы. Для каждой строки вызывается функция `toFile`, которая определяет возвращаемым значением куда записать строку из файла, в конце каждого файла есть пустая строка
     * @param {string} filename имя исходного файла, без расширения
     * @param {string} type расширение файла и для подфайлов
     * @param {function (string, number): string | void} toFile должна возвращать имя файла в который будет произведена запись или `undefined` в случае, если эту строку нужно пропустить
     * @param {object} options объект с опциями, с ключами:
     *      @param {boolean=} options.infoOnEnd - для уведомления о завершении чтения файла;
     *      @param {number=} options.infoOnRow - для уведомления о прочтении `infoOnRow` строк файла
     * @return {Promise.<number>} промис, который завершиться по окончанию обработки файла, с количеством строк в файле
     */
    splitFile(filename, type, toFile, options = {}) {
        let outputStreams;
        if (!fs.existsSync(filename)) {
            fs.mkdirSync(filename);
        }
        return this
            .makeOutputStreams({})
            .then((oStreams) => {
                outputStreams = oStreams;
            })
            .then(() => {
                return this.readFile(filename + '.' + type, (line, count) => {
                    const prefix = toFile(line, count);
                    if (prefix !== undefined) {
                        outputStreams.writeTo(filename + '/' + String(prefix) + '.' + type, line + '\n');
                    }
                }, options);
            })
            .then((amount) => outputStreams.closeAll().then(() => amount));
    },

    /**
     * Читает последовательно файлы в каталоге
     * и для каждого файла вызывает функцию **onEachFile**
     * и для каждой строки в нем вызывает функцию **onEachLine**
     * @param {string} dirname имя каталога
     * @param {string} type расширение файлов в каталоге
     * @param {function (string, function (Error=): void): void} onEachFile функция, которая будет вызвана для каждого файла с параметрами:
     *      **name** - имя файла, без разрешения;
     *      **done** - коллбек, который необходимо вызвать для начала чтения файла
     * @param {function (string, string, number): void} onEachLine функция, которая будет вызвана для каждой строки с параметрами:
     *      **name** - имя файла, без разрешения;
     *      **line** - строка;
     *      **count** - номер строки по счету
     * @param {object} options объект с опциями, с ключами:
     *      @param {boolean=} options.infoOnEnd - для уведомления о завершении чтения файла;
     *      @param {number=} options.infoOnRow - для уведомления о прочтении `infoOnRow` строк файла
     * @return {Promise.<number>} промис, который завершиться по окончанию обработки файла, с количеством строк в файлах
     */
    readFiles(dirname, type, onEachFile, onEachLine, options = {}) {
        const files = fs.readdirSync(dirname)
            .filter(filename => new RegExp(`\.${type}$`).test(filename));
        let allAmount = 0;

        return files.reduce((promise, file) => {
            return promise.then(() => {
                const name = file.replace(new RegExp(`\.${type}$`), '');

                return new Promise((res, rej) => {
                    onEachFile(name, (err) => err ? rej(err) : res());
                }).then(() => {
                    return Nodejs.readFile(
                        dirname + '/' + file,
                        (line, count) => onEachLine(name, line, count),
                        options
                    )
                        .then(amount => allAmount += amount);
                });
            });
        }, Promise.resolve(0));
    },

    /**
     * создает OutStreams для манипуляции с выводом и инициализирует его
     * @param {{}} streams объект со структурой <ключ>:<путь_к_файлу>
     * @return {Promise} промис, который завершиться по окончанию инициализации OutStreams
     */
    makeOutputStreams(streams) {
        return new OutputStreams().init(streams);
    },

    /**
     * Инициализирует CLI
     * @param {Object.<string, {title: string, func: function (string[], function (string): void): void}>} commands объект с командами, со структурой:
     *      <команда>: {title: '<описание>', func: (args, done) => {}}, где **args** - массив аргументов указаной команды, **done** необходимо вызвать по завершении работы
     */
    initCLI(commands) {
        const message = 'Введите команду:\n\n' +
            Object.keys(commands)
                .map(command => `${command} - ${commands[command].title}`)
                .join('\n')+'\n\n';

        const cmd = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        cmd.question(message, (msg) => {
            const [command, ...args] = msg.split(' ');
            if (commands[command]) {
                commands[command].func(args, (msg) => {
                    console.log(msg);
                    cmd.close();
                    return process.exit(0);
                });
            } else {
                console.log('Unknown command ' + command);
                cmd.close();
                return process.exit(1);
            }
        });
    }
};

module.exports = Nodejs;