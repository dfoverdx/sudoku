export {}

declare global {
    function parseInt(s: string, radix?: number): number;
    function parseInt(n: number): number;

    // type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
}