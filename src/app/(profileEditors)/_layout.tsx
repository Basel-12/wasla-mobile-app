import { Stack } from "expo-router";

export default function ProfileEditorsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="language" />
            <Stack.Screen name="new-password" />
            <Stack.Screen name="edit-profile" />
        </Stack>
    );
}
