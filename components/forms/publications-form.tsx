import type { Country, Report } from "@prisma/client";

import { PublicationsFormContent } from "@/components/forms/publications-form-content";
import type { ReportCommentsSchema } from "@/lib/schemas/report";
import { getPublications } from "@/lib/zotero";

interface PublicationsFormProps {
	comments: ReportCommentsSchema | null;
	countryCode: Country["code"];
	reportId: Report["id"];
	year: number;
}

export async function PublicationsForm(props: PublicationsFormProps) {
	const { comments, countryCode, reportId, year } = props;

	// FIXME: handle fetch errors
	const { bibliography, items } = await getPublications({ countryCode, year });

	return (
		<PublicationsFormContent
			bibliography={bibliography}
			comments={comments?.publications}
			reportId={reportId}
			total={items.length}
			year={year}
		/>
	);
}
