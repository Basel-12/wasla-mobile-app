import { Stack } from "expo-router";
import React from "react";

export default function _layout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="login" />
			<Stack.Screen name="signup" />
			<Stack.Screen name="verify" />
			<Stack.Screen name="forget-password" />
			<Stack.Screen name="reset-password" />
		</Stack>
	);
}
