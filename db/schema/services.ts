import { relations } from "drizzle-orm";
import { boolean, integer, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { id, timestamps } from "@/db/fields";

export const serviceAudienceEnum = pgEnum("service_audience", [
	"dariah_team",
	"global",
	"national_local",
]);

export const serviceSshocMarketplaceStatusEnum = pgEnum("service_marketplace_status", [
	"no",
	"not_applicable",
	"yes",
]);

export const serviceStatusEnum = pgEnum("service_status", [
	"discontinued",
	"in_preparation",
	"live",
	"needs_review",
	"to_be_discontinued",
]);

export const serviceTypeEnum = pgEnum("service_type", ["community", "core", "internal"]);

export const servicesTable = pgTable("services", {
	id,
	name: text().notNull(),
	agreements: text(),
	audience: serviceAudienceEnum(),
	dariahBranding: boolean(),
	eoscOnboarding: boolean(),
	sshocMarketplaceStatus: serviceSshocMarketplaceStatusEnum(),
	sshocMarketplaceId: text(),
	monitoring: boolean(),
	privateSupplier: boolean(),
	status: serviceStatusEnum(),
	technicalContact: text(),
	technicalReadinessLevel: integer(),
	type: serviceTypeEnum(),
	url: text().array(),
	valueProposition: text(),
	sizeId: uuid()
		.notNull()
		.references(() => {
			return serviceSizesTable.id;
		}),
	...timestamps,
});

export const serviceRelations = relations(servicesTable, () => {
	return {};
});

export type DbService = typeof servicesTable.$inferSelect;
export type DbServiceInput = typeof servicesTable.$inferInsert;

//

export const serviceSizeTypeEnum = pgEnum("service_size_type", [
	"core",
	"large",
	"medium",
	"small",
]);

export const serviceSizesTable = pgTable("service_sizes", {
	id,
	type: serviceSizeTypeEnum().notNull(),
	annualValue: integer().notNull(),
	...timestamps,
});

export const serviceSizeRelations = relations(serviceSizesTable, () => {
	return {};
});

export type DbServiceType = typeof serviceSizesTable.$inferSelect;
export type DbServiceTypeInput = typeof serviceSizesTable.$inferInsert;
