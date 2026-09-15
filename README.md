# Help Desk Management System

A full-stack help desk platform for managing support requests, ticket workflows, user roles, knowledge base content, file attachments, and AI-assisted support.

The application supports three roles — **Requester, Agent, and Administrator** — with role-based permissions, ticket-level access control, private internal notes, secure file handling, demo accounts, and an AI Help Desk Assistant that can understand page context, ticket information, and published Knowledge Base articles.

## Live Demo

**Live Application:**  
https://helpdesk-ivanlo.vercel.app

The login page includes one-click **Demo Requester** and **Demo Agent** accounts so visitors can explore the application without creating credentials.

---

## Project Highlights

- Full ticket lifecycle management
- Role-based access for Requesters, Agents, and Administrators
- Secure authentication using Auth.js and bcrypt
- Server-side authorization and ticket-level access control
- Private agent/admin internal notes
- Ticket activity history
- Secure attachment storage using Vercel Blob
- Responsive desktop, tablet, and mobile interface
- Portfolio-ready demo accounts
- Administrator-controlled demo data reset
- Floating AI Help Desk Assistant
- Ticket-aware AI summaries and responses
- AI-assisted requester reply drafting
- Searchable Knowledge Base
- Knowledge Base article management
- Lightweight retrieval-augmented AI support
- Safe fallback when no relevant troubleshooting article exists
- Production deployment using Vercel and Prisma Postgres

---

# Features

## Ticket Management

Requesters can create support requests while Agents and Administrators can manage them throughout their lifecycle.

Features include:

- Create support tickets
- Assign ticket categories
- Set ticket priority
- Assign support agents
- Update ticket status
- Add requester and agent replies
- Add private internal notes
- View ticket activity history
- Upload and download authorized attachments
- Filter and sort tickets
- View recent tickets and activity from the dashboard

### Ticket Statuses

- Open
- Assigned
- In Progress
- Waiting for User
- Resolved
- Closed

### Ticket Priorities

- Low
- Medium
- High
- Urgent

---

# Role-Based Access Control

The application supports three user roles with different permissions.

## Requester

Requesters can:

- Create support tickets
- View tickets they submitted
- Reply to their tickets
- View authorized attachments
- Track ticket progress
- Browse and search the Knowledge Base
- Use the AI Help Desk Assistant

Requesters cannot access internal notes or internal-only ticket activity.

## Agent

Agents can:

- View support tickets
- Manage assigned tickets
- Update ticket status
- Update ticket priority
- Reply to requesters
- Add internal notes
- View authorized ticket activity
- Download authorized attachments
- Use AI ticket summaries
- Generate requester-facing reply drafts

## Administrator

Administrators can:

- Access all tickets
- Manage users
- Change user roles
- Activate or deactivate accounts
- Manage ticket categories
- Manage Knowledge Base articles
- Access agent-level ticket functionality
- Reset public demo data

Authorization is enforced on the server rather than relying only on hidden interface elements.

---

# AI Help Desk Assistant

The application includes a floating AI Help Desk Assistant available throughout the authenticated application.

The assistant remains fixed in the lower-right corner of the interface while users navigate or scroll through the application.

## Context Awareness

The assistant can understand:

- The logged-in user's role
- The current application page
- Authorized ticket information
- Ticket number
- Subject
- Description
- Status
- Priority
- Category
- Requester
- Assigned agent
- Conversation history
- Ticket activity
- Internal notes when the current user is authorized
- Relevant published Knowledge Base articles

## AI Capabilities

The Help Desk Assistant can:

- Explain application functionality
- Explain ticket statuses
- Summarize the current ticket
- Answer questions about the current ticket
- Assist with troubleshooting
- Retrieve relevant Knowledge Base articles
- Draft requester-facing replies for Agents and Administrators
- Insert generated replies into the ticket reply form
- Recommend creating a support ticket when documentation does not cover the issue

Generated replies are treated as suggestions and are **not automatically submitted**.

---

# AI Security and Access Control

AI context is generated based on the permissions of the currently authenticated user.

For example, Requesters do not receive internal notes or internal-only activity in the AI context.

The assistant is also instructed not to infer whether restricted information exists when that information has intentionally been excluded.

