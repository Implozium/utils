const MultiKeyObject = require('./MultiKeyObject');

const Common = {
    /**
     * Разбирает CSV строку на части
     * @param {string} line строка
     * @param {string=} delimiter разделитель
     * @param {string=} wrapper оборачиватель
     * @return {string[]} части строки
     */
    parseCSVLine(line, delimiter = ',', wrapper = '"') {
        const arr = line
            .split(new RegExp(`(${delimiter}|${wrapper})`))
            .filter((el, i, arr) => {
                if (el === '' && (
                    (arr[i - 1] === delimiter && arr[i + 1] === wrapper)
                    || (arr[i - 1] === wrapper && arr[i + 1] === delimiter)
                    || (arr[i - 1] === wrapper && arr[i + 1] === wrapper)
                )) {
                    return false;
                }
                return true;
            });
        //console.log(arr);

        const obj = arr.reduce((obj, el, i, arr) => {
            if (!obj.hasQuote && el === delimiter) {
                obj.arr.push(obj.acum.length ? obj.acum.join('') : '');
                obj.acum = [];
            } else if (el === wrapper) {
                if (obj.hasQuote) {
                    if (obj.ignoreNextQuote) {
                        obj.ignoreNextQuote = false;
                    } else if (arr[i + 1] === wrapper) {
                        obj.acum.push(el);
                        obj.ignoreNextQuote = true;
                    } else {
                        obj.hasQuote = false;
                    }
                } else {
                    obj.hasQuote = true;
                }
            } else {
                obj.acum.push(el);
            }
            //console.log(obj);
            return obj;
        }, {
            arr: [],
            acum: [],
            hasQuote: false,
            ignoreNextQuote: false,
        });
        obj.arr.push(obj.acum.length ? obj.acum.join('') : '');

        return obj.arr;
    },

    /**
     * Собирает CSV строку из массива
     * @param {*[]} arr массив
     * @param {string=} delimiter разделитель
     * @param {string=} wrapper оборачиватель
     * @return {string} строка
     */
    stringifyCSVLine(arr, delimiter = ',', wrapper = '"') {
        return arr
            .map(elem => String(elem))
            .map((elem) => {
                if (elem.includes(delimiter) || elem.includes(wrapper)) {
                    return `${wrapper}${elem.replace(new RegExp(wrapper, 'g'), wrapper + wrapper)}${wrapper}`;
                }

                return elem;
            })
            .join(delimiter)
    },

    /**
     * Разбивает массивы на подмассивы заданой длины
     * @param {*[]} array массив
     * @param {number} length длина подмассива
     * @return {*[][]} массив подмассивов
     */
    collect(array, length) {
        return array.reduce((acum, data, i) => {
            const id = Math.floor(i / length);
            if (!acum[id]) {
                acum.push([]);
            }
            acum[id].push(data);
            return acum;
        }, []);
    },

    /**
     * Разбивает объект на массив подобъектов с максимальным количеством ключей
     * @param {{}} obj объект
     * @param {number} length максимальное количество ключей в объекте
     * @return {{}[]} массив объектов
     */
    collectObj(obj, length) {
        return Object.keys(obj)
            .reduce((acum, key, i) => {
                const id = Math.floor(i / length);
                if (!acum[id]) {
                    acum.push({});
                }
                acum[id][key] = obj[key];
                return acum;
            }, []);
    },

    /**
     * Преобразует массив в объект, где ключи будут значениями переданого ключа **key**, а значения - массивом из элементов массива, которые соответствуют значению по значению ключа **key**
     * @param {{}[]} arr массив из объектов
     * @param {string} key ключ для группировки
     * @return {Object.<string, {}[]>} объект со структурой: {<значение_ключа>: [<элемент1>]}
     */
    groupArrToObjBySameKeyValue(arr, key) {
        return arr.reduce((obj, item) => {
            if (!obj[item[key]]) {
                obj[item[key]] = [];
            }
            obj[item[key]].push(item);

            return obj;
        }, {});
    },

    /**
     * Создает хранилище
     * @param {{}=} origin исходный объект, для которого необходимо осуществить менеджмент
     * @return {MultiKeyObject} хранилище
     */
    makeMultiKeyObject(origin = {}) {
        return new MultiKeyObject(origin);
    },

    /**
     * Возвращает максимальное число из массива `arr`,
     * которое меньше переданого числа `value` или `null` если его нет
     * @param {number[]} arr массив
     * @param {number} value число
     * @return {?number}
     */
    maxmin(arr, value) {
        return arr.reduce((res, val) => {
            if (val < value && (res === null || val > res)) {
                return val;
            }
            return res;
        }, null);
    },

    /**
     * Возвращает минимальное число из массива `arr`,
     * которое больше переданого числа `value` или `null` если его нет
     * @param {number[]} arr массив
     * @param {number} value число
     * @return {?number}
     */
    minmax(arr, value) {
        return arr.reduce((res, val) => {
            if (val > value && (res === null || val < res)) {
                return val;
            }
            return res;
        }, null);
    },

    /**
     * Возвращает массив с дельтами для отображения исходного массива на окрестность числа 0
     * с расстояниями равными `d` в порядке следования
     * @param {number[]} arr массив чисел
     * @param {number} d расстояние
     * @return {number[]}
     */
    mapArrayForDistanceOfDeltas(arr, d = 64) {
        const mapping = {};

        return arr.map((val, i, arr) => {
            if (i === 0) {
                mapping[val] = 0;
                return 0;
            }
            const subarr = arr.slice(0, i);
            const maxmin = Common.maxmin(subarr, val);
            const minmax = Common.minmax(subarr, val);
            if (maxmin === null) {
                mapping[val] = mapping[minmax] - d;
            } else if (minmax === null) {
                mapping[val] = mapping[maxmin] + d;
            } else {
                mapping[val] = mapping[maxmin] + (mapping[minmax] - mapping[maxmin]) / 2;
            }
            return mapping[val];
        });
    },

    /**
     * Возвращает промис с результатами выполнения промисов для каждого элемента перечисляемого объекта (массива), которые будут возвращены функцией `func` при этом выполняя одновременно максимум `max`, если будет выброшено исключение или промис для элемента отклонится, то отклонится и главный промис с этим исключением
     * @param {*[]} iterable перечисляемый объект
     * @param {function (*, number): Promise.<*> | *} func функция, которая будет вызвана для каждого элемента с параметрами:
     *      `value` - значение элемента перечисляемого объекта;
     *      `index` - номер элемента перечисляемого объекта по порядку.
     * должна возвращать значение или промис или выбрасывать исключение
     * @param {number} max количество одновременно вызванных функций
     * @return {Promise.<*[]>}
     */
    handleParallel(iterable, func, max = 1) {
        const results = [];
        const inActive = [];
        const iterator = iterable[Symbol.iterator]();
        let i = 0;
        let isFailed = false;

        return new Promise(function iteration(res, rej) {
            if (isFailed) {
                return;
            }
            let obj = iterator.next();

            while (inActive.length < max && obj.done === false) {
                const index = i++;
                let result;
                try {
                    result = func(obj.value, index);
                    if (!(result instanceof Promise)) {
                        result = Promise.resolve(result);
                    }
                } catch (err) {
                    isFailed = true;
                    return rej(err);
                }
               
                const aPromise = result
                    .then((result) => {
                        results[index] = result;
                        inActive.splice(inActive.indexOf(aPromise), 1);
                        iteration(res, rej);
                    })
                    .catch((err) => {
                        isFailed = true;
                        rej(err);
                    });

                inActive.push(aPromise);

                if (inActive.length < max) {
                    obj = iterator.next();
                }
            }
            if (inActive.length === 0 && obj.done == true && !isFailed) {
                res(results);
            }
        });
    },
    
    /**
     * Возвращает промис с результатами выполнения промисов и их ошибок для каждого элемента перечисляемого объекта (массива) в виде: `[<результат>, <ошибка>]`, которые будут возвращены функцией `func` при этом выполняя одновременно максимум `max`
     * @param {*[]} iterable перечисляемый объект
     * @param {function (*, number): Promise.<*> | *} func функция, которая будет вызвана для каждого элемента с параметрами:
     *      `value` - значение элемента перечисляемого объекта;
     *      `index` - номер элемента перечисляемого объекта по порядку.
     * должна возвращать значение или промис или выбрасывать исключение
     * @param {number} max количество одновременно вызванных функций
     * @return {Promise.<[*, *][]>}
     */
    handleParallelWithCatchingError(iterable, func, max = 1) {
        const results = [];
        const inActive = [];
        const iterator = iterable[Symbol.iterator]();
        let i = 0;

        return new Promise(function iteration(res, rej) {
            let obj = iterator.next();

            while (inActive.length < max && obj.done === false) {
                const index = i++;
                let result;
                try {
                    result = func(obj.value, index);
                    if (!(result instanceof Promise)) {
                        result = Promise.resolve(result);
                    }
                } catch (err) {
                    result = Promise.reject(err);
                }
               
                const aPromise = result
                    .then((result) => {
                        results[index] = [result, undefined];
                        inActive.splice(inActive.indexOf(aPromise), 1);
                        iteration(res, rej);
                    })
                    .catch((err) => {
                        results[index] = [undefined, err];
                        inActive.splice(inActive.indexOf(aPromise), 1);
                        iteration(res, rej);
                    });

                inActive.push(aPromise);

                if (inActive.length < max) {
                    obj = iterator.next();
                }
            }
            if (inActive.length === 0 && obj.done == true) {
                res(results);
            }
        });
    }
};

module.exports = Common;