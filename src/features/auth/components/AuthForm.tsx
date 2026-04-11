import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";

type AuthFormProps = {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
};

export const AuthForm = ({ title, subtitle, children, footer }: AuthFormProps) => {
    const { t } = useTranslation();
    
    return (
        <View className=" bg-white rounded-xl py-6 px-2 my-auto border border-gray-200/50">
            {/* Header */}
            <View className="mb-8">
                <Text className="text-3xl font-bold text-gray-900 text-center">
                    {title}
                </Text>
                {subtitle && (
                    <Text className="text-base text-gray-500 mt-2 text-center">
                        {subtitle}
                    </Text>
                )}
            </View>

            {/* Form Fields */}
            <View className="gap-4">
                {children}
            </View>

            {/* Footer (links, social login, etc.) */}
            {footer && (
                <View className="mt-6">
                    {footer}
                </View>
            )}
        </View>
    );
};