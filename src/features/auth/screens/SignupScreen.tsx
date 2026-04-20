import CustomButton from "@/components/CustomButton";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { Href, router } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { AuthForm } from "../components/AuthForm";
import { AuthLayout } from "../components/AuthLayout";
import { authService } from "../services/auth.service";
import { SignupForm, signupSchema } from "../validations/auth.schema";

export const SignupScreen = () => {
	const { t } = useTranslation();
	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<SignupForm>({
		resolver: zodResolver(signupSchema(t)),
		mode: "onTouched",
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});
	const [isLoading, setIsLoading] = useState(false);

	const onSubmit = async (data: SignupForm) => {
		try {
			setIsLoading(true);
			const response = await authService.signup(
				data.name,
				data.email,
				data.password,
			);
			Toast.show({
				type: "success",
				text1: response.message,
				visibilityTime: 2000,
			});
			const userId = response.data.id;
			router.replace({
				pathname: "/(auth)/verify",
				params: {
					userId,
					type: "signup",
				}
			});
		} catch (error) {
			if (error instanceof AxiosError) {
				Toast.show({
					type: "error",
					text1:
						error.response?.data.message ||
						"An unknown error occurred",
					visibilityTime: 2000,
				});
			}
		} finally {
			setIsLoading(false);
		}
	};
	return (
		<AuthLayout>
			<AuthForm
				title={t("auth.signup.title")}
				subtitle={t("auth.signup.subtitle")}
			>
				<View className="gap-6">
					{/* Name */}
					<View>
						<Text className="text-[#63677E] mb-2 text-md">
							{t("auth.signup.name")}
						</Text>
						<Controller
							control={control}
							name="name"
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<TextInput
									placeholder={t("auth.signup.name")}
									keyboardType="default"
									autoCapitalize="none"
									autoComplete="name"
									textContentType="name"
									accessibilityLabel={t("auth.signup.name")}
									accessibilityRole="text"
									accessibilityState={{ disabled: false }}
									accessibilityValue={{ text: "" }}
									className="border bg-[#F3F4F9] border-gray-300 rounded-2xl p-4 focus:border-mainBlue"
									multiline={false}
									onChangeText={onChange}
									onBlur={onBlur}
									value={value}
								/>
							)}
						/>
						{errors.name && (
							<Text className="text-red-500 text-sm">
								{errors.name.message}
							</Text>
						)}
					</View>
					{/* Email */}
					<View>
						<Text className="text-[#63677E] mb-2 text-md">
							{t("auth.signup.email")}
						</Text>
						<Controller
							control={control}
							name="email"
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<TextInput
									placeholder={t("auth.signup.email")}
									keyboardType="email-address"
									autoCapitalize="none"
									autoComplete="email"
									textContentType="emailAddress"
									accessibilityLabel={t("auth.signup.email")}
									accessibilityRole="text"
									accessibilityState={{ disabled: false }}
									accessibilityValue={{ text: "" }}
									className="border bg-[#F3F4F9] border-gray-300 rounded-2xl p-4 focus:border-mainBlue"
									multiline={false}
									onChangeText={onChange}
									onBlur={onBlur}
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
					{/* Password */}
					<View>
						<Text className="text-[#63677E] mb-2 text-md">
							{t("auth.signup.password")}
						</Text>
						<Controller
							control={control}
							name="password"
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<TextInput
									placeholder={t("auth.signup.password")}
									keyboardType="default"
									autoCapitalize="none"
									autoComplete="password"
									textContentType="password"
									secureTextEntry={true}
									accessibilityLabel={t(
										"auth.signup.password",
									)}
									accessibilityRole="text"
									accessibilityState={{ disabled: false }}
									accessibilityValue={{ text: "" }}
									className="border bg-[#F3F4F9] border-gray-300 rounded-2xl p-4 focus:border-mainBlue"
									multiline={false}
									onChangeText={onChange}
									onBlur={onBlur}
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
					{/* Confirm Password */}
					<View>
						<Text className="text-[#63677E] mb-2 text-md">
							{t("auth.signup.confirmPassword")}
						</Text>
						<Controller
							control={control}
							name="confirmPassword"
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<TextInput
									placeholder={t(
										"auth.signup.confirmPassword",
									)}
									keyboardType="default"
									autoCapitalize="none"
									autoComplete="password"
									textContentType="password"
									secureTextEntry={true}
									accessibilityLabel={t(
										"auth.signup.confirmPassword",
									)}
									accessibilityRole="text"
									accessibilityState={{ disabled: false }}
									accessibilityValue={{ text: "" }}
									className="border bg-[#F3F4F9] border-gray-300 rounded-2xl p-4 focus:border-mainBlue"
									multiline={false}
									onChangeText={onChange}
									onBlur={onBlur}
									value={value}
								/>
							)}
						/>
						{errors.confirmPassword && (
							<Text className="text-red-500 text-sm">
								{errors.confirmPassword.message}
							</Text>
						)}
					</View>

					{/* Sign Up Button */}
					<CustomButton
						title={t("auth.signup.signUp")}
						onPress={handleSubmit(onSubmit)}
						fullWidth
						disabled={isLoading}
					/>

					<View className="flex-row items-center justify-center gap-2">
						<Text className="text-[#63677E] text-md">
							{t("auth.signup.haveAccount")}
						</Text>
						<TouchableOpacity
							onPress={() => router.push("/(auth)/login" as Href)}
						>
							<Text className="text-mainBlue text-md">
								{t("auth.signup.signIn")}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</AuthForm>
		</AuthLayout>
	);
};
