import CustomButton from "@/components/CustomButton";
import { AxiosError } from "axios";
import { Href, router, useLocalSearchParams } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { AuthLayout } from "../components/AuthLayout";
import { authService } from "../services/auth.service";
import { StorageService } from "../../../services/storage.service";
import { StorageKeys } from "@/utils/constants";

export default function VerifyScreen() {
	const { t } = useTranslation();
	const TIMERSECONDS = 60;
	const [currInd, setCurrInd] = useState(0);
	const [secondsLeft, setSecondsLeft] = useState(TIMERSECONDS);
	const [canResend, setCanResend] = useState(false);
	const { userId, type, email, password } = useLocalSearchParams();
	const [isLoading, setIsLoading] = useState(false);
	const [code, setCode] = useState("");

	const handleVerify = async () => {
		try {
			setIsLoading(true);
			const response = await authService.verify(
				userId as string,
				code as string,
			);
			Toast.show({
				type: "success",
				text1: response.message,
			});
			if (type === "signup") {
				router.replace("/(auth)/login" as Href);
			}
			if (type === "login") {
				const response = await authService.login(email as string, password as string);
				Toast.show({
					type: "success",
					text1: response.message,
				});
				//set the token in the storage
				await StorageService.setItemSecure(StorageKeys.TOKEN, response.data)
				router.replace("/(app)/home" as Href);
			}
		} catch (error) {
			if (error instanceof AxiosError) {
				Toast.show({
					type: "error",
					text1:
						error.response?.data.message ||
						"An unknown error occurred",
				});
			}
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (secondsLeft <= 0) {
			setCanResend(true);
			return;
		}
		const timer = setInterval(
			() => setSecondsLeft((prev) => prev - 1),
			1000,
		);
		return () => clearInterval(timer);
	}, [secondsLeft]);
	
	return (
		<AuthLayout>
			<View className="gap-6">
				{/* aniamtion */}
				<View className="flex-row items-center justify-center">
					<LottieView
						source={require("@/assets/Inbox Delivery.json")}
						autoPlay
						loop
						style={{ width: 200, height: 200 }}
					/>
				</View>

				{/* Header */}
				<View className="p-3 gap-3">
					<View className="bg-secondary h-1 w-14 rounded-full" />
					<Text className="w-full leading-normal text-5xl font-bold text-gray-900">
						{t("auth.verify.title")}
					</Text>
					<Text className="w-2/3  text-base text-Neutral">
						{t("auth.verify.subtitle")}
					</Text>
				</View>

				{/* code inputs */}
				<View className="flex-row items-center justify-around gap-2">
					{Array.from({ length: 6 }).map((e, ind) => {
						return (
							<TextInput
								key={ind}
								maxLength={1}
								keyboardType="phone-pad"
								autoCapitalize="none"
								autoComplete="off"
								autoCorrect={false}
								autoFocus={ind === currInd}
								value={code[ind]}
								onChangeText={(text) => {
									setCode((prev) => prev + text);
									setCurrInd((prev) =>
										prev + 1 < 6 ? prev + 1 : prev,
									);
								}}
								className="w-12 h-16 rounded-2xl bg-gray-300 text-center text-2xl font-bold border border-gray-300 focus:border-secondary"
							/>
						);
					})}
				</View>

				<CustomButton
					title={t("auth.verify.verify")}
					fullWidth
					onPress={handleVerify}
					disabled={isLoading || code.length !== 6}
				/>

				<View className="flex-row items-center justify-center gap-2">
					<Text className="text-[#63677E] text-md">
						{t("auth.verify.didntReceive")}
					</Text>
					<TouchableOpacity
						// onPress={() => router.push("/(auth)/login" as Href)}
						disabled={!canResend}
					>
						<Text
							className="text-mainBlue text-md disabled:text-gray-400"
							disabled={!canResend}
						>
							{t("auth.verify.resend")}
						</Text>
					</TouchableOpacity>
				</View>

				<View className="flex-row items-center justify-between">
					<Text className="text-[#63677E] text-md">
						{t("auth.verify.resendIn")}
					</Text>
					<Text className="text-Tertiary text-md">
						{secondsLeft}s
					</Text>
				</View>

				<View className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
					<View
						style={{
							width: `${(secondsLeft / TIMERSECONDS) * 100}%`,
						}}
						className="h-full bg-primary"
					/>
				</View>
			</View>
		</AuthLayout>
	);
}
