import "server-only";

import { assert } from "@acdh-oeaw/lib";
import { createReader } from "@keystatic/core/reader";
import { createGitHubReader } from "@keystatic/core/reader/github";
import { cookies, draftMode } from "next/headers";
import { cache } from "react";

import { env } from "@/config/env.config";
import config from "@/keystatic.config";

export const reader = cache(async () => {
	if (await isDraftModeEnabled()) {
		const branch = (await cookies()).get("ks-branch")?.value;

		assert(
			env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER != null &&
				env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_NAME != null,
			"Missing github repository config.",
		);

		if (branch) {
			return createGitHubReader(config, {
				repo: `${env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER}/${env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO_NAME}`,
				ref: branch,
				token: (await cookies()).get("keystatic-gh-access-token")?.value,
			});
		}
	}

	return createReader(process.cwd(), config);
});

async function isDraftModeEnabled(): Promise<boolean> {
	try {
		return (await draftMode()).isEnabled;
	} catch {
		return false;
	}
}
