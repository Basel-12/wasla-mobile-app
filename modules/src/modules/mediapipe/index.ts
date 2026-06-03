import { requireNativeViewManager , requireNativeModule} from 'expo-modules-core';
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export interface Landmark {
    x: number;
    y: number;
    z: number;
}

export interface LandmarkResult {
    hands: Landmark[][];
    handedness: string[];
    face: Landmark[];
    timestamp: number;
}

export interface SignDetectedResult {
    label: string;
    confidence: number;
    committed: boolean;
}

export interface EmotionDetectedResult{
    emotion: string,
    confidence: number,
    timestamp: number;
}

export interface MediapipeCameraViewProps {
    style?: StyleProp<ViewStyle>;
    facing?: 'front' | 'back';
    onLandmarks?: (event: { nativeEvent: LandmarkResult }) => void;
    onReady?: (event: { nativeEvent: { status: string } }) => void;
    onError?: (event: { nativeEvent: { message: string } }) => void;
    onSignDetected?: (event: { nativeEvent: SignDetectedResult }) => void;
    onEmotionDetected?: (event: { nativeEvent: EmotionDetectedResult }) => void; 
}

const NativeView = requireNativeViewManager('Mediapipe');
const MediapipeModule = requireNativeModule('Mediapipe'); 

export function MediapipeCameraView({
    style,
    facing = 'front',
    onLandmarks,
    onReady,
    onError,
    onSignDetected,
    onEmotionDetected
}: MediapipeCameraViewProps) {
    return React.createElement(NativeView, {
        style,
        facing,
        onLandmarks,
        onReady,
        onError,
        onSignDetected,
        onEmotionDetected
    });
}

export const preloadModels = (): void => {
    MediapipeModule.preloadModels();
};
