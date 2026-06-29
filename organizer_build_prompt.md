# Codex Build Prompt: Tasks Organizer Website

## Goal

Build a fully functioning full-stack tasks organizer website. The app should help me organize tasks, goals/targets, priorities, deadlines, calendar events, and task detail pages.

The website should feel like a serious productivity tool: clean, fast, easy to scan, and useful for daily planning.

## Tech Stack

- Backend: Ruby on Rails in API-only mode
- Database: PostgreSQL
- Frontend: React with Vite
- Styling: Tailwind CSS
- API communication: JSON REST API
- Frontend routing: React Router
- HTTP requests: Axios or `fetch`
- Authentication: email/password register, login, logout, preferably JWT-based
- Project structure: monorepo

```txt
organizer/
  backend/   # Rails API + PostgreSQL
  frontend/  # React + Vite + Tailwind
```

## Required Pages

1. Homepage/dashboard
2. Tasks
3. Targets/Goals
4. Calendar
5. Task details pages, generated only for tasks that need details
6. Account

## Core Features

### Authentication

Users should be able to:

- Register with email and password
- Log in with email and password
- Stay logged in after refresh
- Log out
- Change email
- Change password

All tasks, targets, calendar events, and task detail pages should belong to the logged-in user only.

## Data Model

Create the database models needed for:

### User

Fields:

- email
- password digest or JWT-compatible auth fields

Relationships:

- has many targets
- has many tasks
- has many calendar events

### Target

A target is a goal.

Fields:

- title
- description, optional
- deadline, optional
- is_finished, boolean
- created_at
- updated_at
- user_id

Relationships:

- belongs to user
- has many tasks

### Task

Fields:

- title
- description, optional
- priority: high, medium, low
- deadline, optional
- is_completed, boolean
- has_detail_page, boolean
- target_id, optional
- user_id
- created_at
- updated_at

Relationships:

- belongs to user
- optionally belongs to target
- optionally has one task detail

Rules:

- A task can be public/general, meaning it has no target.
- A task can belong to a target.
- A task can have a deadline or no deadline.
- If the deadline is overdue and the task is not completed, show a red X on the task row.
- If the task has a deadline, it should automatically appear on the calendar.

### Task Detail

Fields:

- task_id
- notes/body text
- resources, stored as simple text or JSON array of links

Rules:

- Created only when the user chooses to create details for a task.
- The task details page should be accessible with a route like `/tasks/:id`.

### Calendar Event

Calendar events are things created directly on the calendar and not necessarily related to tasks.

Fields:

- title
- description, optional
- start_datetime
- end_datetime, optional
- event_type: event, note, pinned
- user_id

Rules:

- Calendar events are separate from tasks.
- Tasks with deadlines should appear on the calendar automatically.
- Calendar events should also appear on the calendar.

## API Requirements

Create REST API endpoints for:

- Authentication
- Users/account update
- Tasks CRUD
- Targets CRUD
- Task details CRUD
- Calendar events CRUD
- Calendar month/day data

The frontend should use the API only. Do not render Rails views.

Use JSON responses with useful errors and loading states on the frontend.

## Frontend Layout

Use a main app layout with:

- Left sidebar navigation on desktop
- Bottom navigation or compact sidebar on mobile
- Pages: Home, Tasks, Targets, Calendar, Account
- A clear active page state
- Responsive design

## Visual Design Direction

Use a modern productivity-app style:

- Clean light theme by default
- Soft white/gray background
- Blue accent color for calendar/task labels
- Red only for overdue or destructive actions
- Green for completed items
- Yellow/orange for medium priority
- Avoid childish visuals
- Make the app feel close to Google Calendar + a focused task manager

Suggested colors:

- Background: `#f8fafc`
- Surface: `#ffffff`
- Primary: `#2563eb`
- Text: `#111827`
- Muted text: `#6b7280`
- Border: `#e5e7eb`
- Danger: `#dc2626`
- Success: `#16a34a`

