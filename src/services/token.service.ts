import { StorageKeys } from '@/utils/constants';
import { Href, router } from 'expo-router';
import { StorageService } from './storage.service';

export const TokenService = {
    Logout: async () => {
        try {
            await StorageService.removeItemSecure(StorageKeys.TOKEN);
            await StorageService.removeItemSecure(StorageKeys.REFRESH_TOKEN);
            router.dismissAll?.();
            router.replace('/(auth)/login' as Href);
        } catch (error) {
            console.error(error);
        }
    },
};
