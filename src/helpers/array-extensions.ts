export {}

declare global {
    interface ArrayConstructor {
        /**
         * Creates a new read-only version of the array.
         * @param array Array or iterable to make read-only.
         */
        makeReadonly<T>(array: Array<T> | IterableIterator<T>): ReadonlyArray<T>;
    }

    interface Array<T> {
        /**
         * Returns the only element in the array or throws an error.  If `predicate` is specified, filters the array
         * before searching values.
         *
         * @param predicate Function by which to filter elements.
         */
        only(predicate?: (val: T) => boolean): T;

        /**
         * Returns the only element in the array or returns `undefined`.  If `predicate` is specified, filters the array
         * before searching values.
         *
         * @param predicate Function by which to filter elements.
         */
        onlyOrUndefined(predicate?: (val: T) => boolean): T | undefined;

        /**
         * Returns the index of the only element matching the predicate.
         *
         * @param predicate Function by which to filter elements.
         */
        indexOfOnly<U extends number = number>(predicate: (val: T) => boolean): U | -1;

        /**
         * Returns a readonly copy of the array.
         */
        toReadonly(): ReadonlyArray<T>;
    }
}

Array.prototype.only = function only<T>(predicate?: (val: T) => any): T {
    if (!predicate) {
        if (this.length === 1) {
            return this[0];
        }

        throw new Error(this.length ? 'Array contains more than one element' : 'Array contains no elements');
    }

    let found: T | undefined = undefined;

    for (const val of this) {
        if (predicate(val)) {
            if (found === undefined) {
                found = val;
            } else {
                throw new Error('More than one element matches the predicate');
            }
        }
    }

    if (found) {
        return found;
    }

    throw new Error('No elements match the predicate');
}

Array.prototype.onlyOrUndefined = function onlyOrNull<T>(predicate?: (val: T) => any): T | undefined {
    if (!predicate) {
        return this.length === 1 ? this[0] : undefined;
    }

    let found: T | undefined = undefined;

    for (const val of this) {
        if (predicate(val)) {
            if (found === undefined) {
                found = val;
            } else {
                return undefined;
            }
        }
    }

    return found;
}

Array.prototype.indexOfOnly = function indexOfOnly<T, U extends number = number>(pred: (val: T) => boolean): U | -1 {
    let foundIdx: U | -1 = -1;

    for (const [idx, val] of this.entries()) {
        if (pred(val)) {
            if (foundIdx === -1) {
                foundIdx = idx as U;
            } else {
                foundIdx = -1;
                break;
            }
        }
    }

    return foundIdx;
}

const hiddenMethods = new Set<keyof Array<any>>([
    'copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'
]);

Array.makeReadonly = function makeReadOnly<T>(value: Array<T> | IterableIterator<T>): ReadonlyArray<T> {
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

Array.prototype.toReadonly = function toReadOnly() {
    return Array.makeReadonly(this);
}