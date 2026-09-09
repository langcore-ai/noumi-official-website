**LangHub**

**LangHub CRM Implementation Project**

**Blueprint Proposal**

**Version Notes**

| Version | Release Date | Author | Reviewer | Approver | Content |
| --- | --- | --- | --- | --- | --- |
| 0.1 | 2026-08-25 | Marcus Reid / BA drafting support | — | — | Initial requirements package (BRD, FRD, User Stories) circulated for stakeholder validation |
| 1.0 | 2026-08-27 | Marcus Reid / BA drafting support | — | — | Consolidated blueprint proposal for business sign-off, built from the validated requirements package |

Table of Contents

1. Overview
   1.1 Document Background
   1.2 Document Scope
   1.3 Terms and Abbreviations
2. Project Overview
   2.1 Project Background
   2.2 Project Scope
   2.3 Constraints
3. Users and Roles
4. Business Process Diagram
5. Functional Requirements
   5.1 Lead Management
   5.2 Account Management
   5.3 Opportunity Management
   5.4 Pre-Sales Coordination
   5.5 Ecosystem Partner Management
   5.6 Contract Management
   5.7 Dashboard and Reporting
   5.8 Permissions and Administration
6. Open Items Carried into Design
7. Acceptance Criteria
8. Operations and Maintenance
9. Project Implementation Plan
10. Conclusion

---

## 1. Overview

### 1.1 Document Background

This document is the blueprint proposal for the "LangHub CRM Implementation Project." It consolidates the Business Requirements Document, Functional Requirements Document, and User Stories Backlog produced during Requirements Research and Analysis into a single business-facing proposal. It is provided for business stakeholders to review and confirm, and serves as the basis for system design, development, and acceptance.

### 1.2 Document Scope

This document describes the project background, business objectives, scope boundaries, user roles, target-state business process, functional requirements by module, acceptance criteria, operations and maintenance terms, and the implementation plan. Detailed field-level specifications, state models, and story-level acceptance criteria are maintained in the companion FRD and User Stories Backlog and are not repeated here.

### 1.3 Terms and Abbreviations

| Abbreviation / Term | Explanation |
| --- | --- |
| Lead | An unqualified prospect record captured from one of eight source channels (website, event, referral, partner, outbound, etc.). |
| Account | The system-of-record profile for a company once a lead is qualified or a direct relationship exists. |
| Opportunity | A tracked, staged pipeline record representing a potential deal against an account. |
| BR / FR / NFR | Business Requirement / Functional Requirement / Non-Functional Requirement, as numbered in the companion BRD and FRD. |
| OQ | Open Question — an unresolved decision tracked in the Requirements Clarification Document with a named owner. |

## 2. Project Overview

### 2.1 Project Background

LangHub is an enterprise AI capability platform. Over the past growth period, the company's signed accounts have grown from roughly 60 to more than 220, and sales headcount has grown from 8 to 20; Marketing, Ecosystem Partnerships, and Pre-Sales have each become standalone teams. None of these functions currently share a system of record: Sales relies on personal spreadsheets with no shared handoff record, Marketing distributes leads by CSV export and chat with no visibility after handoff, Ecosystem Partnerships tracks roughly 40 active partners in a personal spreadsheet accessible to one person only, and Pre-Sales receives visit requests as unstructured chat messages against a personal calendar.

The trigger for this project was a client-visible failure: a key enterprise prospect told LangHub that two sales reps had contacted them simultaneously, and that "your internal coordination seems broken." This was independently corroborated as a recurring pattern (4–5 duplicate-pursuit incidents per quarter) rather than an isolated event. Leadership also cites a 3–5 day manual sales-reporting cycle, zero marketing/ecosystem ROI visibility, and 2–3 pre-sales scheduling conflicts per month as compounding evidence that ad hoc, memory-based coordination no longer scales with the organization.

To address this, LangHub intends to build an internal CRM platform spanning the full deal lifecycle — **Marketing → Ecosystem Partnerships → Sales → Pre-Sales → Contract** — replacing personal tools with one shared system of record, giving leadership a real-time and independently verifiable pipeline view, and giving Marketing and Ecosystem Partnerships a way to prove channel ROI.

### 2.2 Project Scope

