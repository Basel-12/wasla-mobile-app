import CustomHeader from "@/components/CustomHeader";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScanScreen() {
	const { t } = useTranslation();
	return (
		<SafeAreaView className="flex-1">
			<CustomHeader title={t("camera.scan")} />
		</SafeAreaView>
	);
}
