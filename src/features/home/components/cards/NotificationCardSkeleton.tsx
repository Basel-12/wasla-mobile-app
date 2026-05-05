import Skeleton from "@/components/Skeleton";

export default function NotificationCardSkeleton() {
	return (
		<Skeleton
			width="100%"
			height={80}
			borderRadius={10}
			style={{
				borderWidth: 1,
				borderColor: "#E0E0E0",
				padding: 16,
				flexDirection: "row",
				alignItems: "baseline",
				justifyContent: "space-between",
			}}
		/>
	);
}