## Pages

### Homepage/Dashboard

The homepage should summarize the user's current productivity state.

Include:

- Welcome message
- Today’s tasks
- Overdue tasks
- Upcoming deadlines
- Target progress summary
- Mini calendar preview for the week
- Quick actions:
  - Add task
  - Add target
  - Add calendar event
- Small stats:
  - Total tasks
  - Completed tasks
  - Pending tasks
  - Overdue tasks
  - Active targets

The homepage should not be a marketing page. It should be the actual dashboard the user sees after logging in.

### Tasks Page

The tasks page should contain:

- Public/general tasks list at the top
- A separate task list for each target below it
- Each task row/card should show:
  - Title
  - Priority: High, Medium, Low
  - Deadline if it exists
  - Completed checkbox
  - Delete button
  - Optional “details” button/page link
  - Red X on the left if overdue and not completed

Task actions:

- Create task
- Edit task
- Delete task
- Mark complete/incomplete
- Assign task to a target or leave as public
- Set priority
- Set optional deadline
- Choose whether to create a task detail page

Sorting/filtering:

- Sort by priority
- Sort by deadline
- Filter completed/pending/overdue

Progress circle:

- Add a hideable floating circular progress widget in the bottom-right corner.
- It should show the completed task percentage in the middle.
- It should be collapsible/hidden by the user.

### Targets Page

The targets page should contain goals/targets.

Each target should show:

- Title
- Optional description
- Optional deadline
- Finished checkbox
- Delete button
- Add to tasks button

Actions:

- Create target
- Edit target
- Delete target
- Mark finished/unfinished
- Click “Add to tasks” to make sure this target appears as a list/section on the Tasks page

Important rule:

- When a target exists, the Tasks page should be able to show a task section for that target.

### Calendar Page

The calendar should look and behave similar to Google Calendar.

Top section:

- Current date and time in a large font
- Calendar view controls
- Previous/next navigation

Month grid:

- Show a large grid of month days
- Each day cell should show:
  - Day number
  - Blue dot/label items for tasks with deadlines
  - Calendar events created directly by the user

Clicking a day:

- Show a side panel or modal with:
  - Tasks due that day
  - Calendar events/pinned items for that day
  - Button to create a new calendar event

Calendar drill behavior:

- Default view: month days
- Clicking the back arrow at the top-left of the grid changes to months-of-year view
- Clicking the back arrow again changes to years view
- Years view lists years from 1990 to the current year
- Clicking a year opens that year’s months
- Clicking a month opens that month’s day grid
- Clicking a day opens the day details

Calendar event actions:

- Create event
- Edit event
- Delete event
- Events do not need to be connected to tasks

### Task Details Page

Task detail pages are optional and generated from the Tasks page.

Each task details page should show:

- Task title
- Priority
- Deadline
- Completion state
- Notes/details text area
- Resources section
- Add/edit/delete resource links
- Back to tasks button

Route example:

```txt
/tasks/:id
```

### Account Page

The account page should be simple.

Include:

- Change email form
- Change password form
- Logout button

## UX Requirements

Include:

- Empty states for tasks, targets, and calendar
- Loading states
- Error states
- Confirm before deleting important items
- Basic form validation
- Responsive layout for desktop and mobile

## Local Run Instructions

After building, explain exactly how to run both servers locally.

Include commands for:

- Installing backend dependencies
- Creating the PostgreSQL database
- Running migrations
- Starting Rails API server
- Installing frontend dependencies
- Starting Vite dev server

Also explain where to configure:

- Database username/password
- API base URL
- JWT/auth secret

## Expected Result

At the end, I should have:

- A working Rails API backend connected to PostgreSQL
- A working React frontend
- Authentication
- CRUD for tasks, targets, task details, and calendar events
- Calendar integration where task deadlines appear automatically
- Clean responsive UI
- Clear local setup instructions

