import CustomButton from "@/components/CustomButton";
import { StorageKeys } from "@/utils/constants";
import { AxiosError } from "axios";
import { Href, router, useLocalSearchParams } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { StorageService } from "../../../services/storage.service";
import { AuthLayout } from "../components/AuthLayout";
import { authService } from "../services/auth.service";

export default function VerifyScreen() {
	const { t } = useTranslation();
	const TIMERSECONDS = 60;
	const OPTLENGTH = 6;
	const [secondsLeft, setSecondsLeft] = useState(TIMERSECONDS);
	const [canResend, setCanResend] = useState(false);
	const { type, email, password , reason } = useLocalSearchParams();
	const [isLoading, setIsLoading] = useState(false);
	const [code, setCode] = useState<string[]>(Array(OPTLENGTH).fill(""));
	const inputRefs = useRef<Array<TextInput | null>>([]);

	const handleVerify = async () => {
		try {
			setIsLoading(true);
			let response;
			if (type === "reset-password") {
				response = await authService.verifyForgetPasswordOtp(
					email as string,
					code.join(""),
				);
				Toast.show({
					type: "success",
					text1: response.message,
				});
				router.replace({
					pathname: "/(auth)/reset-password",
					params: {
						email: email as string,
						reset_token: response.data,
					},
				});
			} else {
				response = await authService.verify(
					email as string,
					code.join(""),
				);
			}
			if (type === "signup") {
				Toast.show({
					type: "success",
					text1: response.message,
				});
				router.replace("/(auth)/login" as Href);
			}
			if (type === "login") {
				const response = await authService.login(
					email as string,
					password as string,
				);
				Toast.show({
					type: "success",
					text1: response.message,
				});
				//set the token in the storage
				await StorageService.setItemSecure(
					StorageKeys.TOKEN,
					response.data,
				);
				router.replace("/(app)/(home)" as Href);
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

	const handleResendOtp = async () => {
		try {
			const response = await authService.resendOtp(email as string, reason as string);
			Toast.show({
				type: "success",
				text1: response.message,
			});
			setCanResend(false);
			setSecondsLeft(TIMERSECONDS);
		} catch (error) {
			if (error instanceof AxiosError) {
				Toast.show({
					type: "error",
					text1:
						error.response?.data.message ||
						"An unknown error occurred",
				});
			}
		}
	};

	const handleCodeChange = (index: number, value: string) => {
		const char = value.slice(-1);
		const newCode = [...code];
		newCode[index] = char;
		setCode(newCode);

		if (char && index < OPTLENGTH - 1)
			inputRefs.current[index + 1]?.focus();
	};

	const handleKeyPress = (
		e: { nativeEvent: { key: string } },
		index: number,
	) => {
		if (e.nativeEvent.key === "Backspace") {
			if (index > 0) {
				const newCode = [...code];
				const isIndexEmpty = newCode[index] === "";
				isIndexEmpty
					? (newCode[index] = "")
					: (newCode[index - 1] = "");
				isIndexEmpty
					? inputRefs.current[index - 1]?.focus()
					: inputRefs.current[index]?.focus();
				setCode(newCode);
			} else {
				inputRefs.current[0]?.focus();
			}
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
				<View className="flex-row items-center justify-around gap-2"
				style={{
					direction: "ltr"
				}}
				>
					{Array.from({ length: 6 }).map((e, ind) => {
						return (
							<TextInput
								key={ind}
								maxLength={1}
								keyboardType="phone-pad"
								autoCapitalize="none"
								autoComplete="sms-otp"
								autoCorrect={false}
								textContentType="oneTimeCode"
								// autoFocus={ind === 0}
								value={code[ind]}
								onChangeText={(text) =>
									handleCodeChange(ind, text)
								}
								onKeyPress={(e) => handleKeyPress(e, ind)}
								ref={(r) => {
									inputRefs.current[ind] = r;
								}}
								style={{
									writingDirection: "ltr"
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
					disabled={isLoading || code.join("").length !== 6}
				/>

				<View className="flex-row items-center justify-center gap-2">
					<Text className="text-[#63677E] text-md">
						{t("auth.verify.didntReceive")}
					</Text>
					<TouchableOpacity
						onPress={handleResendOtp}
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
