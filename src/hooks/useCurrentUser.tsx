import { useQuery } from "@tanstack/react-query";
import { profileService } from "../features/profile/services/profile.services";

export const useProfileQuery = () =>
    useQuery({
        queryKey: ["currentUser"],
        queryFn: profileService.getProfile,
        staleTime: Infinity, // never becomes stale automatically
        gcTime: Infinity,    // never garbage-collected while app is open
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: 1,
        enabled: true,
});