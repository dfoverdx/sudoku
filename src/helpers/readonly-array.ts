export {}

declare global {
    interface ArrayConstructor {
        makeReadOnly<T>(array: Array<T> | IterableIterator<T>): ReadonlyArray<T>;
    }
    interface Array<T> {
        toReadOnly(): ReadonlyArray<T>;
    }
}

const hiddenMethods = new Set<keyof Array<any>>([
    'copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'
]);

Array.makeReadOnly = function makeReadOnly<T>(value: Array<T> | IterableIterator<T>): ReadonlyArray<T> {
    if (!Array.isArray(value)) {
        value = Object.freeze(Array.from(value)) as any;
    } else if (value.length === 1 && typeof value[0] === 'number') {
        value = Object.freeze([value[0]]) as any;
    } else {
        value = Object.freeze(value.slice()) as any;
    }
    
    return new Proxy(value as Array<T>, {
        get(target, prop, receiver) {
            if (hiddenMethods.has(prop as keyof Array<T>)) {
                return undefined;
            }

            if (prop === 'length') {
                return target.length;
            }

            return Reflect.get(target, prop, receiver);
        },
        set() {
            throw new Error(`Cannot set properties of ReadOnlyArray.`);
        }
    });
}

Array.prototype.toReadOnly = function toReadOnly() {
    return Array.makeReadOnly(this);
}