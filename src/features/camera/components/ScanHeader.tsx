import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

export default function ScanHeader() {
    return (
        <View className="flex-row items-center justify-between  p-6">
            <View>
                    <Ionicons name="close" size={24} color="black" />
            </View>

            <Text></Text>

            <View className="w-10 h-10  rounded-full">

            </View>
        </View>
    )
}