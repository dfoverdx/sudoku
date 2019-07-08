import '../../helpers/readonly-array';

function makeTest<T>(valueArray: Array<T> | IterableIterator<T>, testFn: (roa: ReadonlyArray<T>) => void) {
    return function () {
        if (Array.isArray(valueArray)) {
            testFn(valueArray.toReadOnly());
        }

        testFn(Array.makeReadOnly(valueArray));
    }
}

function makeMultiTest<T>(valueArrays: (Array<T> | IterableIterator<T>)[], testFn: (roas: ReadonlyArray<T>[]) => void) {
    return function () {
        if (valueArrays.some(a => Array.isArray(a))) {
            let roas = valueArrays.map(a => Array.isArray(a) ? a.toReadOnly() : Array.makeReadOnly(a));
            testFn(roas);
        }

        testFn(valueArrays.map(a => Array.makeReadOnly(a)));
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
    Array.makeReadOnly(a);
    expect(() => a.push(4)).not.toThrow();

    a.toReadOnly();
    expect(() => a.push(5)).not.toThrow();    
});