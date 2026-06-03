import { View } from 'react-native';
import { Landmark } from '../../../../modules/src/modules/mediapipe';

type Props = {
    face: Landmark[];
    emotion?: string;
};

export default function FaceEmotionBox({ face, emotion = 'Neutral' }: Props) {
    return (
        <View
            className="absolute top-[20%] self-center w-40 h-40"
            pointerEvents="none"
        >
            {/* Top Left */}
            <View className="absolute top-0 left-0 w-10 h-10 border-l-4 border-t-4 border-primary rounded-tl-2xl" />

            {/* Top Right */}
            <View className="absolute top-0 right-0 w-10 h-10 border-r-4 border-t-4 border-primary rounded-tr-2xl" />

            {/* Bottom Left */}
            <View className="absolute bottom-0 left-0 w-10 h-10 border-l-4 border-b-4 border-primary rounded-bl-2xl" />

            {/* Bottom Right */}
            <View className="absolute bottom-0 right-0 w-10 h-10 border-r-4 border-b-4 border-primary rounded-br-2xl" />
        </View>
    );
}
