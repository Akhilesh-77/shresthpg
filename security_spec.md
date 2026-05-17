# PG Management System Security Specification

## Data Invariants
1. A resident must be linked to a valid room and floor.
2. A room's occupancy cannot exceed its capacity.
3. Payment records must belong to a resident and be linked to an admin for audit.
4. Residents can only view their own profile, room details, payment history, and notices.
5. admins are defined in a dedicated `admins` collection by UID.
6. Aadhaar number is mandatory for resident enrollment.

## The Dirty Dozen Payloads (Rejection Targets)
1. Resident trying to create a notice.
2. Resident trying to update another resident's payment status.
3. Admin trying to create a room with a negative capacity.
4. Unauthenticated user trying to list floors.
5. Resident trying to delete their own complaint once it's "resolved".
6. Admin trying to update a resident's `id` field (immutable).
7. Attackers injecting 1MB strings into a room number field.
8. Resident trying to assign themselves to a different room.
9. Admin trying to set a `joiningDate` in the future (optional, but good for integrity).
10. Resident trying to read the `auditLogs` collection.
11. User trying to create a resident record with a fake `id`.
12. Resident trying to update their own `rentAmount`.

## Relationship Mapping
- **Floors** (Parent) -> **Rooms** (Child)
- **Residents** (Entity) -> **Rooms** (Assignment)
- **Payments** (Child of Resident)
- **Complaints** (Child of Resident)
- **Notices** (Global)
- **AuditLogs** (Global, Admin Only)
