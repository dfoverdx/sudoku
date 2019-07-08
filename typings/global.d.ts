export {}

declare global {
    function parseInt(s: string, radix?: number): number;
    function parseInt(n: number): number;

    function isNaN(s: string | number): boolean;

    // type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
}