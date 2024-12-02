export class AuthenticationError extends Error {
	name = "AuthenticationError";
}

export class EmailInUseError extends Error {
	name = "EmailInUseError";
}

export class InvalidUserIdError extends Error {
	name = "InvalidUserIdError";
}

export class InvalidVerificationCodeError extends Error {
	name = "InvalidVerificationCodeError";
}

export class RateLimitError extends Error {
	name = "RateLimitError";
}

export class SignInError extends Error {
	name = "SignInError";
}
