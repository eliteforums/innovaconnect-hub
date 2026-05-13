# Requirements Document

## Introduction

The Hackathon Management System (HMS) extends the existing InnovaHack platform to manage the full lifecycle of finalist teams after shortlisting. It covers automated credential generation, team authentication, problem statement distribution, submission handling, GitHub repository tracking, admin evaluation workflows, and communication. The system integrates with the existing Supabase backend, React frontend, and adds Resend for transactional email delivery. Phase 1 (MVP) targets 250 finalist teams selected from 8,000–10,000 applicants.

## Glossary

- **HMS**: The Hackathon Management System — the set of admin and finalist-facing modules described in this document.
- **Admin_Dashboard**: The extended admin panel used by Super Admins and Moderators to manage teams, problem statements, submissions, and notifications.
- **Finalist_Portal**: The authenticated area where finalist team leaders access problem statements, submit deliverables, and view announcements.
- **Credential_Generator**: The subsystem that creates Supabase Auth accounts, generates Team IDs, temporary passwords, and triggers welcome emails.
- **Shortlisting_Engine**: The admin module that allows bulk status changes of registrations from "pending" to "shortlisted" via manual selection or CSV import.
- **Submission_Center**: The finalist-facing module for uploading GitHub URLs, pitch decks, demo videos, documentation, and proof-of-work files.
- **Notification_Center**: The admin module for creating and sending announcements, reminders, and deadline alerts to finalist teams.
- **Problem_Statement_Manager**: The admin module for creating, scheduling, and assigning problem statements to domains.
- **Email_Service**: The Resend-based service that sends transactional emails (credentials, announcements, reminders).
- **Team_ID**: A unique alphanumeric identifier assigned to each shortlisted team (format: IH-XXXX).
- **Super_Admin**: A user with the "super_admin" role who has full system access.
- **Moderator**: A user with the "moderator" role who can view teams, review submissions, and send notifications.
- **Team_Leader**: The finalist team member who authenticates and manages submissions on behalf of the team.
- **RLS**: Row Level Security — Supabase's policy-based access control on database tables.

## Requirements

### Requirement 1: Finalist Shortlisting

**User Story:** As a Super Admin, I want to bulk-shortlist registrations so that finalist teams are identified and moved into the HMS pipeline.

#### Acceptance Criteria

1. WHEN a Super_Admin selects one or more registrations with "pending" status and triggers the shortlist action, THE Shortlisting_Engine SHALL update each selected registration's status to "shortlisted".
2. WHEN a Super_Admin uploads a CSV file containing a header row with an "email" column followed by one or more data rows, THE Shortlisting_Engine SHALL parse the file, match each email value against existing registrations in "pending" status, and update matched records to "shortlisted" status.
3. IF a CSV row contains an email that does not match any existing registration, THEN THE Shortlisting_Engine SHALL skip that row and include it in a summary of unmatched entries returned to the Super_Admin.
4. IF the uploaded CSV file is malformed, missing the required "email" column header, empty, or exceeds 1,000 data rows, THEN THE Shortlisting_Engine SHALL reject the file and display an error message indicating the specific validation failure.
5. WHEN the shortlisting action completes, THE Shortlisting_Engine SHALL display a summary showing the count of newly shortlisted registrations, the count of unmatched entries, and the count of skipped duplicates.
6. THE Shortlisting_Engine SHALL prevent duplicate shortlisting by skipping registrations that already have "shortlisted" status and counting them as skipped duplicates in the summary.

### Requirement 2: Automated Credential Generation

**User Story:** As a Super Admin, I want the system to automatically generate team credentials after shortlisting so that finalist teams can authenticate without manual account setup.

#### Acceptance Criteria

1. WHEN a registration is moved to "shortlisted" status, THE Credential_Generator SHALL create a new Supabase Auth account using the team leader's email and a randomly generated temporary password of at least 12 characters containing at least one uppercase letter, one lowercase letter, one digit, and one special character.
2. WHEN a new team account is created, THE Credential_Generator SHALL generate a unique Team_ID in the format IH-XXXX where XXXX is a zero-padded sequential number starting from 0001 up to a maximum of 9999.
3. WHEN a new team account is created, THE Credential_Generator SHALL insert a record into the teams table with the team name, leader reference, assigned Team_ID, and "active" status.
4. WHEN a new team account is created, THE Credential_Generator SHALL insert records into the team_members table for each member listed in the original registration.
5. IF the Supabase Auth account creation fails for a registration, THEN THE Credential_Generator SHALL log the failure with the team leader's email and error reason, mark the registration with an "error" flag, and continue processing remaining registrations.
6. THE Credential_Generator SHALL process shortlisted registrations in batches of no more than 50 with a minimum delay of 1 second between consecutive batches to avoid exceeding Supabase rate limits.
7. IF a registration that already has an associated Supabase Auth account is moved to "shortlisted" status, THEN THE Credential_Generator SHALL skip credential creation for that registration and log it as a duplicate.

