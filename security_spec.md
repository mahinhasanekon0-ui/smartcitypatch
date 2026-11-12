# LifeLine Natore Security Spec

## Data Invariants
- A Donor profile must link to an existing User.
- A Report must have a valid category and the reporter's userId.
- Only Admins can change Report status from 'pending' to 'in-progress' or 'resolved'.
- Users can only modify their own profile, donor registration, or reports.

## The Dirty Dozen (Test Payloads)
1. **Identity Spoofing**: Attempt to create a report with another user's `userId`. (Reject)
2. **Role Escalation**: Attempt to update own user profile to `role: "admin"`. (Reject)
3. **Ghost Field**: Attempt to add `verified: true` to a donor profile during create. (Reject)
4. **Status Shortcutting**: Donor attempting to mark their own report as `resolved`. (Reject)
5. **Orphaned Record**: Creating a report with a non-existent `userId`. (Reject)
6. **Value Poisoning**: Sending a 2MB string for the report `description`. (Reject)
7. **Negative Size**: Sending an empty `name` for user profile. (Reject)
8. **Invalid ID**: Injecting `../evil` as a document ID. (Reject)
9. **Deleted Evidence**: User attempting to delete a report after it is marked `in-progress`. (Reject)
10. **State Lock Bypass**: Attempting to update a `resolved` report. (Reject)
11. **Spoof Admin**: Using `isAdmin: true` in user profile to bypass gates. (Reject)
12. **PII Leak**: Unauthenticated user attempting to list the `/users/` collection. (Reject)
