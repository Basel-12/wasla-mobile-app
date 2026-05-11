import { Image } from "expo-image";
import { Text, View } from "react-native";

type AuthFormProps = {
	title: string;
	subtitle?: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
	titleClassName?: string;
	imageSource?: string;
};

export const AuthForm = ({
	title,
	subtitle,
	children,
	footer,
	titleClassName,
	imageSource,
}: AuthFormProps) => {

	return (
		<View
			className={`p-2 gap-6 `}
		>

			{imageSource && (
			<View className="w-full flex-row items-center justify-center">
				<Image
					source={imageSource}
					style={{ width: "100%", height: 200 }}
					contentFit="contain"
				/>
			</View>
			)}
			<View className="bg-secondary h-1 w-14 rounded-full" />
			{/* Header */}
			<View className="">
				<Text
					className={`text-5xl font-bold text-gray-900 w-2/3 ${titleClassName ?? ""}`}
				>
					{title}
				</Text>
				{subtitle && (
					<Text className="text-base text-gray-500 mt-2 ">
						{subtitle}
					</Text>
				)}
			</View>

			{/* Form Fields */}
			<View className="gap-4">{children}</View>

			{/* Footer (links, social login, etc.) */}
			{footer && <View className="mt-6">{footer}</View>}
		</View>
	);
};
