import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TabItem from './TabItem';

export default function FloatingTabBar({ state, navigation }: any) {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const currentRoute = state.routes[state.index].name;

    const tabs = [
        {
            key: 'home',
            routeName: '(home)',
            icon: 'home',
            label: t('tabs.home'),
        },
        {
            key: 'scanner',
            routeName: 'scanner',
            icon: 'scan',
            label: t('tabs.scan'),
        },
        {
            key: 'favourites',
            routeName: '(favourites)',
            icon: 'heart',
            label: t('tabs.favourite'),
        },
        {
            key: 'profile',
            routeName: '(profile)',
            icon: 'person',
            label: t('tabs.profile'),
        },
    ];

    return (
        <View
            className="bg-white rounded-full p-2 w-[90%] mx-auto absolute z-10"
            style={{
                bottom: insets.bottom + 16,
                left: '5%',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.12,
                shadowRadius: 16,
                elevation: 10,
            }}
        >
            <BlurView
                intensity={60}
                style={{
                    padding: 3,
                    borderRadius: 999,
                }}
            >
                <View className="flex-row items-center justify-around px-6">
                    {tabs.map((tab) => {
                        const isFocused = currentRoute === tab.routeName;

                        const onPress = () => {
                            // Open fullscreen scanner
                            if (tab.routeName === 'scanner') {
                                router.push('/scanner');
                                return;
                            }

                            navigation.navigate(tab.routeName);
                        };

                        return (
                            <TabItem
                                key={tab.key}
                                onPress={onPress}
                                isFocused={isFocused}
                                iconName={tab.icon}
                                label={tab.label}
                            />
                        );
                    })}
                </View>
            </BlurView>
        </View>
    );
}
