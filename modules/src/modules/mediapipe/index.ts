import {
	EventEmitter,
	EventSubscription,
	requireNativeModule,
} from "expo-modules-core";

export interface Landmark {
	x: number;
	y: number;
	z: number;
}

export interface LandmarkResult {
	hands: Landmark[][]; // up to 2 hands, 21 landmarks each
	handedness: string[]; // 'Left' or 'Right' per hand
	face: Landmark[]; // 478 face landmarks
	timestamp: number;
}

type MediapipeEvents = {
    onLandmarks: LandmarkResult;
    onReady: { status: string };
    onError: { message: string };
};

const MediapipeNative = requireNativeModule("Mediapipe");
const emitter = new EventEmitter<MediapipeEvents>(MediapipeNative);

export const Mediapipe = {
	startDetection(): Promise<void> {
		return MediapipeNative.startDetection();
	},

	stopDetection(): Promise<void> {
		return MediapipeNative.stopDetection();
	},

	onLandmarks(callback: (result: LandmarkResult) => void): EventSubscription {
		return emitter.addListener("onLandmarks", callback);
	},

	onReady(callback: (status: { status: string }) => void): EventSubscription {
		return emitter.addListener("onReady", callback);
	},

	onError(callback: (error: { message: string }) => void): EventSubscription {
		return emitter.addListener("onError", callback);
	},
};