For Requester accounts:

```text
Internal notes
      ↓
Removed before AI context is created
      ↓
AI cannot access note content
      ↓
Requester receives only authorized information
```

This keeps AI responses aligned with the application's existing authorization rules.

---

# Knowledge Base

The application includes a searchable Knowledge Base containing guides for common support issues.

## Current Categories

- Account Access
- General Inquiry
- Hardware Support
- Network Support
- Software Support
- Technical Support

## User Features

Users can:

- Browse published articles
- Search Knowledge Base content
- Read complete troubleshooting guides
- Search by article title
- Search by category
- Search by summary
- Search by article content
- Access relevant articles through the AI assistant

## Administrator Features

Administrators can:

- Create Knowledge Base articles
- Edit articles
- Assign categories
- Save articles as drafts
- Publish articles
- Unpublish articles
- Delete articles

Draft articles are excluded from both the public Knowledge Base and the AI retrieval system.

---

# Knowledge Base Search

Knowledge Base search supports matching against:

```text
Article Title
Article Category
Article Summary
Article Content
```

Search text is normalized before comparison so common formatting differences such as:

```text
Wi-Fi
wifi
wi fi
```

can still return the same relevant article.

---

# Knowledge Base Retrieval and AI Grounding

The Help Desk Assistant uses a lightweight retrieval-augmented approach for troubleshooting questions.

```text
User Question
      ↓
Extract Search Terms
      ↓
Retrieve Published Knowledge Base Articles
      ↓
Rank Relevant Articles
      ↓
Provide Relevant Article Content to AI
      ↓
Generate a Grounded Response
```

Relevant Knowledge Base articles are retrieved from PostgreSQL and ranked using matches across:

- Title
- Category
- Summary
- Article content

Matches in titles and categories are given stronger relevance than general content matches.

Only a limited number of the highest-ranking articles are passed to the AI assistant.

---

# Safe AI Fallback

The application includes a deterministic fallback for troubleshooting questions that do not match any published Knowledge Base article.

Instead of allowing the AI model to invent:

- Troubleshooting instructions
- Internal company procedures
- Knowledge Base links
- Technical policies

the server returns a controlled response recommending that the user create a support ticket.

Example:

```text
User:
"My printer is producing purple smoke. What should I do?"

Knowledge Base:
No relevant article found

Result:
"I couldn't find a relevant published Knowledge Base article
for that issue. Please create a support ticket so the support
team can investigate it."
```

This behavior helps reduce unsupported troubleshooting responses.

---

# Agent AI Copilot

Agents and Administrators can use the assistant while viewing a ticket.

Example workflow:

```text
Agent opens ticket
      ↓
AI receives authorized ticket context
      ↓
Agent asks:
"Draft a reply to the requester."
      ↓
AI generates requester-facing reply
      ↓
Agent clicks:
"Insert into Reply Box"
      ↓
Reply is inserted into the form
      ↓
Agent reviews before submitting
```

The AI never automatically sends the message.

---

# Authentication and Security

Authentication and authorization are implemented using:

- Auth.js
- bcrypt
- Prisma ORM
- PostgreSQL

Passwords are never stored as plaintext.

During account creation:

```text
Password
   ↓
bcrypt hash
   ↓
PostgreSQL
```

During login:

```text
Entered Password
      ↓
bcrypt comparison
      ↓
Stored Password Hash
      ↓
Authentication Result
```

Additional security controls include:

- Server-side authentication guards
- Role-based authorization
- Ticket-level access restrictions
- Internal-note visibility restrictions
- Private attachment access validation
- Demo-account restrictions
- Environment-based API secrets
- AI context filtering based on role

---

# Attachments

Ticket attachments are stored using **Vercel Blob**.

Before a file can be downloaded, the server verifies:

```text
Authenticated User
      ↓
Active Account
      ↓
Ticket Access
      ↓
Attachment Access
      ↓
Download
```

Public demo accounts can download authorized existing attachments but cannot upload new files.

---

# Demo Mode

The application includes portfolio-ready demo functionality.

## Demo Requester

The Demo Requester can explore:

- Dashboard
- Ticket list
- Ticket details
- Replies
- Attachments
- Knowledge Base
- AI Help Desk Assistant

