import CustomButton from "@/components/CustomButton";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { Href, router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Keyboard, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { AuthForm } from "../components/AuthForm";
import { AuthLayout } from "../components/AuthLayout";
import { authService } from "../services/auth.service";
import { LoginForm, loginSchema } from "../validations/auth.schema";
import { StorageService } from "@/services/storage.service";
import { StorageKeys } from "@/utils/constants";

export default function LoginScreen() {
	const { t } = useTranslation();
	const [isFocusedEmail, setIsFocusedEmail] = useState(false);
	const [isFocusedPassword, setIsFocusedPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isCheckingToken, setIsCheckingToken] = useState(true);
	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginForm>({
		resolver: zodResolver(loginSchema(t)),
		mode: "onTouched",
		defaultValues: {
			email: "",
			password: "",
		},
	});

	useEffect(() => {
		const checkToken = async () => {
			const token = await StorageService.getItemSecure(StorageKeys.TOKEN, false);
			// if (token) {
			// 	router.replace("/(app)/(home)" as Href);
			// }
			// else{
			// 	setIsCheckingToken(false);
			// }
			setIsCheckingToken(false);
		};
		checkToken();
	}, []);

	const onSubmit = async (data: LoginForm) => {
		try {
			Keyboard.dismiss();
			setIsLoading(true);
			const response = await authService.login(data.email, data.password);
			Toast.show({
				type: "success",
				text1: response.data.message,
			});
			//set the token in the storage 
			await StorageService.setItemSecure(StorageKeys.TOKEN, response.data)
			router.push("/(app)/(home)" as Href);
		} catch (error) {
			if (error instanceof AxiosError) {
				Toast.show({
					type: "error",
					text1: error.response?.data.message || "An unknown error occurred",
				});
			if(error.response?.status === 403)
				router.push({
					pathname: "/(auth)/verify",
					params: {
						email: data.email,
						password: data.password,
						type: "login",
					},
				});
			}
		} finally {
			setIsLoading(false);
		}
	};

	if (isCheckingToken) return null;
	
	return (
		<AuthLayout>
			<AuthForm
				title={t("auth.login.title")}
				subtitle={t("auth.login.subtitle")}
			>
				<View className="gap-6">
					{/* email input */}
					<View>
						<Text className="text-[#63677E] mb-2 text-md">
							{t("auth.login.email")}
						</Text>
						<Controller
							control={control}
							name="email"
							render={({
								field: { onChange, onBlur, value },
							}) => (
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
									className={`text-black border bg-[#F3F4F9] border-gray-300 rounded-2xl p-4   ${errors.email ? "border-red-500" : isFocusedEmail ? "border-mainBlue" : "border-gray-300"}`}
									onChangeText={onChange}
									onBlur={() => {
										onBlur();
										setIsFocusedEmail(false);
									}}
									onFocus={() => {
										setIsFocusedEmail(true);
									}}
									value={value}
								/>
							)}
						/>
						{errors.email && (
							<Text className="text-red-500 text-sm">
								{errors.email.message}
							</Text>
						)}
					</View>

					{/* password input */}
					<View>
						<View className="flex-row items-center justify-between">
							<Text className="text-[#63677E] mb-2 text-md w-1/2">
								{t("auth.login.password")}
							</Text>
							<TouchableOpacity
								onPress={() =>
									router.push(
										"/(auth)/forgot-password" as Href,
									)
								}
							>
								<Text className="text-mainBlue text-sm">
									{t("auth.login.forgotPassword")}
								</Text>
							</TouchableOpacity>
						</View>
						<Controller
							control={control}
							name="password"
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<TextInput
									placeholder="********"
									keyboardType="default"
									autoCapitalize="none"
									secureTextEntry={true}
									autoComplete="password"
									textContentType="password"
									accessibilityLabel={t(
										"auth.login.password",
									)}
									accessibilityRole="text"
									accessibilityState={{ disabled: false }}
									accessibilityValue={{ text: "" }}
									className={`text-black border bg-[#F3F4F9] border-gray-300 rounded-2xl p-4   ${errors.password ? "border-red-500" : isFocusedPassword ? "border-mainBlue" : "border-gray-300"}`}
									multiline={false}
									onChangeText={onChange}
									onBlur={() => {
										onBlur();
										setIsFocusedPassword(false);
									}}
									onFocus={() => {
										setIsFocusedPassword(true);
									}}
									value={value}
								/>
							)}
						/>
						{errors.password && (
							<Text className="text-red-500 text-sm">
								{errors.password.message}
							</Text>
						)}
					</View>

					{/* login button */}
					<CustomButton
						title={t("auth.login.signIn")}
						fullWidth
						onPress={handleSubmit(onSubmit)}
						disabled={isLoading}
					/>
					<View className="flex-row items-center justify-center gap-2">
						<Text className="text-[#63677E] text-md">
							{t("auth.login.noAccount")}
						</Text>
						<TouchableOpacity
							onPress={() =>
								router.push("/(auth)/signup" as Href)
							}
						>
							<Text
								className="text-mainBlue text-md
								"
							>
								{t("auth.login.signUp")}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</AuthForm>
		</AuthLayout>
	);
}
