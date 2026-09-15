# Help Desk Management System

A full-stack help desk platform for managing support requests, user roles, ticket workflows, knowledge base content, and AI-assisted support.

The application supports three roles — **Requester, Agent, and Administrator** — with role-based permissions, ticket-level access control, secure file handling, demo accounts, and an AI Help Desk Assistant that can use ticket context and published Knowledge Base articles when answering users.

## Live Demo

**Live Application:**  
https://helpdesk-ivanlo.vercel.app

The login page includes one-click **Demo Requester** and **Demo Agent** accounts for exploring the system without creating credentials.

---

## Key Features

### Ticket Management

- Create and manage support tickets
- Categorize requests and assign priorities
- Assign tickets to support agents
- Track ticket status throughout its lifecycle
- Add requester and agent replies
- Add private internal notes for agents and administrators
- Maintain ticket activity history
- Filter and sort tickets
- Responsive ticket views across desktop, tablet, and mobile

Supported ticket statuses:

- Open
- Assigned
- In Progress
- Waiting for User
- Resolved
- Closed

Supported priorities:

- Low
- Medium
- High
- Urgent

---

## Role-Based Access Control

The system supports three roles with different permissions.

### Requester

- Create support tickets
- View their own tickets
- Reply to their tickets
- View authorized attachments
- Browse and search the Knowledge Base
- Use the AI Help Desk Assistant

### Agent

- View support tickets
- Manage assigned tickets
- Update ticket status and priority
- Reply to requesters
- Add internal notes
- View ticket activity
- Use AI-assisted ticket summaries and reply drafting

### Administrator

- Access all support tickets
- Manage users and account access
- Manage ticket categories
- Manage Knowledge Base articles
- Reset public demo data
- Access agent-level ticket management features

Authorization is enforced on the server rather than relying only on hidden UI elements.

---

## AI Help Desk Assistant

The application includes a floating AI assistant available throughout the authenticated application.

The assistant is aware of:

- The logged-in user's role
- The current application page
- Authorized ticket context
- Ticket status, priority, category, and assignment
- Requester-visible conversation history
- Internal notes when the current role is authorized
- Relevant published Knowledge Base articles

### AI Capabilities

- Explain help desk workflows and ticket statuses
- Summarize the current ticket
- Answer ticket-specific questions
- Draft requester-facing replies for agents
- Insert generated replies into the ticket reply form
- Retrieve relevant Knowledge Base content for troubleshooting
- Recommend creating a support ticket when no relevant article exists

The system also prevents requester accounts from accessing or determining the contents of internal notes.

AI responses are treated as suggestions and are not automatically submitted as ticket replies.

---

## Knowledge Base

The application includes a searchable Knowledge Base for common support issues.

### User Features

- Browse published articles
- Search articles by title, category, summary, and content
- Read full troubleshooting guides
- Access Knowledge Base content through the AI assistant

### Administrator Features

- Create articles
- Edit existing articles
- Assign categories
- Save articles as drafts
- Publish and unpublish articles
- Delete articles

Draft articles are excluded from both the public Knowledge Base and AI retrieval.

Current Knowledge Base categories include:

- Account Access
- General Inquiry
- Hardware Support
- Network Support
- Software Support
- Technical Support

---

## Knowledge Base Retrieval

The AI assistant uses a lightweight retrieval-augmented approach before generating troubleshooting responses.

```text
User Question
      ↓
Extract Search Terms
      ↓
Search Published Knowledge Base Articles
      ↓
Rank Relevant Articles
      ↓
Add Article Content to AI Context
      ↓
Generate Grounded Response