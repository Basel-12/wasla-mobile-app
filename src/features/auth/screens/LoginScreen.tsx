import { useTranslation } from "react-i18next";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { AuthForm } from "../components/AuthForm";
import { AuthLayout } from "../components/AuthLayout";
import { Href, router } from "expo-router";
import CustomButton from "@/components/CustomButton";

export default function LoginScreen() {
	const { t } = useTranslation();
	return (
		<AuthLayout>
			<AuthForm
				title={t("auth.login.title")}
				subtitle={t("auth.login.subtitle")}
			>
				<View className="p-4 gap-6">
					<View>
						<Text className="text-black mb-2 text-md">
							{t("auth.login.email")}
						</Text>
						<TextInput
							placeholder="email@example.com"
							keyboardType="email-address"
							autoCapitalize="none"
							autoComplete="email"
							textContentType="emailAddress"
							accessibilityLabel={t("auth.login.email")}
							accessibilityRole="text"
							accessibilityState={{ disabled: false }}
							accessibilityValue={{ text: "" }}
							multiline={false}
							className="border border-gray-300 rounded-md py-4 px-4 focus:border-mainBlue"
						/>
					</View>
					<View>
						<View className="flex-row items-center justify-between">
							<Text className="text-black mb-2 text-md w-1/2">{t("auth.login.password")}</Text>
							<TouchableOpacity onPress={() => router.push("/(auth)/forgot-password" as Href)}>
								<Text className="text-mainBlue text-sm">{t("auth.login.forgotPassword")}</Text>
							</TouchableOpacity>
						</View>
						<TextInput
							placeholder="********"
							keyboardType="default"
							autoCapitalize="none"
							secureTextEntry={true}
							autoComplete="password"
							textContentType="password"
							accessibilityLabel={t("auth.login.password")}
							accessibilityRole="text"
							accessibilityState={{ disabled: false }}
							accessibilityValue={{ text: "" }}
							className="border border-gray-300 rounded-md py-4 px-4 focus:border-mainBlue"
							multiline={false}
						/>
					</View>
					<CustomButton
						title={t("auth.login.signIn")}
						onPress={() => router.push("/(app)/home" as Href)}
						fullWidth
					/>
				</View>
			</AuthForm>
		</AuthLayout>
	);
}
