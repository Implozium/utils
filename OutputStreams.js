const fs = require('fs');

/**
 * Класс для работы со множеством потоков для записи
 */
class OutputStreams {
    /**
     * 
     * @param {object} options объект с опциями
     * @param {number=} options.maxChunks количество частей для буферизации, если будет превышено их количество, то произведется запись в поток
     */
    constructor(options = {}) {

        this.options = {
            maxChunks: options.maxChunks !== undefined ? options.maxChunks : 10,
        };
        
        /**
         * @type {Object.<string, {stream: fs.WriteStream, chunks: string[], count: number}>} содержит потоки для записи
         */
        this.outStreams = {};
    }

    /**
     * Производит инициализацию, обнуляя при этом потоки
     * @param {Object.<string, string>=} streams объект с описаниями потоков, где ключ - имя потока, а значение - имя файла
     * @return {Promise.<this>} промис, который разрешается в `this`
     */
    init(streams = {}) {
        return Object.keys(streams).reduce((promise, key) => {
            return promise.then(() => this.add(key, streams[key]));
        }, Promise.resolve(this));
    }

    /**
     * Добавляет поток
     * @param {string} streamName имя потока
     * @param {string} path путь к файлу для потока
     * @return {Promise.<this>} промис, который разрешается в `this`
     */
    add(streamName, path) {
        if (!this.outStreams[streamName]) {
            this.outStreams[streamName] = {
                stream: fs.createWriteStream(path, {
                    encoding: 'utf8'
                }),
                chunks: [],
                count: 0,
            };
        }

        return Promise.resolve(this);
    }

    /**
     * Производит немедленную запись буфера в поток
     * @param {string} streamName имя потока
     * @return {this} `this`
     */
    force(streamName) {
        this.outStreams[streamName].stream.write(this.outStreams[streamName].chunks.join(''));
        this.outStreams[streamName].chunks = [];

        return this;
    }

    /**
     * Записывает в буфер потока по имени значение, а при превышении количества в буфере, то пишет буфер в поток
     * @param {string} streamName имя потока
     * @param {*} value значение
     * @return {this} `this`
     */
    write(streamName, value) {
        if (!this.outStreams[streamName]) {
            throw new Error(`Stream ${streamName} doesn't set`);
        }
        this.outStreams[streamName].chunks.push(value);
        this.outStreams[streamName].count++;
        if (this.outStreams[streamName].chunks.length >= this.options.maxChunks) {
            this.force(streamName);
        }

        return this;
    }

    /**
     * Записывает в буфер потока по указаному пути значение, если потока нет, то его создает, а при превышении количества в буфере, то пишет буфер в поток
     * @param {string} path путь к файлу потока
     * @param {*} value значение
     * @return {this} `this`
     */
    writeTo(path, value) {
        if (!this.outStreams[path]) {
            this.add(path, path);
        }
        this.write(path, value);

        return this;
    }

    /**
     * Пишет буферы в потоки и закрывает их, а затем обнуляет потоки
     * @return {Promise.<this>} промис, который разрешается в `this`
     */
    closeAll() {
        return Object.keys(this.outStreams).reduce((promise, key) => {
            return promise.then(() => {
                return new Promise((res, rej) => {
                    this.force(key);
                    this.outStreams[key].stream.end(err => err ? rej(err) : res());
                });
            });
        }, Promise.resolve())
        .then(() => {
            this.outStreams = {};
            return this;
        });
    }
}

module.exports = OutputStreams;