### Requirement 3: Automated Email Delivery

**User Story:** As a Super Admin, I want congratulations emails with login credentials sent automatically so that finalist teams receive their access details without manual intervention.

#### Acceptance Criteria

1. WHEN the Credential_Generator successfully creates a team account, THE Email_Service SHALL send a congratulations email to the team leader's email address within 30 seconds, containing the Team_ID, temporary password, and portal login URL.
2. THE Email_Service SHALL use the Resend API for all transactional email delivery.
3. IF the Email_Service fails to deliver an email, THEN THE Email_Service SHALL retry delivery up to 3 times with exponential backoff starting at 2 seconds (2s, 4s, 8s) and log the final failure status to the system audit log.
4. WHEN an email delivery fails after all 3 retries, THE Admin_Dashboard SHALL display the failed delivery in a "Failed Emails" section showing the team leader's email address, Team_ID, and failure timestamp, so that a Super_Admin can trigger a manual resend.
5. THE Email_Service SHALL rate-limit outgoing emails to no more than 10 emails per second to comply with Resend API limits.
6. IF the team leader's email address is missing or in an invalid format, THEN THE Email_Service SHALL skip the send attempt, mark the delivery as failed immediately without retrying, and display the failure in the Admin_Dashboard "Failed Emails" section with an indication that the email address is invalid.

### Requirement 4: Finalist Authentication

**User Story:** As a Team Leader, I want to log in using either my email and password or my Team ID and password so that I can access the Finalist Portal.

#### Acceptance Criteria

1. WHEN a Team_Leader submits valid email and password credentials, THE Finalist_Portal SHALL authenticate the user and redirect to the team dashboard within 3 seconds.
2. WHEN a Team_Leader submits a valid Team_ID and password, THE Finalist_Portal SHALL resolve the Team_ID to the associated email, authenticate using that email and the provided password, and redirect to the team dashboard.
3. IF a Team_Leader submits a Team_ID that does not resolve to any registered email, THEN THE Finalist_Portal SHALL display the same generic error message as for invalid credentials without revealing that the Team_ID does not exist.
4. IF a Team_Leader submits invalid credentials, THEN THE Finalist_Portal SHALL display a generic error message without revealing whether the email, Team_ID, or password was incorrect.
5. IF a Team_Leader fails authentication 5 consecutive times for the same account, THEN THE Finalist_Portal SHALL lock the account for 15 minutes and display a message indicating the account is temporarily locked.
6. WHEN a Team_Leader logs in for the first time using the temporary password, THE Finalist_Portal SHALL prompt the user to set a new password of at least 8 characters containing at least one uppercase letter, one lowercase letter, one digit, and one special character, before granting access to the dashboard.
7. IF a Team_Leader navigates away or closes the session during the forced password change without completing it, THEN THE Finalist_Portal SHALL require the password change on the next successful login attempt.
8. THE Finalist_Portal SHALL maintain JWT-based sessions with a maximum duration of 7 days, requiring re-authentication after expiry and redirecting the user to the login page.

### Requirement 5: Team Profile Management

**User Story:** As a Team Leader, I want to view and update my team's profile so that our information stays current throughout the hackathon.

#### Acceptance Criteria

1. WHEN a Team_Leader navigates to the team profile section, THE Finalist_Portal SHALL display the team name, Team_ID, domain assignment, and for each team member: full name, email address, phone number, and role within the team.
2. WHEN a Team_Leader navigates to the team profile section, THE Finalist_Portal SHALL display the team name, Team_ID, and domain assignment as read-only fields.
3. WHEN a Team_Leader updates a team member's email address, THE Finalist_Portal SHALL validate that the value is a well-formed email address of no more than 254 characters, and persist the change to the team_members table.
4. WHEN a Team_Leader updates a team member's phone number, THE Finalist_Portal SHALL validate that the value contains only digits, spaces, hyphens, or a leading plus sign and is between 7 and 15 digits, and persist the change to the team_members table.
5. IF a Team_Leader submits contact information that fails validation, THEN THE Finalist_Portal SHALL display an error message indicating which field failed and the expected format, and SHALL NOT persist the change.
6. THE Finalist_Portal SHALL restrict profile editing to the authenticated Team_Leader only, enforced by RLS policies.
7. WHEN a Team_Leader updates the team's GitHub repository URL, THE Finalist_Portal SHALL validate that the URL matches the pattern "https://github.com/{owner}/{repo}" and is no more than 2048 characters in length, and persist the change.
8. IF a Team_Leader submits a GitHub repository URL that fails validation, THEN THE Finalist_Portal SHALL display an error message indicating the expected URL format and SHALL NOT persist the change.

