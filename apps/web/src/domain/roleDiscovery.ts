import type { EmploymentType } from "./jobOpportunity";

export const roleDecisionStatuses = [
  "New",
  "Saved",
  "Rejected",
  "Revisit later",
  "Promoted"
] as const;

export type RoleDecisionStatus = (typeof roleDecisionStatuses)[number];

export const roleFreshnessStatuses = ["Unknown", "Live", "Closed"] as const;

export type RoleFreshnessStatus = (typeof roleFreshnessStatuses)[number];

export const roleRemoteEligibilities = [
  "Unknown",
  "Remote",
  "Hybrid",
  "Onsite",
  "Country restricted"
] as const;

export type RoleRemoteEligibility = (typeof roleRemoteEligibilities)[number];

export const roleSourceKinds = [
  "Search result",
  "Manual URL",
  "Pasted description",
  "Recruiter",
  "Other"
] as const;

export type RoleSourceKind = (typeof roleSourceKinds)[number];

export const roleSeniorities = [
  "Unknown",
  "Junior",
  "Mid",
  "Senior",
  "Lead",
  "Staff",
  "Principal",
  "Manager"
] as const;

export type RoleSeniority = (typeof roleSeniorities)[number];

export const roleCompanyTypes = [
  "Unknown",
  "Product",
  "Consultancy",
  "Agency",
  "Startup",
  "Enterprise",
  "Other"
] as const;

export type RoleCompanyType = (typeof roleCompanyTypes)[number];

export const roleRejectionReasons = [
  "",
  "Wrong location",
  "Wrong stack",
  "Low compensation",
  "Seniority mismatch",
  "Consultancy",
  "Duplicate",
  "Closed",
  "Other"
] as const;

export type RoleRejectionReason = (typeof roleRejectionReasons)[number];

export type RoleSearchTopic = {
  id: string;
  name: string;
  targetTitles: string;
  preferredStack: string;
  location: string;
  remotePreference: string;
  employmentType: EmploymentType;
  companyType: RoleCompanyType;
  compensation: string;
  seniority: RoleSeniority;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type RoleSearchTopicCommand = Omit<
  RoleSearchTopic,
  "id" | "createdAt" | "updatedAt"
>;

export type RoleRecord = {
  id: string;
  searchTopicId: string | null;
  company: string;
  title: string;
  postingUrl: string;
  source: string;
  sourceKind: RoleSourceKind;
  providerSource: string;
  description: string;
  rawSourceText: string;
  location: string;
  remoteEligibility: RoleRemoteEligibility;
  employmentType: EmploymentType;
  seniority: RoleSeniority;
  compensation: string;
  stack: string;
  companyType: RoleCompanyType;
  freshnessStatus: RoleFreshnessStatus;
  freshnessCheckedAt: string | null;
  decisionStatus: RoleDecisionStatus;
  rejectionReason: RoleRejectionReason;
  promotedApplicationId: string | null;
  metadata: string;
  createdAt: string;
  updatedAt: string;
};

export type RoleRecordCommand = Omit<
  RoleRecord,
  | "id"
  | "freshnessCheckedAt"
  | "decisionStatus"
  | "rejectionReason"
  | "promotedApplicationId"
  | "createdAt"
  | "updatedAt"
>;

export type RoleRecordsFilter = {
  decisionStatus?: RoleDecisionStatus;
  freshnessStatus?: RoleFreshnessStatus;
  sourceKind?: RoleSourceKind;
  searchTerm?: string;
};

export type ImportedRoleSummary = {
  roleId: string;
  company: string;
  title: string;
  postingUrl: string;
};

export type SkippedRoleSummary = {
  company: string;
  title: string;
  postingUrl: string;
  reason: string;
};

export type RoleSearchRunResult = {
  topicId: string;
  importedCount: number;
  skippedCount: number;
  imported: ImportedRoleSummary[];
  skipped: SkippedRoleSummary[];
};

export type PromoteRoleResult = {
  role: RoleRecord;
  applicationId: string;
};