**Business objectives and success measures** (leadership-confirmed):

| Metric | Current state | 12-month target |
| --- | --- | --- |
| Sales data availability to leadership | Manual monthly rollup, 3–5 days | Real-time, no manual reporting |
| Duplicate account follow-up incidents | 4–5 per quarter | 0 |
| Marketing lead conversion visibility | No tracking capability | Full funnel view by channel/campaign |
| Pre-sales scheduling conflicts | 2–3 per month | 0, system-enforced |
| Weekly sales meeting duration | 1.5–2 hours | ≤45 minutes |
| Account handoff quality (subjective, 1–10) | 3/10 | 7/10 |

**In scope (Phase 1):**

* Internal platform for Sales, Marketing, Ecosystem Partnerships, and Pre-Sales collaboration across the full deal lifecycle
* Account profiles, lead management, opportunity/pipeline tracking, contract approval workflow
* Real-time leadership dashboard with no dependency on manual reporting
* Website-form-to-CRM auto-sync — a hard requirement, not optional

**Optional / to be assessed for feasibility (not a hard Phase 1 commitment):**

* Enterprise messaging (Slack) notification integration — rated low-risk and low-effort by IT; final Phase 1 commitment is still open (see Section 6)

**Out of scope (Phase 2 or later):**

* External customer-facing portal
* Direct Finance-system integration
* Large-scale marketing automation platform integration

Leadership's stated prioritization principles: solve information silos before efficiency gains; ship the leadership dashboard before granular features; prefer a system that is "focused and used" over one that is feature-complete.

### 2.3 Constraints

