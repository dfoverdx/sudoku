import '../../helpers/array-extensions';

describe('Array<T>.indexOfOnly()', () => {
    it('returns the index if only one value matches the predicate', () => {
        expect([1, 2, 3].indexOfOnly(v => v === 2)).toBe(1);
    });

    it('returns -1 if the array is empty', () => {
        expect([].indexOfOnly(i => !!i)).toBe(-1);
    });

    it('returns -1 if the array has no values matching the predicate', () => {
        expect([1, 2, 3].indexOfOnly(i => i === 0)).toBe(-1);
    });

    it('returns -1 if the array has more than one value matching the predicate', () => {
        expect([0, 0, 1, 2, 3].indexOfOnly(i => i === 0)).toBe(-1);
    });

    it('short circuits if more than one value is found matching the predicate', () => {
        const pred = jest.fn(i => i === 0);
        expect([0, 0, 0].indexOfOnly(pred)).toBe(-1);
        expect(pred).toHaveBeenCalledTimes(2);
    });
});

describe('Array<T>.only()', () => {
    describe('with no predicate specified', () => {
        it('returns the value if only one exists', () => {
            expect([1].only()).toBe(1);
        });

        it('throws an error if array is empty', () => {
            expect(() => [].only()).toThrowError();
        });

        it('throws an error if array has more than one element', () => {
            expect(() => [1, 2, 3].only()).toThrowError();
        });
    });

    describe('with predicate specified', () => {
        it('returns the value if only one matches the predicate', () => {
            expect([1, 2, 3].only(v => v === 1)).toBe(1);
        });

        it('throws an error if array is empty', () => {
            expect(() => [].only(v => v === 1)).toThrowError();
        });

        it('throws an error if no elements match the predicate', () => {
            expect(() => [2, 3, 4].only(v => v === 1)).toThrowError();
        });

        it('throws an error if more than one element matches the predicate', () => {
            expect(() => [1, 2, 3, 1].only(v => v === 1)).toThrowError();
        });

        it('short circuits if more than one value is found matching the predicate', () => {
            const pred = jest.fn(i => i === 0);
            expect(() => [0, 0, 0].only(pred)).toThrowError();
            expect(pred).toHaveBeenCalledTimes(2);
        });
    });
});

describe('Array<T>.onlyOrUndefined()', () => {
    describe('with no predicate specified', () => {
        it('returns the value if only one exists', () => {
            expect([1].onlyOrUndefined()).toBe(1);
        });

        it('returns undefined if array is empty', () => {
            expect([].onlyOrUndefined()).toBeUndefined();
        });

        it('returns undefined if array has more than one element', () => {
            expect([1, 2, 3].onlyOrUndefined()).toBeUndefined();
        });
    });

    describe('with predicate specified', () => {
        it('returns the value if only one matches the predicate', () => {
            expect([1, 2, 3].onlyOrUndefined(v => v === 1)).toBe(1);
        });

        it('returns undefined if array is empty', () => {
            expect([].onlyOrUndefined(v => v === 1)).toBeUndefined();
        });

        it('returns undefined if no elements match the predicate', () => {
            expect([2, 3, 4].onlyOrUndefined(v => v === 1)).toBeUndefined();
        });

        it('returns undefined if more than one element matches the predicate', () => {
            expect([1, 2, 3, 1].onlyOrUndefined(v => v === 1)).toBeUndefined();
        });

        it('short circuits if more than one value is found matching the predicate', () => {
            const pred = jest.fn(i => i === 0);
            expect([0, 0, 0].onlyOrUndefined(pred)).toBeUndefined();
            expect(pred).toHaveBeenCalledTimes(2);
        });
    });
});

describe('ReadonlyArray<T>', () => {
    function makeTest<T>(valueArray: Array<T> | IterableIterator<T>, testFn: (roa: ReadonlyArray<T>) => void) {
        return function () {
            if (Array.isArray(valueArray)) {
                testFn(valueArray.toReadonly());
            }

            testFn(Array.makeReadonly(valueArray));
        }
    }

    function makeMultiTest<T>(valueArrays: (Array<T> | IterableIterator<T>)[], testFn: (roas: ReadonlyArray<T>[]) => void) {
        return function () {
            if (valueArrays.some(a => Array.isArray(a))) {
                let roas = valueArrays.map(a => Array.isArray(a) ? a.toReadonly() : Array.makeReadonly(a));
                testFn(roas);
            }

            testFn(valueArrays.map(a => Array.makeReadonly(a)));
        }
    }

    it('handles a simple array', makeTest([1, 2, 3], roa => {
        expect(roa).toEqual([1, 2, 3]);
    }));

    it('handles an empty array', makeTest([], roa => {
        expect(roa).toEqual([]);
    }));

    it('handles an array of a single number', makeTest([1], roa => {
        expect(roa).toEqual([1]);
    }));

    it('handles an array of arrays', makeTest([[1, 2, 3], [4, 5, 6]], roa => {
        expect(roa).toEqual([[1, 2, 3], [4, 5, 6]]);
    }));

    it('handles iterators', makeTest([], () => {
        const iterator = function*(max: number) {
            for (let i = 1; i <= max; i++) {
                yield i;
            }
        };

        makeMultiTest([iterator(3), iterator(1)], roas => {
            expect(roas[0]).toEqual([1, 2, 3]);
            expect(roas[1]).toEqual([1]);
        })();
    }));

    it('is readonly', makeTest([1, 2, 3], roa => {
        const array = roa as Array<number>;

        expect(() => array.length = 0).toThrowError();
        expect(() => array[0] = 2).toThrowError();

        expect(array.copyWithin).toBeUndefined();
        expect(() => array.copyWithin(1, 0, 1)).toThrowError();

        expect(array.fill).toBeUndefined();
        expect(() => array.fill(4)).toThrowError();

        expect(array.pop).toBeUndefined();
        expect(() => array.pop()).toThrowError();

        expect(array.push).toBeUndefined();
        expect(() => array.push(4)).toThrowError();

        expect(array.reverse).toBeUndefined();
        expect(() => array.reverse()).toThrowError();

        expect(array.shift).toBeUndefined();
        expect(() => array.shift()).toThrowError();

        expect(array.sort).toBeUndefined();
        expect(() => array.sort()).toThrowError();

        expect(array.splice).toBeUndefined();
        expect(() => array.splice(0, 0, 1)).toThrowError();

        expect(array.unshift).toBeUndefined();
        expect(() => array.unshift()).toThrowError();
    }));

    it('is an interator', makeTest([1, 2, 3], roa => {
        expect(() => { for (let _ of roa) {} }).not.toThrow();
        expect(() => roa.entries()).not.toThrow();
        expect(() => roa.values()).not.toThrow();
    }));

    it('is an array', makeTest([1, 2, 3], roa => {
        expect(Array.isArray(roa)).toBe(true);
    }));

    it('creates a copy of the array', () => {
        let a = [1, 2, 3];
        Array.makeReadonly(a);
        expect(() => a.push(4)).not.toThrow();

        a.toReadonly();
        expect(() => a.push(5)).not.toThrow();
    });
});