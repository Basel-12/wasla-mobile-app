import CustomButton from "@/components/CustomButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Href, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { AuthForm } from "../components/AuthForm";
import { AuthLayout } from "../components/AuthLayout";
import {
	ResetPasswordForm,
	resetPasswordSchema,
} from "../validations/auth.schema";
import i18n from "@/i18n/i18n";
import { authService } from "../services/auth.service";
import Toast from "react-native-toast-message";
import { AxiosError } from "axios";

export default function ResetPasswordScreen() {
	const { t } = useTranslation();
	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<ResetPasswordForm>({
		resolver: zodResolver(resetPasswordSchema(t)),
		mode: "all",
		defaultValues: {
			newPassword: "",
			confirmNewPassword: "",
		},
	});
	const { email, reset_token } = useLocalSearchParams();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const onSubmit = async (data: ResetPasswordForm) => {
		try{
			setIsLoading(true);
			const response = await authService.resetPassword(reset_token as string, data.newPassword);
			Toast.show({
				type: "success",
				text1: response.message,
			});
			router.replace("/(auth)/login" as Href);
		}catch(error){
			console.log(error);
			if(error instanceof AxiosError) {
				Toast.show({
					type: "error",
					text1: error.response?.data.message || "An unknown error occurred",
				});
			}
		}
		finally{
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (!reset_token) {
			router.replace("/not-found" as Href);
		}
	}, [reset_token]);

	if (!reset_token) {
		return null;
	}

	return (
		<AuthLayout>
			<AuthForm
				title={t("auth.resetPassword.title")}
				subtitle={t("auth.resetPassword.subtitle")}
				titleClassName="w-full leading-tight"
			>
				<View className="gap-6">
					<View>
						<Text className="text-[#63677E] mb-2 text-md">
							{t("auth.resetPassword.newPassword")}
						</Text>
						<Controller
							control={control}
							name="newPassword"
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<View className="relative">
									<TextInput
										placeholder={t(
											"auth.resetPassword.newPasswordPlaceholder",
										)}
										placeholderTextColor="#63677E"
										textAlign={
											i18n.language === "ar"
												? "right"
												: "left"
										}
										style={{
											writingDirection:
												i18n.language === "ar"
													? "rtl"
													: "ltr",
										}}
										value={value}
										onChangeText={onChange}
										onBlur={onBlur}
										className="border bg-[#F3F4F9] border-gray-300 rounded-2xl p-4 focus:border-mainBlue text-black"
										keyboardType="default"
										autoCapitalize="none"
										autoComplete="password"
										textContentType="password"
										accessibilityLabel={t(
											"auth.resetPassword.newPassword",
										)}
										accessibilityRole="text"
										secureTextEntry={!showPassword}
									/>
									<TouchableOpacity
										onPress={() =>
											setShowPassword(!showPassword)
										}
										className="absolute right-4 top-1/2 -translate-y-1/2"
										activeOpacity={0.8}
										accessibilityLabel={
											showPassword
												? "Hide password"
												: "Show password"
										}
										accessibilityRole="button"
									>
										<Ionicons
											name={
												showPassword
													? "eye-off-outline"
													: "eye-outline"
											}
											size={22}
											color="#63677E"
										/>
									</TouchableOpacity>
								</View>
							)}
						/>
						{errors.newPassword && (
							<Text className="text-red-500 text-sm">
								{errors.newPassword.message}
							</Text>
						)}
					</View>
					<View>
						<Text className="text-[#63677E] mb-2 text-md">
							{t("auth.resetPassword.confirmNewPassword")}
						</Text>
						<Controller
							control={control}
							name="confirmNewPassword"
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<View className="relative">
									<TextInput
										placeholder={t(
											"auth.resetPassword.confirmNewPasswordPlaceholder",
										)}
										placeholderTextColor="#63677E"
										textAlign={
											i18n.language === "ar"
												? "right"
												: "left"
										}
										style={{
											writingDirection:
												i18n.language === "ar"
													? "rtl"
													: "ltr",
										}}
										value={value}
										onChangeText={onChange}
										onBlur={onBlur}
										className="border bg-[#F3F4F9] border-gray-300 rounded-2xl p-4 focus:border-mainBlue text-black"
										keyboardType="default"
										autoCapitalize="none"
										autoComplete="password"
										textContentType="password"
										secureTextEntry={!showConfirmPassword}
										accessibilityLabel={t(
											"auth.resetPassword.confirmNewPassword",
										)}
										accessibilityRole="text"
									/>
									<TouchableOpacity
										onPress={() =>
											setShowConfirmPassword(
												!showConfirmPassword,
											)
										}
										className="absolute right-4 top-1/2 -translate-y-1/2"
										activeOpacity={0.8}
										accessibilityLabel={
											showConfirmPassword
												? "Hide password"
												: "Show password"
										}
										accessibilityRole="button"
									>
										<Ionicons
											name={
												showConfirmPassword
													? "eye-off-outline"
													: "eye-outline"
											}
											size={22}
											color="#63677E"
										/>
									</TouchableOpacity>
								</View>
							)}
						/>
						{errors.confirmNewPassword && (
							<Text className="text-red-500 text-sm">
								{errors.confirmNewPassword.message}
							</Text>
						)}
					</View>
					<View>
						<CustomButton
							title={t("auth.resetPassword.resetPassword")}
							onPress={handleSubmit(onSubmit)}
							fullWidth
							disabled={isLoading}
						/>
					</View>
				</View>
			</AuthForm>
		</AuthLayout>
	);
}
