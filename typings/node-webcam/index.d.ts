// declare module 'node';

// export = Factory;

// declare class Factory {
//     create(options: NodeWebcam.WebcamOptions): NodeWebcam.Webcam;
//     capture(location: string, options: NodeWebcam.WebcamOptions, callback: ShotCallback): void;
// }

// type ShotCallback = (error: Error | null, data: Buffer) => void;

// declare namespace NodeWebcam {
//     enum CallbackReturnTypes {
//         location = 'location',
//         buffer = 'buffer',
//         base64 = 'base64',
//     }

//     export interface WebcamOptions {
//         width?: number;
//         height?: number;
//         quality?: number;
//         delay?: number;
//         saveShots?: boolean;
//         output?: 'png' | 'jpeg';
//         device?: boolean;
//         callbackReturn?: CallbackReturnTypes;
//         verbose?: boolean;
//     }

//     export interface Device {

//     }

//     export class Shot {

//     }

//     export class Webcam<TReturn extends CallbackReturnTypes = CallbackReturnTypes.location> extends EventDispatcher {
//         constructor(options: WebcamOptions);

//         capture(location: string, callback: ShotCallback): void;
//         createShot(location: string, data: Buffer): Shot;
//         shots: Shot[];
//         getShot(shot: number, callback: ShotCallback): void;
//         getLastShot(callback: ShotCallback): void;
//         getShotBuffer(shot: Shot, callback: ShotCallback): void;
//         getLastShotBuffer(callback: ShotCallback): void;

//         getBase64(shot: number | Buffer, callback: ShotCallback): void;
//         getBase64FromBuffer(shotBuffer: Buffer): string;
//         getLastShot64(callback: () => string): void;
//         // generateSh(location: string): '';

//         hasCamera(callback: (cameraExists: boolean) => void): void;
//         list(callback: (list: Array<Device>) => void): void;
//         clone(): Webcam<TReturn>;
//         clear(): void;

//         handleCallbackReturnType(
//             this: Webcam<CallbackReturnTypes.location>,
//             callback: (error: null, location: string) => void,
//             shot: Shot
//         ): void

//         handleCallbackReturnType(
//             this: Webcam<CallbackReturnTypes.buffer>,
//             callback: ShotCallback,
//             shot: Shot
//         ): void;

//         handleCallbackReturnType(
//             this: Webcam<CallbackReturnTypes.base64>,
//             callback: (error: Error | null, data: string) => void
//         ): void;

//         // runCaptureValidations(data: any): null;
//     }

//     class EventDispatcher {
//         apply(object: object): object;
//         on(type: string, listener: (...args: any[]) => void): void;
//         hasListener(type: string, listener: (...args: any[]) => void): boolean;
//         removeListener(type: string, listener: (...args: any[]) => void): void;
//         dispatch(event: { type: string, [key: string]: any }): void;
//     }
// }