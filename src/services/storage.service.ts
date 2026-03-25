import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
export class StorageService {
	/** Secure Storage Methods */
	static async setItemSecure(key: string, value: string): Promise<void> {
		try {
			await SecureStore.setItemAsync(key, value);
		} catch (error) {
			console.error(`Error setting secure item: ${error}`);
		}
	}
	static async getItemSecure(
		key: string,
		IsJson: boolean,
	): Promise<string | null> {
		try {
			const value = await SecureStore.getItemAsync(key);
			if (IsJson && value) {
				return JSON.parse(value);
			}
			return value;
		} catch (error) {
			console.error(`Error getting secure item: ${error}`);
			return null;
		}
	}
	static async removeItemSecure(key: string): Promise<void> {
		try {
			await SecureStore.deleteItemAsync(key);
		} catch (error) {
			console.error(`Error removing secure item: ${error}`);
		}
	}

	/**Async Storage Methods */
	static async setItem(key: string, value: string): Promise<void> {
		try {
			await AsyncStorage.setItem(key, value);
		} catch (error) {
			console.error(`Error setting item: ${error}`);
		}
	}
	static async getItem(key: string, IsJson: boolean): Promise<string | null> {
		try {
			const value = await AsyncStorage.getItem(key);
			if (IsJson && value) {
				return JSON.parse(value);
			}
			return value;
		} catch (error) {
			console.error(`Error getting item: ${error}`);
			return null;
		}
	}
	static async removeItem(key: string): Promise<void> {
		try {
			await AsyncStorage.removeItem(key);
		} catch (error) {
			console.error(`Error removing item: ${error}`);
		}
	}
}
