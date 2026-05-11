import CustomHeader from "@/components/CustomHeader";
import { Href, router } from "expo-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScanScreen() {
	const { t } = useTranslation();

	useEffect(()=>{
		router.replace('+not-found' as Href)
	},[])
	return (
		<SafeAreaView className="flex-1">
			<CustomHeader title={t("camera.scan")} />
		</SafeAreaView>
	);
}
