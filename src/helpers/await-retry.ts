export default async function awaitRetry<T>(cb: () => PromiseLike<T>, retries = 3) {
    let result: T | null = null;
    do {
        try {
            result = await cb();
        } catch (e) {
            console.debug(e);
        }
    } while (!result && retries--);

    return result;
}