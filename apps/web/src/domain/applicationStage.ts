export const applicationStages = [
  "Saved",
  "Applied",
  "Screening",
  "Technical interview",
  "Onsite",
  "Offer",
  "Rejected",
  "Withdrawn"
] as const;

export type ApplicationStage = (typeof applicationStages)[number];
