import CustomButton from "@/components/CustomButton";
import { Href, router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	Dimensions,
	FlatList,
	Pressable,
	Text,
	View,
	ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OnboardingSlide } from "../components/OnboardingSlide";
import { useSlides } from "../data/onboarding.data";
const { width } = Dimensions.get("window");
export const OnboardingScreen = () => {
	const { t } = useTranslation();
	const [currentIndex, setCurrentIndex] = useState(0);
	const flatListRef = useRef<FlatList>(null);
	const insets = useSafeAreaInsets();
	const slides = useSlides();

	const handleViewableItemsChanged = useCallback(
		({ viewableItems }: { viewableItems: ViewToken[] }) => {
			if (viewableItems.length > 0 && viewableItems[0].index !== null) {
				setCurrentIndex(viewableItems[0].index);
			}
		},
		[],
	);

	const viewabilityConfig = useRef({
		viewAreaCoveragePercentThreshold: 50,
	}).current;

	const completeOnboarding = async () => {
		// await StorageService.setItem(StorageKeys.ONBOARDING_COMPLETED, "true");
		router.replace("/(auth)/login" as Href);
	};

	const handleSkip = () => {
		completeOnboarding();
	};

	const handleNext = () => {
		if (currentIndex < slides.length - 1) {
			flatListRef.current?.scrollToIndex({
				index: currentIndex + 1,
				animated: true,
			});
		} else {
			completeOnboarding();
		}
	};

	const renderPaginationDots = () => (
		<View className="flex-row gap-2 mb-6">
			{slides.map((_, index) => (
				<View
					key={index}
					className={`h-2 rounded-full ${
						index === currentIndex
							? "w-8 bg-mainBlue"
							: "w-2 bg-gray-300"
					}`}
				/>
			))}
		</View>
	);

	return (
		<View
			className="flex-1 bg-white"
			style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
		>
			<View className="flex-row justify-end px-6 py-4">
				<Pressable onPress={handleSkip} hitSlop={10}>
					<Text className="text-mainBlue text-lg font-medium">
						{t("onboarding.skip")}
					</Text>
				</Pressable>
			</View>

			<View className="flex-1 justify-between">
				<View className="flex-1 ">
					<FlatList
						ref={flatListRef}
						data={slides}
						renderItem={({ item }) => (
							<OnboardingSlide slide={item} />
						)}
						keyExtractor={(item) => item.id}
						horizontal
						pagingEnabled
						showsHorizontalScrollIndicator={false}
						onViewableItemsChanged={handleViewableItemsChanged}
						viewabilityConfig={viewabilityConfig}
						bounces={false}
					/>
					<View className="px-6 pb-6 ">{renderPaginationDots()}</View>
				</View>

				<View className="px-6 pb-6">
					<CustomButton
						title={slides[currentIndex].buttonText}
						onPress={handleNext}
						fullWidth
						showArrow
					/>
				</View>
			</View>
		</View>
	);
};
