import { TFunction } from 'i18next';
import z from 'zod';

export const changePasswordSchema = (t: TFunction) =>
    z
        .object({
            oldPassword: z
                .string()
                .min(8, t('auth.validation.resetPassword.newPassword.min')),
            newPassword: z
                .string()
                .regex(/^\S+$/, t('auth.validation.noSpaces'))
                .min(8, t('auth.validation.resetPassword.newPassword.min'))
                .regex(
                    /[A-Z]/,
                    t('auth.validation.resetPassword.newPassword.uppercase'),
                )
                .regex(
                    /\d/,
                    t('auth.validation.resetPassword.newPassword.number'),
                )
                .regex(
                    /[@_\-&]/,
                    t('auth.validation.resetPassword.newPassword.special'),
                ),
            confirmPassword: z
                .string()
                .min(
                    8,
                    t('auth.validation.resetPassword.confirmNewPassword.match'),
                )
                .regex(/^\S+$/, t('auth.validation.noSpaces')),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
            message: t(
                'auth.validation.resetPassword.confirmNewPassword.match',
            ),
            path: ['confirmPassword'],
        });

export type ChangePasswordForm = z.infer<
    ReturnType<typeof changePasswordSchema>
>;