### Requirement 6: Problem Statement Management

**User Story:** As a Super Admin, I want to create and schedule problem statements so that finalist teams receive them at the designated time.

#### Acceptance Criteria

1. WHEN a Super_Admin creates a problem statement, THE Problem_Statement_Manager SHALL validate that the title (maximum 200 characters), description (maximum 5000 characters), domain assignment, and scheduled release timestamp are provided, and that the scheduled release timestamp is in the future, then store the record with all fields and any associated resource attachments.
2. WHEN the current time reaches a problem statement's scheduled release timestamp, THE Problem_Statement_Manager SHALL make the problem statement visible to all finalist teams in the assigned domain.
3. WHILE a problem statement's scheduled release time has not been reached, THE Finalist_Portal SHALL not display that problem statement to any Team_Leader.
4. WHEN a Super_Admin uploads resource files for a problem statement, THE Problem_Statement_Manager SHALL accept files of type PDF, DOCX, PNG, JPG, or ZIP, each no larger than 50 MB, with a maximum of 10 files per problem statement, store them in the finalist-assets storage bucket, and associate download URLs with the problem statement record.
5. WHEN a Super_Admin updates a published problem statement, THE Problem_Statement_Manager SHALL persist the changes and display an "Updated" badge on the problem statement in the Finalist_Portal.
6. IF a required field is missing or invalid when creating a problem statement, THEN THE Problem_Statement_Manager SHALL reject the submission and display an error message indicating which fields failed validation.
7. IF a resource file upload fails due to exceeding the size limit, unsupported file type, or storage error, THEN THE Problem_Statement_Manager SHALL reject the file, retain any previously uploaded files for that problem statement, and display an error message indicating the reason for failure.

### Requirement 7: Submission Handling

**User Story:** As a Team Leader, I want to submit my project deliverables so that evaluators can review our work.

#### Acceptance Criteria

1. WHEN a Team_Leader submits a GitHub repository URL, THE Submission_Center SHALL validate that the URL matches the pattern "https://github.com/{owner}/{repo}" and store it in the submissions table.
2. WHEN a Team_Leader uploads a pitch deck file, THE Submission_Center SHALL accept PDF or PPTX files up to 50 MB, store the file in the pitch-decks storage bucket, and record the file URL in the submissions table.
3. WHEN a Team_Leader uploads a demo video URL, THE Submission_Center SHALL validate that the URL hostname matches youtube.com, youtu.be, vimeo.com, or drive.google.com, and store it in the submissions table.
4. WHEN a Team_Leader uploads documentation files, THE Submission_Center SHALL accept up to 5 PDF or DOCX files, each up to 25 MB, store files in the documentation storage bucket, and record file URLs in the submissions table.
5. WHEN a Team_Leader uploads proof-of-work files, THE Submission_Center SHALL accept up to 10 image files (PNG, JPG, WEBP), each up to 10 MB, store files in the proof-of-work storage bucket, and record file URLs in the submissions table.
6. WHILE the submission deadline has not passed, THE Submission_Center SHALL allow Team_Leaders to replace previously submitted deliverables, overwriting the prior submission record for that deliverable type.
7. WHILE the submission deadline has passed, THE Submission_Center SHALL reject all new submissions and updates, and display a "Submissions Closed" message.
8. THE Submission_Center SHALL display a progress tracker listing each deliverable type (GitHub URL, pitch deck, demo video, documentation, proof-of-work) with a status of "submitted" or "pending".
9. IF a Team_Leader submits a GitHub repository URL or demo video URL that fails format validation, THEN THE Submission_Center SHALL reject the submission and display an error message indicating the accepted URL format.
10. IF a Team_Leader uploads a file with a type or size that does not meet the acceptance criteria for that deliverable, THEN THE Submission_Center SHALL reject the upload and display an error message indicating the allowed file types and maximum size.

### Requirement 8: GitHub Repository Tracking

**User Story:** As a Moderator, I want to track GitHub repository activity so that I can verify teams are actively working on their projects.

#### Acceptance Criteria

