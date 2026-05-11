import { TFunction } from 'i18next';
import z from 'zod';

export const editProfileSchema = (t: TFunction) =>
    z.object({
        name: z
            .string()
            .min(2, t('profileEditors.editProfile.nameMin'))
            .max(20, t('profileEditors.editProfile.nameMax')),
        phone: z
            .string()
            .regex(/^[0-9]{11}$/, t('profileEditors.editProfile.phoneInvalid')),
    });

export type EditProfileForm = z.infer<ReturnType<typeof editProfileSchema>>;
