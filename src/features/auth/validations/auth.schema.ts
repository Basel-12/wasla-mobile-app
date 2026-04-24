import { TFunction } from "i18next";
import { z } from "zod";

export const loginSchema = (t: TFunction) =>
	z.object({
		email: z.string().email(t("auth.validation.login.email.invalid")),
		password: z.string().min(8, t("auth.validation.login.password.min")),
	});

export const signupSchema = (t: TFunction) =>
	z
		.object({
			name: z.string().min(1, t("auth.validation.signup.name.required")),
			email: z.string().email(t("auth.validation.signup.email.invalid")),
			password: z
				.string()
				.min(8, t("auth.validation.signup.password.min")),
			confirmPassword: z
				.string()
				.min(8, t("auth.validation.signup.confirmPassword.match")),
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: t("auth.validation.signup.confirmPassword.match"),
			path: ["confirmPassword"],
		});

export const emailSchema = (t: TFunction) =>
	z.object({
		email: z.email(t("auth.validation.login.email.invalid")),
	});


export type LoginForm = z.infer<ReturnType<typeof loginSchema>>;
export type SignupForm = z.infer<ReturnType<typeof signupSchema>>;
export type EmailForm = z.infer<ReturnType<typeof emailSchema>>;