* No company-wide identity provider exists today (Google Workspace email only, no SSO/SAML). Standing one up is treated as a separate initiative outside this project's boundary; Phase 1 authentication defaults to per-tool accounts unless a dedicated identity project is separately funded.
* Slack is the confirmed company-standard internal chat tool; any messaging-notification integration, if committed, is built against Slack only.
* Engineering effort is estimated at 6–8 person-months as a preliminary planning figure; final scope requires joint assessment by product and engineering once design closes the open items in Section 6.
* Historical spreadsheet migration (rep spreadsheets, the Ecosystem Partnerships Excel, Marketing's lead export) is not guaranteed for Phase 1 launch; IT requires representative file samples before it can scope this work.
* Finance has not yet been consulted as a stakeholder despite being a required approver in the contract workflow; this is treated as an open structural gap rather than a resolved constraint (see Section 6).

## 3. Users and Roles

| Role | Representative user | Core CRM need | Primary system usage |
| --- | --- | --- | --- |
| CEO / Executive Sponsor | Ethan Lin | Real-time, trustworthy pipeline visibility | Leadership dashboard (read-only) |
| Sales Director | David Park | Team/rep/product-line funnel visibility; stalled-deal alerts; contract approval (stage 1) | Dashboard, opportunity oversight, lead/account reassignment, contract approval |
| Sales Rep | Alex Martinez (interviewed) | Simple lead intake, account handoff history, quota visibility | Lead/account/opportunity entry, follow-up logging, pre-sales visit requests |
| Marketing Ops Manager | Jennifer Walsh | Automatic lead flow, funnel visibility, quality feedback loop | Bulk lead import, campaign/source reporting |
| Ecosystem Partnerships Manager | James Lee | Partner attribution, unified partner directory, conversion reporting | Partner directory maintenance, per-partner conversion reports |
| Pre-Sales Solution Engineer | Rachel Kim | Schedule visibility, client context before a visit, structured outcome logging | Read-only account view, visit calendar, post-visit feedback form |
| Legal Counsel | Laura Bennett | Defined, auditable contract-approval workflow; document retention | Contract approval (stage 2), backup-approver designation, signed-contract access |
| Finance | Not yet identified — TBD | Referenced as a conditional contract-approval stage | Escalated-contract approval only, pending stakeholder engagement |
| System Administrator | Kevin Zhao | Clear business rules to implement (permissions, hosting, retention) | User provisioning, integration configuration, rule-library maintenance |

## 4. Business Process Diagram

The target-state Lead-to-Contract process spans the swimlanes Marketing → Ecosystem Partnerships → Sales → Pre-Sales → Legal → Finance (conditional). The full-resolution diagram is delivered as a companion artifact:

`02 Research and Analysis/Deliverables/LangHub-CRM-Lead-to-Contract-Process.png` (source: `LangHub-CRM-Lead-to-Contract-Process.drawio`)

At a high level: a lead enters through one of eight attributed channels (including automatic website-webhook sync), is assigned to a rep, and converts to an account once qualified; the account is checked for duplicates before a new record is created. When an account reaches Opportunity status, an opportunity is created and progresses through a five-stage pipeline with stalled-deal alerting. Pre-Sales is notified and coordinates a visit request against a conflict-checked calendar. A won opportunity generates a contract, which routes through Sales Director and Legal approval, with a conditional Finance stage for high-value or non-standard contracts, before e-signature and account status auto-update to Customer.

## 5. Functional Requirements

Each module below summarizes the confirmed and proposed capabilities; full field-level specification, state models, and Gherkin-style acceptance criteria are maintained in the companion FRD (FR-001 – FR-060) and User Stories Backlog.

### 5.1 Lead Management

* Eight source tags: website, self-hosted event, third-party event, list import, internal referral, partner, outbound, customer referral
* Manual single-entry creation and bulk Excel import (current working cap: 1,000 rows per batch, pending validation against real file volumes)
* Real-time website-form-to-CRM sync via webhook — confirmed low-risk and a few days of engineering effort by IT once the CRM API is defined
* Manual assignment and rule-based auto-assignment by region/industry; fallback behavior when no rule matches is not yet defined
* Disposition: mark invalid with a required reason, or convert to an account
* Partner-sourced leads must link to a specific partner record before they can be saved
* Lead source and any captured context are visible on the lead/account record to the assigned rep

### 5.2 Account Management

* Account profile: company name, industry, headcount, website, primary contacts, assigned rep
* Five-stage status: Prospect → Active → Opportunity → Customer, with Inactive reachable from any prior stage; the trigger for the Active → Opportunity transition is not yet defined and must be resolved before opportunity auto-creation can be built
* Follow-up log: date, channel (call/email/visit), summary, next follow-up date
* Duplicate detection on company-name match; exact matching logic (fuzzy/normalized, case handling) is not yet specified
* Stale follow-up alert; the current working threshold is 14 days, though the motivating incident (a lost account after three weeks of undetected inactivity) suggests this may need to be shorter or tiered
* Account handoff carries full follow-up and opportunity history to the incoming rep, without a separate manual briefing

### 5.3 Opportunity Management

* Auto-created when an account reaches Opportunity status (dependent on Section 5.2's open transition trigger)
* Fields: description, estimated contract value, competitive landscape, expected close date, current stage
* Five-stage pipeline: Initial Contact → Needs Confirmed → Proposal Sent → Contract Negotiation → Won/Lost; whether stages may move backward is not yet specified
* Win/loss requires a reason; lost deals must additionally capture competitor information
* Stalled-opportunity alerting, using the same threshold question as the account-level stale-follow-up alert
* Opportunity stage, value, and count feed the leadership dashboard in real time with no manual export step

### 5.4 Pre-Sales Coordination

* In-app notification to Pre-Sales when an opportunity reaches a stage requiring their involvement; the exact triggering stage is not yet specified
* Read-only access to the linked account's profile and follow-up history
* Structured visit-request creation by the sales rep: date/time, location, objective, participants
* Calendar conflict detection with visual highlighting; whether the check blocks the rep at submission or is discovered afterward by the engineer is an open UX decision with real incidents (two prior double-bookings) motivating a submission-time block
* Advance visibility of the engineer's real availability before a visit request is submitted
* Post-visit feedback form: conclusions, risks, recommended next steps — deliberately kept to a minimal field set per the Pre-Sales Engineer's explicit preference

### 5.5 Ecosystem Partner Management

* Partner profile: company, contact, tier (Bronze/Silver/Gold), agreement start/end dates
* Centrally accessible partner directory, replacing the current personal spreadsheet
* Partner-sourced leads are distinguished from direct-sourced leads to prevent commission-attribution conflicts
* Per-partner, exportable conversion report (leads → qualified → opportunities → closed), available on demand rather than requiring manual QBR reconciliation

### 5.6 Contract Management

* Contract record created from a Won opportunity
* Standard two-stage approval: Sales Director, then Legal
* Conditional automatic third stage (Finance), triggered by rule when contract value exceeds a threshold or the contract contains non-standard terms; the exact value threshold is not yet set and Legal has stated she will not set it unilaterally
* Named backup approver required for both the Legal stage and the Sales Director stage — no backup exists for either role today
* E-signature integration that writes the fully executed document back into the CRM record; vendor selection is pending
* Signed contracts retained for at least 7 years, with access restricted to Legal, Finance, and the Sales Director on that specific account — not the full sales team
* A simplified, Sales-Director-only Phase 1 approval path is conditionally proposed for low-value, standard-template contracts with no custom terms, under a jointly agreed value ceiling — with no exceptions above that ceiling or for non-standard language
* Contract completion automatically updates the linked account's status to Customer

### 5.7 Dashboard and Reporting

* Real-time sales funnel: counts by stage, monthly additions, period-over-period change
* Notification center: lead-loss alerts, stalled-follow-up reminders, opportunity-at-risk warnings
* Admin filters by rep, team, period, and product line
* A rep-facing self-service "my quota progress" view has been requested directly and is proposed but not yet confirmed as in-scope, distinct from the admin/leadership filtered view

### 5.8 Permissions and Administration

* Record-level visibility (self-only vs. team-visible) and field-level restrictions (e.g., discount level, contract value, competitive notes) are to be enforced once the underlying business rule is set; IT is ready to implement but has explicitly declined to set the policy itself
* User provisioning and account administration by the System Administrator role
* Authentication defaults to per-tool accounts in the absence of a company-wide identity provider

## 6. Open Items Carried into Design

The following items are structurally significant enough to affect design and must be closed before or during Phase 1 Design; they are carried forward transparently rather than resolved by assumption. Full detail, owners, and impact are maintained in the Requirements Clarification Document.

| Item | Decision needed | Owner |
| --- | --- | --- |
| Record-level data visibility default | Self-only vs. team-visible | Sales Director |
| Contract Finance-escalation threshold | Exact contract value and/or non-standard-term criteria | Legal + Finance + Sales Director (joint) |
| Historical data migration | Whether to migrate, and how to prevent dual-system use if not | PM + IT + Sales Director |
| Pre-sales conflict-detection timing | Block at submission vs. discover after notification | Product/PM + Sales Director + Pre-Sales |
| Data residency | Hosting-region constraint, if any | Legal / Compliance |
| Stale-alert threshold | Remain at 14 days, shorten, or tier | Sales Director |
| Finance stakeholder engagement | Interview Finance to close the escalation threshold and SLA questions | Project Manager |
| Slack notification commitment | Firm Phase 1 commitment vs. continued deferral | Product/PM + Sales Director |

Until these are resolved, the corresponding functional areas (principally Contract Management and Permissions/Administration) should be treated as design-in-progress rather than finalized scope.

## 7. Acceptance Criteria

### 7.1 Core Functions and Business Processes

1. **End-to-end lifecycle verification**: a lead entered through any of the eight source channels — including an automatic website-webhook submission — can be traced through qualification, account creation, opportunity progression, and (for a won deal) contract execution without leaving the system.
2. **Duplicate-prevention verification**: attempting to create an account or pursue a lead that matches an existing account triggers a warning before a duplicate record can be created.
3. **Real-time dashboard verification**: opportunity stage, value, and count changes are reflected on the leadership dashboard without any manual export or refresh step.
4. **Contract workflow verification**: a contract cannot reach execution without passing every approval stage applicable to it (including the conditional Finance stage, once its threshold is set), and the fully signed document is retrievable from the linked CRM record.
5. **Pre-sales scheduling verification**: a visit request against an already-committed time slot is flagged before both parties assume the visit is confirmed.
6. **Partner attribution verification**: a partner-sourced lead remains traceable to its originating partner through conversion, and a per-partner conversion report can be produced without manual reconciliation.

### 7.2 System Usability

1. Core workflows (lead intake, follow-up logging, visit-request submission, contract approval) can be completed by business users without extensive training, consistent with stakeholders' explicit preference for minimal, meaningful fields over lengthy forms.
2. The system remains responsive under normal load, including bulk import of up to the confirmed row cap and concurrent multi-user access to the dashboard.
3. Error conditions (failed webhook payloads, blocked bulk-import rows, rejected contract stages) produce clear, actionable messages rather than silent failures or raw system errors.
4. Historical account and opportunity activity remains traceable and auditable, including stage-change timestamps and contract-approval history.

### 7.3 Completeness of Deliverables

1. Smooth system launch: the CRM is deployed to production, role-based accounts are provisioned, and daily operations across Sales, Marketing, Ecosystem Partnerships, and Pre-Sales can run on the system.
2. Delivery of confirmed business and requirements documentation: this Blueprint Proposal together with the Business Requirements Document, Functional Requirements Document, and User Stories Backlog, each reflecting closed rather than open decisions at sign-off.
3. Delivery of an operation/training guide covering daily workflows for each role and common issue handling.
4. Delivery of a system test report and launch confirmation, evidencing that functions were tested against this blueprint prior to go-live.

## 8. Operations and Maintenance

### 8.1 O&M Period

Following formal acceptance, the system enters a warranty/maintenance period for an initial term to be confirmed in the delivery contract; ongoing maintenance thereafter is expected to continue under a separate support arrangement.

### 8.2 O&M Scope

| Service | Description |
| --- | --- |
| Technical consultation | Dedicated support contact for functional questions, configuration errors, and abnormal business operations |
| Routine maintenance | Fixes and minor updates to existing, already-accepted functionality |
| Fault diagnosis and resolution | Troubleshooting and defect correction; excludes net-new functional changes, added/removed features, or UI redesign |

### 8.3 O&M Method

Remote support during business hours on working days; on-site support only by prior agreement between both parties.

### 8.4 Response Time (proposed, pending formal SLA confirmation)

| Severity | Description | Target response |
| --- | --- | --- |
| Blocking | Entire system or a major module is unusable | 30 minutes |
| Severe | Serious interruption to system use; integrity at risk | 1 hour |
| Major | System usable but functionality or performance is degraded | 4 hours |
| Minor | Non-critical function impaired; workaround known | 1 business day |
| Slight | Cosmetic or minor interaction issue; no functional impact | 2 business days |

## 9. Project Implementation Plan

| Project Phase | Phase Work | Key Deliverables | Timeframe |
| --- | --- | --- | --- |
| Discovery | Stakeholder interviews, executive brief and handover review, evidence consolidation | Requirements Clarification Document, Assumption and Open-Question Register | Apr–May 2026 |
| Phase 1 Design | Resolve blocking open items (Section 6); finalize BRD/FRD/User Stories; blueprint sign-off | This Blueprint Proposal; confirmed BRD/FRD/User Stories Backlog | Jun–Jul 2026 |
| Phase 1 Development | Build and test Lead, Account, Opportunity, Pre-Sales, Ecosystem, Contract, Dashboard, and Permissions modules | Trial-operation system; test cases mapped to acceptance criteria | Aug–Oct 2026 |
| Phase 1 Launch | User acceptance testing, training, cutover | System Test Report, Operation Manual, Launch Confirmation | Q4 2026 |
| Phase 2 Planning | Scope Finance integration, marketing automation, and any deferred items from Section 6 | Phase 2 scope proposal | 2027 H1 |

Dates are indicative and will be adjusted as the open items in Section 6 are resolved and as detailed design confirms build effort.

## 10. Conclusion

This blueprint proposal consolidates the LangHub CRM project's business background, objectives, scope, user roles, target-state process, and functional requirements by module into a single business-facing reference, alongside the acceptance criteria, operations and maintenance terms, and implementation plan needed to govern delivery. It is built directly from the validated Business Requirements Document, Functional Requirements Document, and User Stories Backlog, and it deliberately carries forward the open items in Section 6 rather than resolving them by assumption. Confirming this blueprint — including explicit decisions on the open items — is the basis on which Phase 1 Design and Development will proceed.

**Blueprint Proposal Signature:**

| | |
| --- | --- |
| **LangHub — Business Approval** | Comments:  Signature:  Date: |
| **LangHub — IT Approval** | Comments:  Signature:  Date: |
| **Delivery / Implementation Partner** | Comments:  Signature:  Date: |
