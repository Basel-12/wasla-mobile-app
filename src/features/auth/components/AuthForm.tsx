import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

type AuthFormProps = {
	title: string;
	subtitle?: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
	titleClassName?: string;
};

export const AuthForm = ({
	title,
	subtitle,
	children,
	footer,
	titleClassName,
}: AuthFormProps) => {
	const { t } = useTranslation();

	return (
		<View
			className={`bg-white rounded-3xl p-6  border border-gray-200/50 gap-6 `}
		>
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
