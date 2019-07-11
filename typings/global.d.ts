export {}

declare global {
    const DEVELOPMENT: boolean;
    const PRODUCTION: boolean;

    function parseInt(s: string, radix?: number): number;
    function parseInt(n: number): number;

    function isNaN(s: string | number): boolean;

    type ElementType<T> = T extends (infer U)[] ? U : T;
}