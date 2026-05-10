import type { FollowUpReminder, JobApplication } from "./jobOpportunity";

export function isClosedApplication(application: JobApplication) {
  return application.stage === "Rejected" || application.stage === "Withdrawn";
}

export function isActiveApplication(application: JobApplication) {
  return !isClosedApplication(application);
}

export function filterActionableFollowUpReminders(
  applications: JobApplication[],
  reminders: FollowUpReminder[]
) {
  const applicationsById = new Map(
    applications.map((application) => [application.id, application])
  );

  return reminders.filter((reminder) => {
    if (reminder.completedAt) {
      return false;
    }

    const application = applicationsById.get(reminder.applicationId);

    return application ? isActiveApplication(application) : false;
  });
}
