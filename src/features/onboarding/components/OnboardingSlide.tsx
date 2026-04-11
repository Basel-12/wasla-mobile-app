import { Image } from "expo-image";
import React from "react";
import { Dimensions, Text, View } from "react-native";
import { OnboardingSlide as SlideType } from "../data/onboarding.data";
type OnboardingSlideProps = {
	slide: SlideType;
};
const { width } = Dimensions.get("window");
export const OnboardingSlide = ({ slide }: OnboardingSlideProps) => {
	const renderTitle = () => {
		if (slide.highlightedWord) {
			return (
				<View className="flex-row flex-wrap justify-center">
					<Text className="text-3xl font-bold text-center text-black">
						{slide.title}{" "}
					</Text>
					<Text className="text-3xl font-bold text-center text-mainBlue">
						{slide.highlightedWord}
					</Text>
				</View>
			);
		}
		return (
			<Text className="text-5xl leading-tight font-bold text-black">
				{slide.title}
			</Text>
		);
	};
	return (
		<View style={{ width }} className="flex-1 items-center px-6">
			<View className="justify-center items-center w-full">
				<View className="w-full aspect-square rounded-3xl overflow-hidden bg-bgGrey">
					<Image
						source={slide.image}
						style={{ width: "100%", height: "100%" }}
						contentFit="cover"
					/>
				</View>
			</View>
			<View className="py-8">
				<View className="h-1 w-14 bg-secondary rounded-full"/>
				{renderTitle()}
				<Text className="text-base text-gray-500 mt-2 leading-6 ">
					{slide.description}
				</Text>
			</View>
		</View>
	);
};
