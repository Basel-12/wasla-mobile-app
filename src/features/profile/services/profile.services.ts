import api from '@/services/api';

export const profileService = {
    getProfile: async () => {
        const response = await api.get('/api/v1/users/me');
        return response.data;
    },

    updateAvatar: async (avatarUri: string) => {
        const formData = new FormData();

        const filename =
            avatarUri.split('/').pop() ?? `avatar-${Date.now()}.jpg`;
        const ext = filename.split('.').pop()?.toLowerCase();
        const type =
            ext === 'png'
                ? 'image/png'
                : ext === 'webp'
                  ? 'image/webp'
                  : 'image/jpeg';

        formData.append('avatar', {
            uri: avatarUri,
            name: filename,
            type,
        } as any);

        const response = await api.patch(
            '/api/v1/users/update-avatar',
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            },
        );

        return response.data;
    },

    updateLanguage: async (preferredLanguage: string) => {
        const response = await api.patch('/api/v1/users/update-profile', {
            preferredLanguage,
        });

        return response.data;
    },

    changePassword: async (oldPassword: string, newPassword: string) => {
        const response = await api.patch('/api/v1/users/change-password', {
            oldPassword,
            newPassword,
        });
        return response.data;
    },

    updateProfile: async (data: { name: string; phone: string }) => {
        const response = await api.patch('/api/v1/users/update-profile', {
            name: data.name,
            phone: data.phone,
        });
        return response.data;
    },
};
