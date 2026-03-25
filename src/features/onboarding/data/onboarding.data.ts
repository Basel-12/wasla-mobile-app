import { useTranslation } from "react-i18next";
import { ImageSourcePropType } from "react-native";

export type OnboardingSlide = {
	id: string;
	image: ImageSourcePropType;
	title: string;
	highlightedWord?: string;
	description: string;
	buttonText: string;
};

export const useSlides = () => {
	const { t } = useTranslation();
	return [
		{
			id: "1",
			image: require("../../../../assets/images/onboarding/slide1.png"),
			title: t("onboarding.slide1.title"),
			description: t("onboarding.slide1.description"),
			buttonText: t("onboarding.slide1.buttonText"),
		},
		{
			id: "2",
			image: require("../../../../assets/images/onboarding/slide2.png"),
			title: t("onboarding.slide2.title"),
			description: t("onboarding.slide2.description"),
			buttonText: t("onboarding.slide2.buttonText"),
		},
		{
			id: "3",
			image: require("../../../../assets/images/onboarding/slide3.png"),
			title: t("onboarding.slide3.title"),
			description: t("onboarding.slide3.description"),
			buttonText: t("onboarding.slide3.buttonText"),
		},
	];
};
