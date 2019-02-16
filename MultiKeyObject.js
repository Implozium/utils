class MultiKeyObject {
    /**
     * 
     * @param {{}=} origin исходный объект, для которого необходимо осуществить менеджмент
     */
    constructor(origin = {}) {
        this.object = origin;
    }

    /**
     * Проверяет массив ключей на валидность и разбивает его на массив если это не массив, а строка и возвращает его
     * @throws {Error} при размере массива равным 0 или пустой строки
     * @param {string[] | string} keys массив ключей или строка в формате: `<ключ1>[.<ключ2>[....]]`, "person.age.isOld"
     * @param {string=} delimiter разделитель
     * @return {string[]} массив ключей
     */
    static prepareKeys(keys, delimiter = '.') {
        if (typeof keys === 'string') {
            if (keys.length === 0) {
                throw new Error('String is empty');
            }
            keys = keys.split(delimiter);;
        }
        if (keys.length === 0) {
            throw new Error('Array of keys is empty');
        }
        return keys;
    }

    /**
     * Устанавливает значение по массиву ключей
     * @throws {Error} при размере массива равным 0 или пустой строки
     * @param {string[] | string} keys массив ключей или строка в формате: `<ключ1>[.<ключ2>[....]]`, "person.age.isOld"
     * @param {*} value значение
     * @return {this} this
     */
    set(keys, value) {
        keys = MultiKeyObject.prepareKeys(keys);
        let obj = this.object;
        keys.slice(0, -1).forEach((key) => {
            if (!obj[key] || !(obj[key] instanceof Object)) {
                obj[key] = {};
            }
            obj = obj[key];
        });
        obj[keys[keys.length - 1]] = value;

        return this;
    }
    
    /**
     * Возвращает значение по массиву ключей
     * @throws {Error} при размере массива равным 0 или пустой строки
     * @param {string[] | string} keys массив ключей или строка в формате: `<ключ1>[.<ключ2>[....]]`, "person.age.isOld"
     * @return {*} значение ключа
     */
    get(keys) {
        keys = MultiKeyObject.prepareKeys(keys);
        let obj = this.object;
        for (let i = 0; i < keys.length; i++) {
            if (obj === null) {
                return undefined;
            }
            if (obj[keys[i]] === undefined) {
                return undefined;
            }
            obj = obj[keys[i]];
        }
        return obj;
    }

    /**
     * Возвращает `true`, если массив ключей есть, иначе `false`
     * @throws {Error} при размере массива равным 0 или пустой строки
     * @param {string[] | string} keys массив ключей или строка в формате: `<ключ1>[.<ключ2>[....]]`, "person.age.isOld"
     * @return {boolean}
     */
    has(keys) {
        return this.get(keys) === undefined ? false : true;
    }

    /**
     * Удаляет значение по массиву ключей
     * @throws {Error} при размере массива равным 0 или пустой строки
     * @param {string[] | string} keys массив ключей или строка в формате: `<ключ1>[.<ключ2>[....]]`, "person.age.isOld"
     * @param {boolean} recursiveToRoot флаг рекурсивного удаления, при `true` удаляет все пустые контейнеры которые содержат удаленное значение
     */
    delete(keys, recursiveToRoot = false) {
        keys = MultiKeyObject.prepareKeys(keys);
        const objects = [{key: '', obj: this.object}];

        let obj = this.object;
        for (let i = 0; i < keys.length - 1; i++) {
            if (obj[keys[i]] === undefined || !(obj[keys[i]] instanceof Object)) {
                return false;
            }
            obj = obj[keys[i]];
            if (recursiveToRoot) {
                objects.push({key: keys[i], obj});
            }
        }
        if (!recursiveToRoot) {
            return delete obj[keys[keys.length - 1]];
        }
        if (!(delete obj[keys[keys.length - 1]])) {
            return false;
        }

        objects.reverse();
        for (let i = 0; i < objects.length - 1; i++) {
            if (Object.keys(objects[i].obj).length) {
                break;
            }
            if (!(delete objects[i + 1].obj[objects[i].key])) {
                break;
            }
        }

        return true;
    }

    /**
     * Формирует массив для каждого значения массива ключей
     * @param {{}} object исходный объект
     * @return {[string[], *][]} массив с массивами, где **первый элемент** - массив ключей, а **второй** - значение
     */
    static makeArrayForEachKey(object) {
        /**
         * Рекурсивная функция, которая собирает ключи в массив
         * @param {{}} object объект из которого выбираются ключи
         * @param {string[]} keys массив ключей
         * @param {[string[], *][]} array массив с массивами ключей
         */
        function makeKey(object, keys, array) {
            //console.log(object, keys);
            if (
                !(object instanceof Object)
                || (object instanceof Object && Object.keys(object).length === 0)
            ) {
                if (keys.length) {
                    array.push([keys, object]);
                }
                return;
            }

            Object.keys(object).forEach((key) => {
                makeKey(object[key], keys.concat(key), array);
            });
        }

        const array = [];
        makeKey(object, [], array);
        return array;
    }

    /**
     * Возвращает генератор для обхода всех ключей и их значений
     * @generator
     * @param {{}} object исходный объект
     * @yield {[string[], *]} возвращаемое значение где **первый элемент** - массив ключей, а **второй** - значение
     */
    static * generateForEachKey(object) {
        /**
         * Рекурсивная функция, которая собирает ключи в массив
         * @param {{}} object объект из которого выбираются ключи
         * @param {string[]} keys массив ключей
         */
        function* makeKey(object, keys) {
            //console.log(object, keys);
            if (
                !(object instanceof Object)
                || (object instanceof Object && Object.keys(object).length === 0)
            ) {
                if (keys.length) {
                    yield [keys, object];
                }
            } else {
                const innerKeys = Object.keys(object);
                for (let key of innerKeys) {
                    yield* makeKey(object[key], keys.concat(key));
                }
            }
        }

        yield* makeKey(object, []);
        //return array;
    }

    /**
     * Возвращает итератор для перебора массива ключей объекта
     * @returns {{[Symbol.iterator]: function (): {next: function (): {value: *, done: boolean}}}}
     */
    keys() {
        const object = this.object;
        return {
            [Symbol.iterator]() {
                const array = MultiKeyObject.makeArrayForEachKey(object).map(elem => elem[0]);
                let index = 0;

                return {
                    next() {
                        return {
                            value: array[index],
                            done: index++ >= array.length,
                        };
                    }
                }
            }
        }
    }

    /**
     * Возвращает итератор для перебора массива ключей объекта и значений
     * @returns {{[Symbol.iterator]: function (): {next: function (): {value: *, done: boolean}}}}
     */
    entries() {
        const object = this.object;
        return {
            [Symbol.iterator]() {
                const array = MultiKeyObject.makeArrayForEachKey(object);
                let index = 0;

                return {
                    next() {
                        return {
                            value: array[index],
                            done: index++ >= array.length,
                        };
                    }
                }
            }
        }
    }

    /**
     * Возвращает итератор для перебора значений
     * @returns {{[Symbol.iterator]: function (): {next: function (): {value: *, done: boolean}}}}
     */
    values() {
        const object = this.object;
        return {
            [Symbol.iterator]() {
                const array = MultiKeyObject.makeArrayForEachKey(object).map(elem => elem[1]);
                let index = 0;

                return {
                    next() {
                        return {
                            value: array[index],
                            done: index++ >= array.length,
                        };
                    }
                }
            }
        }
    }
}

module.exports = MultiKeyObject;