## Demo Agent

The Demo Agent can explore:

- Ticket management
- Status management
- Priority management
- Internal notes
- Ticket activity
- AI ticket summaries
- AI reply drafting
- Insert into Reply Box functionality
- Knowledge Base
- AI Help Desk Assistant

Demo accounts have additional restrictions to protect production data.

---

# Reset Demo Data

Administrators can restore demo tickets and related records through the built-in **Reset Demo Data** feature.

The reset workflow restores known sample data so portfolio visitors can interact with the application without permanently affecting the demonstration environment.

---

# Dashboard

The dashboard provides role-aware ticket information.

Depending on the user's role, it can display:

- Total accessible tickets
- Ticket status breakdown
- Ticket priority breakdown
- Recently updated tickets
- Recent activity
- Unassigned tickets
- Urgent tickets

Requester dashboard data is restricted to tickets submitted by the currently authenticated Requester.

---

# Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

## Backend

- Next.js Server Actions
- Next.js Route Handlers
- Auth.js
- Prisma ORM

## Database

- PostgreSQL
- Prisma Postgres

## File Storage

- Vercel Blob

## AI

- OpenRouter
- Configurable AI model
- Custom system prompts
- Ticket context retrieval
- Knowledge Base retrieval

## Deployment

- Vercel
- Prisma Postgres

## Development Tools

- Visual Studio Code
- Git
- GitHub
- ESLint
- Prettier
- Prisma Migrate

---

# Project Architecture

```text
Next.js Application
│
├── Authentication
│   ├── Auth.js
│   ├── bcrypt
│   └── Role-Based Authorization
│
├── Ticket System
│   ├── Tickets
│   ├── Replies
│   ├── Internal Notes
│   ├── Activities
│   └── Attachments
│
├── Knowledge Base
│   ├── Articles
│   ├── Categories
│   ├── Search
│   └── Admin CRUD
│
├── AI Assistant
│   ├── Page Context
│   ├── Role Context
│   ├── Ticket Context
│   ├── Knowledge Retrieval
│   └── Reply Drafting
│
├── PostgreSQL
│   └── Prisma ORM
│
└── Vercel
    ├── Application Hosting
    ├── Prisma Postgres
    └── Vercel Blob
```

---

# Project Structure

```text
src/
├── app/
│   ├── (app)/
│   │   ├── admin/
│   │   │   ├── categories/
│   │   │   ├── knowledge-base/
│   │   │   └── users/
│   │   │
│   │   ├── dashboard/
│   │   ├── knowledge-base/
│   │   └── tickets/
│   │
│   ├── api/
│   │   ├── ai/
│   │   └── attachments/
│   │
│   └── login/
│
├── components/
│   ├── admin/
│   ├── auth/
│   ├── dashboard/
│   ├── knowledge-base/
│   └── tickets/
│
└── lib/
    ├── auth-guards.ts
    ├── formatters.ts
    ├── prisma.ts
    ├── ticket-access.ts
    └── validations/

prisma/
├── migrations/
├── schema.prisma
└── seed.ts
```

---

# Getting Started

## 1. Clone the Repository

```bash
git clone <repository-url>
cd help-desk-management
```

Replace `<repository-url>` with the repository URL.

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create the required local environment files.

The application uses environment variables including:

```text
DATABASE_URL
SHADOW_DATABASE_URL
AUTH_SECRET

OPENROUTER_API_KEY
AI_PROVIDER
AI_MODEL
OPENROUTER_SITE_URL
OPENROUTER_APP_NAME
```

Additional variables are used for:

- Demo Requester credentials
- Demo Agent credentials
- Vercel Blob
- Production configuration

Never commit:

- API keys
- Authentication secrets
- Database credentials
- Blob storage tokens
- Production passwords

to Git.

---

## 4. Start Local Prisma Postgres

```bash
npx prisma dev
```

Keep the local database process running while developing.

---

## 5. Generate the Prisma Client

```bash
npx prisma generate
```

---

## 6. Apply Database Migrations

```bash
npx prisma migrate dev
```

---

## 7. Seed Development Data

```bash
npx prisma db seed
```

---

## 8. Start the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# Code Quality

