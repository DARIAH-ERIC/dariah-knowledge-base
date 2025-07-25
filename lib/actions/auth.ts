"use server";

import { getFormDataValues, log } from "@acdh-oeaw/lib";
import { getLocale, getTranslations } from "next-intl/server";
import type { z } from "zod";

import { getUserByEmail } from "@/lib/data/user";
import { redirect } from "@/lib/navigation/navigation";
import { type SignInFormSchema, signInFormSchema } from "@/lib/schemas/auth";
import { getCurrentSession } from "@/lib/server/auth/get-current-session";
import { verifyPassword } from "@/lib/server/auth/passwords";
import { deleteSessionTokenCookie, setSessionTokenCookie } from "@/lib/server/auth/session-cookies";
import { createSession, deleteSession } from "@/lib/server/auth/sessions";

interface SignInFormReturnValue {
	timestamp: number;
}

interface SignInFormErrors extends SignInFormReturnValue, z.typeToFlattenedError<SignInFormSchema> {
	status: "error";
}

interface SignInFormSuccess extends SignInFormReturnValue {
	status: "success";
	message: string;
}

type SignInFormState = SignInFormErrors | SignInFormSuccess;

class InvalidCredentialsError extends Error {
	name = "InvalidCredentialsError";
}

export async function signInAction(
	prevState: SignInFormState | undefined,
	formData: FormData,
): Promise<SignInFormState> {
	const locale = await getLocale();
	const t = await getTranslations("actions.signIn");

	let redirectToPathname = "/dashboard";

	try {
		const result = signInFormSchema.safeParse(getFormDataValues(formData));

		if (!result.success) {
			throw new InvalidCredentialsError();
		}

		const { email, password, redirectTo } = result.data;

		const user = await getUserByEmail({ email });
		if (user == null) {
			throw new InvalidCredentialsError();
		}

		const validPassword = await verifyPassword(password, user.password);
		if (!validPassword) {
			throw new InvalidCredentialsError();
		}

		const { token } = await createSession(user.id);
		await setSessionTokenCookie(token);

		if (redirectTo && !redirectTo.includes("/auth")) {
			redirectToPathname = redirectTo;
		}
	} catch (error) {
		log.error(error);

		if (error instanceof InvalidCredentialsError) {
			return {
				status: "error" as const,
				formErrors: [t("errors.CredentialsSignInError")],
				fieldErrors: {},
				timestamp: Date.now(),
			};
		}

		return {
			status: "error" as const,
			formErrors: [t("errors.DefaultAuthError")],
			fieldErrors: {},
			timestamp: Date.now(),
		};
	}

	redirect({ href: redirectToPathname, locale });
}

export async function signOutAction(): Promise<void> {
	const locale = await getLocale();

	const { session } = await getCurrentSession();

	if (session == null) {
		throw new Error("Not authenticated.");
	}

	await deleteSession(session.id);
	await deleteSessionTokenCookie();

	redirect({ href: "/", locale });
}
