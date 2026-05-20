package domain

import "time"

type JobSource string

const (
	SourceLinkedIn    JobSource = "LinkedIn"
	SourceReferral    JobSource = "Referral"
	SourceRecruiter   JobSource = "Recruiter"
	SourceCompanySite JobSource = "Company site"
	SourceOther       JobSource = "Other"
)

type EmploymentType string

const (
	EmploymentFullTime   EmploymentType = "Full-time"
	EmploymentContract   EmploymentType = "Contract"
	EmploymentPartTime   EmploymentType = "Part-time"
	EmploymentInternship EmploymentType = "Internship"
	EmploymentOther      EmploymentType = "Other"
)

type JobApplication struct {
	ID             string
	Company        string
	RoleTitle      string
	PostingURL     string
	Source         JobSource
	Location       string
	Compensation   string
	EmploymentType EmploymentType
	Stage          ApplicationStage
	CreatedAt      time.Time
	Timeline       []TimelineEvent
	Interviews     []Interview
	FollowUps      []FollowUpReminder
	Notes          []ApplicationNote
}

type TimelineEvent struct {
	ID          string
	OccurredAt  time.Time
	Description string
}

type InterviewType string

const (
	InterviewRecruiterScreen InterviewType = "Recruiter screen"
	InterviewHiringManager   InterviewType = "Hiring manager"
	InterviewTechnical       InterviewType = "Technical"
	InterviewOnsite          InterviewType = "Onsite"
	InterviewOther           InterviewType = "Other"
)

type InterviewOutcome string

const (
	OutcomeScheduled  InterviewOutcome = "Scheduled"
	OutcomePassed     InterviewOutcome = "Passed"
	OutcomeRejected   InterviewOutcome = "Rejected"
	OutcomeNoDecision InterviewOutcome = "No decision"
)

type Interview struct {
	ID          string
	Type        InterviewType
	ScheduledAt time.Time
	Notes       string
	Outcome     InterviewOutcome
}

type FollowUpReminder struct {
	ID          string
	ApplicationID string
	DueAt       time.Time
	Note        string
	CompletedAt *time.Time
}

type ApplicationNote struct {
	ID        string
	Body      string
	CreatedAt time.Time
}