1. WHEN a team submits a GitHub repository URL, THE Admin_Dashboard SHALL display the repository URL as a clickable link that opens in a new browser tab within the team's submission details.
2. THE Admin_Dashboard SHALL display the timestamp of when each team's GitHub URL was last submitted or updated by the Team_Leader, formatted as a relative time (e.g., "2 hours ago") with the absolute date and time visible on hover.
3. IF a team has not yet submitted a GitHub repository URL, THEN THE Admin_Dashboard SHALL display a "Not Submitted" indicator in place of the repository link in the team's submission details.
4. WHEN a Team_Leader updates a previously submitted GitHub repository URL, THE Admin_Dashboard SHALL display the new URL and update the last-submitted timestamp to reflect the time of the most recent change.

### Requirement 9: Admin Evaluation Workflows

**User Story:** As a Moderator, I want to review team submissions and track evaluation progress so that all teams are fairly assessed.

#### Acceptance Criteria

1. WHEN a Moderator navigates to the submissions section, THE Admin_Dashboard SHALL display a filterable list of all team submissions with status indicators (pending, under_review, reviewed, flagged).
2. WHEN a Moderator selects a team's submission, THE Admin_Dashboard SHALL display all submitted deliverables (GitHub URL, pitch deck, video, documentation, proof of work) in a single view, indicating which deliverables have been submitted and which are missing.
3. WHEN a Moderator updates a submission's status, THE Admin_Dashboard SHALL allow transitions only between adjacent statuses (pending → under_review → reviewed, or any status → flagged), persist the new status, and record the Moderator's identifier and timestamp.
4. WHEN a Moderator flags a submission for further review, THE Admin_Dashboard SHALL require a reason text between 10 and 500 characters and display the flag with the reason in the submission list.
5. THE Admin_Dashboard SHALL allow filtering submissions by domain, status, and submission completeness where completeness is defined as the ratio of submitted deliverables to total required deliverables (GitHub URL, pitch deck, video, documentation, proof of work) displayed as a percentage.
6. IF a submission status update fails to persist, THEN THE Admin_Dashboard SHALL retain the previous status, display an error message indicating the update could not be saved, and allow the Moderator to retry the operation.

### Requirement 10: Communication and Notifications

**User Story:** As a Super Admin, I want to send announcements and reminders to finalist teams so that they stay informed about deadlines and updates.

#### Acceptance Criteria

1. WHEN a Super_Admin creates an announcement, THE Notification_Center SHALL validate that the title is between 1 and 200 characters and the message body is between 1 and 5,000 characters, store the title, message body, target audience (all teams, specific domain, or specific team), and creation timestamp.
2. WHEN a Super_Admin publishes an announcement, THE Notification_Center SHALL make it visible in the Finalist_Portal announcements section for the targeted audience.
3. WHEN a Super_Admin sends an email notification, THE Email_Service SHALL deliver the announcement content to the email addresses of all targeted Team_Leaders.
4. WHEN a Team_Leader opens the Finalist_Portal, THE Finalist_Portal SHALL display a notification badge showing the count of unread announcements.
5. WHEN a Team_Leader views an announcement, THE Finalist_Portal SHALL mark it as read and decrement the unread count.
6. WHEN the current time reaches a scheduled announcement's specified delivery timestamp, THE Notification_Center SHALL automatically publish the announcement to the targeted audience in the Finalist_Portal announcements section.
7. WHEN a Team_Leader navigates to the announcements section, THE Finalist_Portal SHALL display announcements ordered by publication timestamp from most recent to oldest.
8. IF a Super_Admin submits an announcement with a title or message body that exceeds the allowed length or is empty, THEN THE Notification_Center SHALL reject the submission and display an error message indicating which field failed validation.

### Requirement 11: Team Management Dashboard

**User Story:** As a Moderator, I want to view, search, and filter finalist teams so that I can quickly find and monitor team progress.

#### Acceptance Criteria

1. WHEN a Moderator navigates to the team management section, THE Admin_Dashboard SHALL display a paginated list of all finalist teams with 20 teams per page, showing team name, Team_ID, domain, status, and submission progress percentage calculated as the number of submitted deliverables divided by the total required deliverables (GitHub URL, pitch deck, demo video, documentation, proof of work) multiplied by 100.
2. WHEN a Moderator enters a search query of at least 1 character, THE Admin_Dashboard SHALL filter the team list to show only teams whose team name, Team_ID, or team leader email contains the query as a case-insensitive substring match.
3. WHEN a Moderator applies domain or status filters, THE Admin_Dashboard SHALL display only teams matching all selected filter criteria, combined with any active search query.
4. WHEN a Moderator selects a team, THE Admin_Dashboard SHALL display the full team profile including all members, submission history with timestamps, and activity timeline showing login events, submission uploads, and profile updates.
5. IF a search query or filter combination returns no matching teams, THEN THE Admin_Dashboard SHALL display an empty state message indicating no teams match the current criteria and provide an option to clear all filters.

