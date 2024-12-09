import { join } from "node:path";

import { log } from "@acdh-oeaw/lib";
import { pgGenerate } from "drizzle-dbml-generator";

import * as schema from "@/db/schema";

const out = join(process.cwd(), "public", "schema.dbml");

// eslint-disable-next-line @typescript-eslint/require-await
async function generate() {
	pgGenerate({ schema, out, relational: false });
}

generate()
	.then(() => {
		log.success("Successfully generated dbml schema.");
	})
	.catch((error: unknown) => {
		log.error("Failed to generate dbml schcema.\n", String(error));
	});
