import { ImageSourcePropType } from "react-native";

export type OnboardingSlide = {
	id: string;
	image: ImageSourcePropType;
	title: string;
	highlightedWord?: string;
	description: string;
	buttonText: string;
};

export const slides = [
	{
		id: "1",
		image: require("../../../../assets/images/onboarding/slide1.png"),
		title: "Communicate Without Barriers",
		description:
			"Bridging the gap between sign language and spoken words in real-time with our advanced AI technology.",
		buttonText: "Next",
	},
	{
		id: "2",
		image: require("../../../../assets/images/onboarding/slide2.png"),
		title: "Translate Signs",
		highlightedWord: "Instantly",
		description:
			"Point your camera at any hand sign to get real-time text and audio translations. Communication made effortless.",
		buttonText: "Continue",
	},
	{
		id: "3",
		image: require("../../../../assets/images/onboarding/slide3.png"),
		title: "Connect With the Community",
		description:
			"Join a vibrant community where you can share experiences, learn together, and build lasting connections with SignBridge users worldwide.",
		buttonText: "Get Started",
	},
];