Format the project:

```bash
npm run format
```

Verify formatting:

```bash
npm run format:check
```

Run ESLint:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

---

# Database Migrations

Database schema changes are managed using Prisma Migrate.

Development migrations can be created using:

```bash
npx prisma migrate dev --name migration_name
```

Production deployments apply committed migrations without using the local development shadow database.

Migration files are committed to Git so database schema changes remain version-controlled.

---

# Deployment

The application is deployed using **Vercel**.

Production services include:

```text
Application
→ Vercel

Database
→ Prisma Postgres

Attachments
→ Vercel Blob

AI
→ OpenRouter
```

Production secrets and API keys are configured through Vercel environment variables rather than being committed to the repository.

Knowledge Base articles and application records are stored in the production PostgreSQL database and are separate from local development data.

---

# AI Model Configuration

The AI provider and model are configured through environment variables.

Example:

```text
AI_PROVIDER=openrouter
AI_MODEL=openrouter/free
```

This makes the underlying AI provider easier to replace later without redesigning the entire Help Desk application.

For example, the project can later transition from OpenRouter to another AI provider while preserving most of the surrounding application logic.

---

# Current Knowledge Base Coverage

The Knowledge Base currently contains support documentation across:

### Account Access

- Employee portal login issues
- Forgotten password guidance

### Technical Support

- Office Wi-Fi troubleshooting
- Browser cache and cookie troubleshooting

### General Inquiry

- How to submit a support ticket
- Information to include in a support request

### Hardware Support

- Computer power issues
- External monitor troubleshooting

### Network Support

- Wired network troubleshooting
- Slow or intermittent internet connections

### Software Support

- Application crashes and freezes
- Applications that fail to open

---

# Future Improvements

Potential future improvements include:

- Semantic Knowledge Base search
- Vector embeddings
- Vector database or PostgreSQL vector search
- AI conversation history
- Email notifications
- Ticket SLA tracking
- Ticket analytics
- Reporting dashboards
- User password-change workflow
- Password reset workflow
- Rich-text Knowledge Base editor
- Knowledge Base article feedback
- Related article recommendations
- AI-assisted Knowledge Base article drafting
- Agent performance analytics
- Ticket escalation workflows
- Notification center

The current Knowledge Base retrieval implementation is intentionally lightweight for the project's scale and can later be replaced with semantic retrieval without redesigning the entire AI assistant.

---

# Screenshots

Recommended screenshots for the project documentation:

```text
1. Login / Demo Account Selection
2. Requester Dashboard
3. Agent Dashboard
4. Tickets Page
5. Ticket Details
6. Internal Notes
7. AI Ticket Summary
8. AI Reply Drafting
9. Knowledge Base
10. Knowledge Base Search
11. AI Knowledge Base Response
12. Admin Manage Knowledge Base
13. Admin Manage Users
14. Admin Categories
```

Screenshots can be added to this section as the project documentation is finalized.

---

# What This Project Demonstrates

This project was built to demonstrate practical experience with:

- Full-stack web development
- Responsive user interface development
- React and Next.js
- TypeScript
- Server Actions
- API Route Handlers
- Authentication
- Role-based authorization
- PostgreSQL database design
- Prisma ORM
- Database migrations
- File storage
- Secure resource access
- AI API integration
- Prompt design
- Retrieval-augmented AI workflows
- AI safety boundaries
- Demo environment design
- Production deployment

---

# Author

## Ivan James Lo

Computer Science graduate from **Ateneo de Davao University** focused on frontend and full-stack web development.

My primary development experience includes **React, Next.js, TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL, and modern web application development**.

I built this Help Desk Management System as a portfolio project to strengthen my experience in building applications beyond the frontend, including authentication, authorization, relational database design, server-side development, secure file handling, AI integration, and production deployment.

### Links

- **Portfolio:** https://ivanlo.vercel.app/
- **LinkedIn:** https://www.linkedin.com/in/ivan-james-lo/
- **GitHub:** https://github.com/ivanjameslo
- **Live Project:** https://helpdesk-ivanlo.vercel.app

---

# License

This project was developed primarily as a personal portfolio and learning project.

The source code may be viewed for educational and portfolio evaluation purposes.