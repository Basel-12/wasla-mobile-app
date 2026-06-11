import FloatingTabBar from '@/components/FloatingTabBar';
import { Tabs } from 'expo-router';

export default function AppLayout() {
    return (
        <Tabs
            tabBar={(props) => <FloatingTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tabs.Screen
                name="(home)"
                options={{ title: 'Home', headerShown: false }}
            />
            <Tabs.Screen
                name="(favourites)"
                options={{ title: 'Favorite words', headerShown: false }}
            />
            <Tabs.Screen
                name="(analytics)"
                options={{ title: 'Analytics', headerShown: false }}
            />
            <Tabs.Screen
                name="(profile)"
                options={{ title: 'Profile', headerShown: false }}
            />
        </Tabs>
    );
}
