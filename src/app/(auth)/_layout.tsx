import { Stack } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function _layout() {
	return (
		<SafeAreaView>
			<Stack.Screen options={{ headerShown: false }} />
		</SafeAreaView>
	);
}
