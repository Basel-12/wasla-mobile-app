import { useTranslation } from "react-i18next";
import { Text } from "react-native";
import { AuthForm } from "../components/AuthForm";
import { AuthLayout } from "../components/AuthLayout";

export default function LoginScreen() {
	const { t } = useTranslation();
	return (
		<AuthLayout>
			<AuthForm
				title={t("auth.login.title")}
				subtitle={t("auth.login.subtitle")}
			>
				<Text className="text-gray-500">{t("auth.login.email")}</Text>
			</AuthForm>
		</AuthLayout>
	);
}
