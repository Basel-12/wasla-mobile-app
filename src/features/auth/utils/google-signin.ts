import { GoogleSignin } from '@react-native-google-signin/google-signin';
export function configureGoogleSignIn() {
    console.log('=== GOOGLE CONFIG ===');
    console.log('webClientId:', process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);
    console.log('type:', typeof process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);
    console.log('====================');
    return GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        // androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        offlineAccess: false,
    });
}
