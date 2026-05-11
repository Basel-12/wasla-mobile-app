import { getLocales } from 'expo-localization';
import { reloadAsync } from 'expo-updates';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DevSettings, I18nManager } from 'react-native';

/** Import translations */
import { StorageService } from '@/services/storage.service';
import { StorageKeys } from '@/utils/constants';
import ar from './ar.json';
import en from './en.json';

/** Initialize i18n */
const resources = {
    en: { translation: en },
    ar: { translation: ar },
};

const supportedLanguages = ['en', 'ar'];

i18n.use(initReactI18next).init({
    compatibilityJSON: 'v4',
    lng: 'en',
    fallbackLng: 'en',
    resources,
    interpolation: {
        escapeValue: false,
    },
    react: {
        useSuspense: true,
    },
});

export const initializeLanguage = async () => {
    const language = await StorageService.getItem(StorageKeys.Language, false);

    console.log("stored language", language);
    // const language = 'ar';

    if (language) {
        i18n.changeLanguage(language);
        return language;
    } else {
        const deviceLanguage = getLocales()[0]?.languageCode || 'en';
        const supportedLang = supportedLanguages.includes(deviceLanguage)
            ? deviceLanguage
            : 'en';
        i18n.changeLanguage(supportedLang);
        await StorageService.setItem(StorageKeys.Language, supportedLang);
        return supportedLang;
    }
};

export const changeLanguage = async (language: string) => {
    await StorageService.setItem(StorageKeys.Language, language);
    i18n.changeLanguage(language);
};

/** Set the language direction */
i18n.on('languageChanged', async (lng) => {
    const isRTL = lng === 'ar';
    console.log('isRTL', isRTL);
    if (I18nManager.isRTL !== isRTL) {
        I18nManager.forceRTL(isRTL);
        I18nManager.allowRTL(isRTL);
        // Only reload when RTL direction actually changes
        await reloadAsync();
    }
});

export default i18n;
