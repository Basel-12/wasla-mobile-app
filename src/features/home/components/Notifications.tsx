import { useTranslation } from "react-i18next";
import NotificationCard from "./cards/NotificationCard";
import Section from "./Section";

export default function Notifications() {
	const { t } = useTranslation();
	return (
		<Section
			title={t("home.notifications.title")}
			viewAll={true}
			viewAllText={t("home.notifications.viewAll")}
			onViewAllPress={() => {}}
		>
			{Array.from({ length: 5 }).map((_, index) => (
				<NotificationCard key={index} />
			))}
		</Section>
	);
}