### Requirement 12: Analytics Dashboard

**User Story:** As a Super Admin, I want to view aggregate statistics about finalist participation so that I can monitor overall hackathon progress.

#### Acceptance Criteria

1. WHEN a Super_Admin navigates to the analytics section, THE Admin_Dashboard SHALL display total finalist teams, active teams (teams with at least one login within the last 48 hours), total submissions across all deliverable types, and submission completion rate calculated as the percentage of teams that have submitted all five deliverable types (GitHub URL, pitch deck, demo video, documentation, and proof of work).
2. WHEN a Super_Admin navigates to the analytics section, THE Admin_Dashboard SHALL display a domain-wise breakdown showing team count and submission count per domain.
3. WHEN a Super_Admin navigates to the analytics section, THE Admin_Dashboard SHALL display a timeline chart showing the count of new submissions created per day, spanning from the first problem statement release date to the submission deadline date.
4. WHEN the analytics section page loads, THE Admin_Dashboard SHALL query and display current analytics data without requiring manual refresh action from the user.
5. IF no finalist teams or submissions exist when the analytics section loads, THEN THE Admin_Dashboard SHALL display a zero-state message indicating that no data is available yet for each respective metric.

### Requirement 13: File Upload Security

**User Story:** As a Super Admin, I want file uploads to be secure so that only authorized users can upload and access files.

#### Acceptance Criteria

1. WHEN an authenticated Team_Leader or Super_Admin requests a file upload, THE HMS SHALL generate a signed upload URL with a maximum validity of 15 minutes scoped to the requesting user's team storage path.
2. THE HMS SHALL enforce RLS policies on all storage buckets so that a Team_Leader can only read and write files belonging to their own team, and cannot list, read, or delete files belonging to other teams.
3. IF a file upload exceeds the maximum allowed size for its type (50 MB for pitch decks, 25 MB for documentation, 10 MB for proof-of-work images), THEN THE Submission_Center SHALL reject the upload before transfer completes and display an error message stating the maximum allowed size for that file type.
4. THE HMS SHALL restrict all finalist storage buckets (pitch-decks, documentation, proof-of-work, finalist-assets) to authenticated access only, with no publicly accessible URLs.
5. IF a file upload contains a MIME type not in the allowed list for the target bucket (PDF and PPTX for pitch-decks, PDF and DOCX for documentation, PNG, JPG, and WEBP for proof-of-work), THEN THE Submission_Center SHALL reject the upload and display an error message indicating the accepted file types.
6. IF an authenticated user attempts to access a file in a storage bucket they are not authorized for, THEN THE HMS SHALL deny the request and return an access-denied response without revealing whether the file exists.

### Requirement 14: Role-Based Access Control

**User Story:** As a Super Admin, I want role-based permissions enforced across the system so that users can only access features appropriate to their role.

#### Acceptance Criteria

1. THE HMS SHALL enforce the following role hierarchy: Super_Admin has read, write, and delete access to all HMS database tables and admin routes; Moderator has read access to teams and team_members tables, write access to submission review status and flags, and read access to submissions; Team_Leader has read and write access only to records in the teams, team_members, and submissions tables where the team_id matches the Team_Leader's assigned team.
2. THE HMS SHALL enforce role-based access through Supabase RLS policies on all HMS database tables such that queries return only rows the requesting user's role is permitted to access.
3. THE HMS SHALL protect all Admin_Dashboard routes with authentication middleware that verifies the user has a Super_Admin or Moderator role before rendering the route.
4. IF an unauthenticated user attempts to access an Admin_Dashboard route, THEN THE HMS SHALL redirect the user to the admin login page. IF an unauthenticated user attempts to access a Finalist_Portal route, THEN THE HMS SHALL redirect the user to the finalist login page.
5. IF an authenticated user attempts to access a route above their permission level, THEN THE HMS SHALL display an "Access Denied" message and record the user identifier, attempted route, and timestamp to an access audit log.
6. IF a Super_Admin changes a user's role, THEN THE HMS SHALL invalidate that user's existing sessions within 60 seconds so that the updated permissions take effect on next authentication.
