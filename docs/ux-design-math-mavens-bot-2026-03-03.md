# UX Design: Conduit — Math Mavens Telegram Bot (@MathMavens_bot)

**Date:** 2026-03-03
**Author:** UX Designer (BMAD Phase 2)
**Platform:** Conduit
**Customer Deployment:** Math Mavens (@MathMavens_bot)
**Project:** math-mavens-bot
**Input:** Product Brief 2026-03-03
**Version:** 1.0

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [User Personas](#2-user-personas)
3. [Conversation Flows](#3-conversation-flows)
4. [Message Templates](#4-message-templates)
5. [Command Reference Table](#5-command-reference-table)
6. [Interaction Patterns](#6-interaction-patterns)
7. [Notification Design](#7-notification-design)
8. [Conversation State Machine](#8-conversation-state-machine)
9. [Multi-Language Considerations](#9-multi-language-considerations)
10. [Privacy UX](#10-privacy-ux)
11. [Web Dashboard UX](#11-web-dashboard-ux)

---

## 1. Design Philosophy

### 1.1 Conversational UX Principles for a Telegram Bot

A Telegram bot is not an app. It is a conversation partner that happens to live inside an app the user already knows. This distinction drives every design decision here.

**Principle 1: The Bot Disappears Into the Background**

The gold standard for @MathMavens_bot is invisibility. When a parent sends a photo of their child's homework and the teacher replies, neither party should feel like they are operating a system. The interface should feel like an improved messaging experience — not software. Commands exist for structure, but the main interaction surface is just... messaging.

**Principle 2: Never Make the User Remember State**

The bot must carry context for the user, not the other way around. A parent should never need to type "I'm asking about Wei Ming again" — the bot knows which child is active in the session. A teacher should never need to remember which parent they are replying to — the bot injects that context. Every interaction should require zero memory from the user.

**Principle 3: Fail Gracefully and Verbosely**

When something goes wrong, the user should always receive a message that tells them (a) what happened, (b) what to try next, and (c) who to contact if that does not work. Silence after an action is never acceptable. Cryptic error codes are never acceptable.

**Principle 4: Inline Keyboards for Choices, Free Text for Content**

Structured decisions (which child, confirm or cancel, yes or no) are always inline keyboard buttons. Natural language content (messages, questions, notes) is always free-form text or media. Never ask a user to type a number to make a choice when a button will do.

**Principle 5: Minimal Command Surface for Non-Admin Users**

Parents and teachers should have almost no commands to memorize. The bot should guide them through any multi-step interaction via prompts. Commands are a power-user tool for Admin and Superadmin roles; regular users should navigate almost entirely through bot-initiated prompts and inline keyboards.

**Principle 6: Never Block Message Flow**

The primary function — message relay — must always work. Even if a secondary system (PDPA logging, analytics) fails, the message must go through. Core relay is the safety-critical path.

**Principle 7: Two Interfaces, One System**

Math Mavens operates across two distinct interfaces that share the same backend and data: the Telegram bot and the web dashboard. These interfaces serve different audiences and different interaction modes — they are not duplicates of each other, but complements.

The **Telegram bot** is the interface for parents and teachers. All their communication with the system happens through messaging — it is natural, frictionless, and requires no web browser or account login. The bot is also available as a lightweight mobile supplement for Admin and Superadmin to perform quick actions on the go (e.g., firing off a broadcast from a phone).

The **web dashboard** is the primary operational interface for Admin and Superadmin. It provides the full suite of management tools: tabular views of students, mappings, and parents; rich broadcast composition; token management; audit log search; and system oversight. The dashboard is designed for a desktop/laptop context where Priya or Jonathan are seated at their workstation.

Actions taken in the dashboard reflect immediately in the bot. When Priya adds a student mapping in the dashboard, that parent's messages become routable through the bot in real time. The two interfaces are synchronized through a shared database — there is no separate sync step or delay. Admin and Superadmin bot commands documented in this document are the mobile supplement, not the primary tool.

### 1.2 Tone of Voice

**Register: Professional but warm. Structured but human.**

Conduit is a platform built for trust-intensive domains — parents entrust their children's education and personal communication to the system running beneath the brand they see. The bot's voice must earn that trust. For the Math Mavens deployment, the bot speaks as Math Mavens (using "we" to refer to the tuition center), while the underlying platform remains invisible to end users.

**Characteristics:**
- Uses "we" to represent the Math Mavens center, not "I" (bot self-reference is cold)
- Acknowledges the user by name when known (Telegram display name at onboarding)
- Avoids corporate stiffness ("Your request has been processed") in favour of clear, direct English ("Done! Your message has been sent.")
- Never condescending — assumes users are intelligent adults who want clear information, not hand-holding
- Short sentences. One idea per line where possible.
- Appropriate use of Telegram formatting: **bold** for emphasis, not decoration

**Tone examples:**

Good: "Welcome to Math Mavens, Sarah! You're all set to message Ms Lim about Wei Ming."
Bad: "Onboarding complete. You are now registered in the system."

Good: "Something went wrong sending your message. Please try again, or contact admin at [link]."
Bad: "Error 500. Message relay failed."

Good: "Which child would you like to message about?"
Bad: "Please select student from the following list:"

### 1.3 Singapore Context Considerations

**Use of names:** Singapore convention is formal-first for professional relationships. Teachers are "Ms Lim" or "Mr Tan", not first-name basis unless specified. Parents are addressed by their name (usually English name or first name from Telegram profile), not "Dear Parent/Guardian."

**Time references:** All times in SGT (Singapore Standard Time, UTC+8). Format: 3:45 PM, not 15:45 or 3:45pm.

**Date format:** DD MMM YYYY (e.g., 03 Mar 2026) — avoids US/UK MM/DD/YYYY ambiguity.

**Acknowledgement culture:** Singapore communication norms expect confirmation that a message was received. The bot should confirm delivery to the sender — a lightweight "sent" indicator satisfies this deeply-held expectation.

**Academic pressure context:** Parents messaging about homework or results may be anxious. The bot's tone when handling academic queries should be calm and reassuring, not mechanical.

---

## 2. User Personas

### 2.1 Parent Persona — "Sarah Tan"

**Demographics:**
- Age: 38, working professional (HR manager)
- Children: Two — Wei Ming (P5, enrolled with Ms Lim) and Jia Hui (P3, enrolled with Mr Tan)
- Telegram usage: Daily, for family chats and community groups
- Technical comfort: Comfortable with apps and messaging; not a developer

**Goals:**
- Know that her children's homework questions get answered
- Pay fees without going to the counter or doing bank transfers manually
- Reach the teacher quickly if her child is struggling
- Trust that her Telegram handle and contact are not being shared

**Frustrations:**
- Forgetting which WhatsApp group is for which subject
- Getting WhatsApp messages from teachers at 11pm about admin matters
- Not knowing if her message was seen by the teacher
- Complicated apps that require account creation

**Bot Behavior Expectation:**
- Should work exactly like a normal Telegram chat
- Should tell her if her message was delivered
- Should remember which child she's asking about without her stating it every time
- Should feel like she's reaching the teacher, even if she knows there's a bot in between

**Key Design Constraint:** Sarah's session regularly switches between two children. The session selector must be frictionless — she should not feel punished for having two children enrolled.

---

### 2.2 Teacher Persona — "Ms Lim Boon Hui"

**Demographics:**
- Age: 34, full-time math tutor at Math Mavens
- Students: 18 students across 4 class groups
- Telegram usage: Heavy personal user; previously shared personal handle with parents
- Technical comfort: Comfortable with smartphones; dislikes complicated admin

**Goals:**
- Receive parent messages without giving out her personal number
- Know immediately which student a message is about
- Reply from her phone without switching apps
- Not be contactable outside her set working hours (or at least manage the pressure)

**Frustrations:**
- Parents messaging her personal Telegram at midnight
- Not knowing which parent a message came from if she has multiple with similar names
- Forgetting which parent she was mid-conversation with
- Being asked to learn a new system on top of everything else

**Bot Behavior Expectation:**
- Every message received via bot must clearly identify the student context
- Replying should work exactly like Telegram's native reply — no special command required
- If she wants to message a parent proactively, she should be able to select the student and the message goes through

**Key Design Constraint:** Ms Lim will not tolerate extra steps. If replying requires more than "reply to the message in Telegram," she will revert to personal contact. The reply flow must leverage Telegram's native reply threading.

---

### 2.3 Admin Persona — "Priya Nair"

**Role:** Admin (office staff — day-to-day operational user)

**Demographics:**
- Age: 29, Math Mavens operations and admin coordinator
- Responsibilities: Student enrollment, class assignments, payment tracking, parent communications admin
- Telegram usage: Moderate; uses for personal chats
- Technical comfort: Comfortable with spreadsheets and SaaS tools; no coding

**Goals:**
- Onboard new families quickly (generate and send a deep link)
- Reassign a student to a new teacher when class groups shift
- Push announcements to all parents or a specific cohort
- Know at a glance which students are mapped to which teachers

**Frustrations:**
- Managing information across too many spreadsheets
- Parents asking why they haven't received a message she sent
- Not being able to confirm if admin actions took effect without calling someone
- Having to ask the developer every time she wants to do something

**Primary Interface: Web Dashboard**
Priya's main tool is the **web dashboard**, accessed from her office computer during the workday. This is where she manages student enrollments, views and edits mappings, generates onboarding links, composes broadcasts, and reviews the state of the system. The dashboard gives her tabular views with search and filter — the kind of dense operational view that is impossible to replicate in a Telegram chat.

**Bot as Mobile Supplement:**
When Priya is away from her desk — at lunch, between meetings, or handling something on the fly — she uses the bot's admin commands on her phone. For example, she might fire off a broadcast from her phone or generate a quick onboarding link without opening a laptop. Bot commands are not her primary workflow; they are her fallback for on-the-go actions.

**Dashboard Behavior Expectation:**
- The dashboard should feel like a well-designed SaaS operations tool (think: simple CRM or school admin panel)
- Tables should be searchable and sortable
- Actions should have clear confirmations and undo where appropriate
- The dashboard should reflect real-time state (if a parent just onboarded, Priya should see them immediately)

**Bot Behavior Expectation (mobile supplement):**
- Admin commands respond with a clear confirmation (or clear error) every time
- Command syntax should be memorable and consistent
- Output for list commands should be readable in Telegram without scrolling forever
- Should not require Priya to know student Telegram IDs — she knows student names and enrollment numbers

**Key Design Constraint:** Priya is comfortable with SaaS tools and spreadsheets. The dashboard should match her mental model of a data management tool. For bot commands, she has no CLI experience — auto-complete via the `/` command menu in Telegram is her main discoverability tool.

**Scope boundary:** Priya handles operational tasks only. System-level actions (user deactivation, audit logs, user promotion/demotion, PDPA data deletion processing) are reserved for the Superadmin role.

---

### 2.4 Superadmin Persona — "Mr. Jonathan Tan"

**Role:** Superadmin (god mode — MM Director / system owner)

**Demographics:**
- Age: 42, Math Mavens Director and system owner
- Responsibilities: Business oversight, system governance, user management, PDPA compliance
- Telegram usage: Heavy; technically proficient
- Technical comfort: Comfortable reading system logs and understanding operational metrics; not necessarily a developer but technically literate

**Goals:**
- Maintain visibility into system health and message relay activity
- Deactivate or reactivate users when needed (including admins)
- Promote trusted office staff to Admin role; demote if required
- Process PDPA data deletion requests within the 10-business-day window
- Audit message relay metadata for compliance purposes

**Frustrations:**
- Not knowing if the bot is healthy without asking the developer
- Having no visibility into who did what in the system
- Needing to escalate every user management task to engineering

**Primary Interface: Web Dashboard**
Jonathan's primary operational tool is the **web dashboard**, accessed from his computer. This is where he handles user management (promote, demote, deactivate), reviews the audit log with full search and date filtering, monitors system health on the System Status screen, and processes PDPA deletion requests. The dashboard gives him the visibility and control he needs without requiring him to context-switch into Telegram for operational tasks.

**Bot as Mobile Supplement:**
When Jonathan needs a quick system status check or wants to take urgent action without opening his laptop, he uses bot commands. For example, he might run `/system_status` from his phone to verify the bot is healthy before an important parent event, or use `/broadcast` to push an urgent message. Bot commands are the mobile fallback, not his primary interface.

**Dashboard Behavior Expectation:**
- The dashboard should give full audit visibility — searchable, filterable by date, user, and action type
- User management actions (promote, demote, deactivate) should have confirmation dialogs with stated consequences
- System status should be a live, at-a-glance health panel, not a snapshot command
- PDPA requests should be a managed queue — not just a list, but a workflow with status tracking

**Bot Behavior Expectation (mobile supplement):**
- System status commands return clear, parseable health data
- Audit logs are readable in Telegram (paginated, timestamped)
- Destructive actions (deactivate, demote) require confirmation step
- Superadmin commands should be clearly distinct from Admin commands — different help output, different access level

**Key Design Constraint:** Jonathan needs audit visibility and user lifecycle control. All Superadmin commands (both in the dashboard and via bot) must include an audit log entry on execution. Actions that cannot be undone (e.g., data deletion) must have an explicit confirmation step with consequences stated.

---

## 3. Conversation Flows

### Notation

```
[User] = Message or action from user
[Bot]  = Response from bot
[System] = Background action (not visible to user)
<condition> = Decision point or state check
{button} = Inline keyboard button label
```

---

### 3A. Parent Onboarding Flow

#### Happy Path

```
[System] Admin pre-generates deep link token for parent:
         t.me/MathMavens_bot?start=PARENT_abc123

[User]   Taps deep link → Telegram opens → user taps START

[System] Bot receives /start PARENT_abc123
         Look up token → valid, linked to: Sarah Tan → Wei Ming (P5) + Jia Hui (P3)
         Check: token not yet redeemed; user not already registered

[Bot]    Welcome message (TEMPLATE: PARENT_WELCOME_CONSENT)
         ┌ Hi Sarah! Welcome to Math Mavens.
         │
         │ This bot lets you message your children's tutors
         │ securely — your personal contact details stay private,
         │ and so do theirs.
         │
         │ Before we continue, please read our data notice:
         │ We collect your Telegram ID and link it to your
         │ child's enrollment. Messages are relayed but not
         │ stored. You can request data deletion at any time
         │ via /privacy.
         │
         │ By tapping Agree, you consent to this under PDPA.
         └
         {I Agree — Let's Go}    {I Need More Info}

[User]   Taps {I Agree — Let's Go}

[System] Record consent: user_id, timestamp, token, consent=true
         Mark token as redeemed
         Create parent record linked to student enrollments

[Bot]    Confirmation message (TEMPLATE: PARENT_ONBOARDED)
         ┌ You're all set, Sarah!
         │
         │ Children enrolled:
         │ • Wei Ming — P5 (Ms Lim Boon Hui's class)
         │ • Jia Hui — P3 (Mr Tan Kah Wai's class)
         │
         │ To message a tutor, just type here anytime.
         │ If you have more than one child, we'll ask which
         │ one you're writing about.
         │
         │ Need help? Type /help
         └
```

#### Branch: User taps "I Need More Info"

```
[User]   Taps {I Need More Info}

[Bot]    ┌ No problem. Here's what we collect and why:
         │
         │ • Your Telegram ID — to route messages to the
         │   right tutor. We never share this.
         │ • Your name (from Telegram) — so tutors know
         │   who is messaging them.
         │ • Message metadata (time sent, direction) —
         │   for audit trail only. Message content is
         │   not stored.
         │
         │ Your tutor's contact details are never shown
         │ to you, and yours are never shown to them.
         │
         │ To delete your data, type /privacy at any time.
         │
         │ Questions? Contact admin: [MM Admin Contact]
         └
         {I Agree — Let's Go}    {Not Now}

[User]   Taps {Not Now}

[Bot]    ┌ That's okay. You won't be able to use the bot
         │ until you agree — the consent is required by
         │ Singapore's PDPA.
         │
         │ When you're ready, just tap /start again or
         │ use your original sign-up link.
         │
         │ Questions? Contact us: [MM Admin Contact]
         └

[System] No record created. Token remains unredeemed.
```

#### Error: Invalid or Expired Token

```
[User]   Taps link → /start PARENT_expired_xyz

[System] Token look-up → not found or expired (> 72 hours) or already redeemed by different user

[Bot]    ┌ Hmm, that link doesn't seem to be working.
         │
         │ This can happen if:
         │ • The link was used before (each link is single-use)
         │ • The link has expired (links are valid for 72 hours)
         │
         │ Please contact Math Mavens admin to get a fresh link:
         │ [Admin Contact / Admin Handle]
         └
```

#### Error: Already Registered

```
[User]   Taps link → /start PARENT_abc123 (already redeemed by same user)

[System] Token look-up → redeemed; user_id matches existing parent record

[Bot]    ┌ You're already set up, Sarah! No need to register again.
         │
         │ Your enrolled children:
         │ • Wei Ming — P5 (Ms Lim's class)
         │ • Jia Hui — P3 (Mr Tan's class)
         │
         │ Just type your message here anytime.
         └
```

#### Error: Token Used by Different Account

```
[System] Token look-up → already redeemed; user_id does NOT match current user

[Bot]    ┌ This link has already been used to register another account.
         │
         │ If you think this is a mistake, please contact admin:
         │ [Admin Contact]
         │
         │ Do not share your registration link with others.
         └
```

---

### 3B. Teacher Onboarding Flow

#### Happy Path

```
[System] Admin pre-generates deep link token for teacher:
         t.me/MathMavens_bot?start=TEACHER_lim_bh_001

[User]   Teacher taps deep link → Telegram opens → taps START

[System] Bot receives /start TEACHER_lim_bh_001
         Look up token → valid, type=TEACHER, linked to: Ms Lim Boon Hui
         Check: not yet redeemed

[Bot]    TEMPLATE: TEACHER_WELCOME
         ┌ Hi Ms Lim! Welcome to Math Mavens' communication system.
         │
         │ This bot routes messages from your students' parents
         │ to you — and your replies back to them.
         │
         │ • Your personal Telegram handle is never shown to parents.
         │ • Parents' handles are never shown to you.
         │ • Just reply normally to any message you receive here.
         │
         │ You're linked to these student groups:
         │ • P5 Excellence (18 students)
         │ • P5 Foundation (12 students)
         │
         │ Tap below to confirm you're ready to receive messages.
         └
         {Confirm — I'm Ready}

[User]   Taps {Confirm — I'm Ready}

[System] Create teacher record. Mark token redeemed.
         Update teacher status: ACTIVE

[Bot]    ┌ You're all set, Ms Lim!
         │
         │ When a parent messages you, you'll receive it here
         │ with the student's name shown above the message.
         │
         │ To reply: just use Telegram's reply function on
         │ the message. The bot handles the rest.
         │
         │ Need to message a parent first? Type /message
         │
         │ Questions or issues? Type /help
         └
```

#### Error: Invalid Token

```
[System] Token lookup → not found or expired

[Bot]    ┌ That link doesn't appear to be valid.
         │
         │ Please contact Math Mavens admin for a fresh link:
         │ [Admin Contact]
         └
```

#### Error: Already Registered (Teacher)

```
[System] Token valid; user_id matches existing active teacher record

[Bot]    ┌ You're already registered, Ms Lim!
         │
         │ You're linked to:
         │ • P5 Excellence (18 students)
         │ • P5 Foundation (12 students)
         │
         │ Messages from parents will arrive here as usual.
         │ Type /help for commands.
         └
```

---

### 3C. Parent → Teacher Messaging Flow

#### Single Child (Simple Case)

```
[User]   Sarah types: "Hi, Wei Ming doesn't understand question 3 of today's worksheet"

[System] Look up Sarah's profile
         → One active child only (or session already set to Wei Ming)
         → Route to Ms Lim's Telegram chat

[Bot → Ms Lim]  copyMessage to teacher chat, preceded by injected header:
         ┌ 📌 [Wei Ming — P5]
         ├─────────────────────────────
         │ Hi, Wei Ming doesn't understand question 3
         │ of today's worksheet
         └

[Bot → Sarah]   Delivery confirmation (subtle, inline):
         ┌ ✓ Message sent to Wei Ming's tutor.
         └
```

#### Multi-Child: Session Selector Flow

```
[User]   Sarah types: "Is there extra homework this week?"

[System] Sarah has 2 active children, no current session context

[Bot]    TEMPLATE: CHILD_SELECTOR
         ┌ Which child is this message about?
         └
         {Wei Ming — P5}    {Jia Hui — P3}

[System] Awaiting user selection. State: SELECTING_CHILD
         Message content held in temporary buffer.

[User]   Taps {Wei Ming — P5}

[System] Session set to Wei Ming → Ms Lim
         Release buffered message → copyMessage to Ms Lim with header

[Bot → Ms Lim]  ┌ 📌 [Wei Ming — P5]
                ├─────────────────────────────
                │ Is there extra homework this week?
                └

[Bot → Sarah]   ┌ ✓ Message sent to Wei Ming's tutor (Ms Lim).
                └
```

**Session Persistence:**
Once a child is selected in a session, subsequent messages in that session are assumed to be about the same child. A new selector is triggered only:
- After 30 minutes of inactivity
- When the parent explicitly types /switch or sends a new opening message after a confirmed session end
- When the parent's next message begins with a phrase pattern that suggests a topic change unrelated to the previous context (Phase 2 AI feature)

#### Sending Media (Photo, Voice, Document)

```
[User]   Sarah sends a photo of a worksheet

[System] Receive photo message
         → Sarah has active session (Wei Ming)
         → copyMessage (preserves photo via file_id reuse)
         → Add header as a separate preceding message to teacher

[Bot → Ms Lim]  Message 1: ┌ 📌 [Wei Ming — P5]
                            └ (header only message — simple text)

                Message 2: [Photo copied via copyMessage — no "Forwarded from"]

[Bot → Sarah]   ┌ ✓ Photo sent to Wei Ming's tutor.
                └
```

Note: Header is sent as a separate message immediately before the copied message. This is required because `copyMessage` cannot inject text into a media message's caption from a routing perspective. The header-then-media pattern is consistent and recognizable to teachers after initial onboarding.

#### Voice Note Relay

```
[User]   Sarah sends a voice note

[System] Same as photo flow.
         copyMessage relays voice note natively via file_id.
         Header sent as preceding text message.

[Bot → Ms Lim]  Message 1: 📌 [Wei Ming — P5]
                Message 2: [Voice note — copied, no attribution]

[Bot → Sarah]   ✓ Voice note sent to Wei Ming's tutor.
```

#### Sticker Relay

```
[User]   Sarah sends a sticker (could happen — design for it)

[System] copyMessage copies sticker.
         Header sent preceding.
         No confirmation message for stickers (would feel odd).
         Delivery silently logged.
```

---

### 3D. Teacher → Parent Reply Flow

#### Reply to a Relayed Message (Primary Flow)

```
[User]   Ms Lim uses Telegram's native Reply on the Wei Ming message:
         "Yes there is! Pages 34–36, due Thursday."

[System] Receive reply message from Ms Lim
         → Inspect replied-to message ID
         → Look up routing: relayed message ID → parent_chat_id (Sarah)
         → copyMessage to Sarah's chat

[Bot → Sarah]   [Message copied: "Yes there is! Pages 34–36, due Thursday."]
                (No "from Ms Lim" attribution — anonymity preserved)

[System] Log: teacher→parent, student=Wei Ming, timestamp
```

Note: The teacher never needs to know Sarah's Telegram ID. The reply-ID-based routing handles everything. Ms Lim just replies as she would in any Telegram conversation.

#### Teacher-Initiated Message (Not a Reply)

```
[User]   Ms Lim types a new message (not a reply): "Reminder: class is rescheduled to Friday."

[System] This is a new outbound message — no reply context to look up.
         Check how many parents Ms Lim has active routing with.
         → Ms Lim has 18 students (18 different parents potentially)

[Bot → Ms Lim]  TEMPLATE: TEACHER_STUDENT_SELECTOR
         ┌ Who is this message for?
         │
         │ Your recent active students:
         └
         {Wei Ming}   {Jun Hao}   {Mei Ling}
         {Li Xuan}    {Rajan}     {Priya}
         {More students ▼}

[User]   Ms Lim taps {Wei Ming}

[Bot → Ms Lim]  ┌ Message will go to Wei Ming's parent.
                │ Send now?
                └
                {Send}    {Cancel}

[User]   Ms Lim taps {Send}

[System] copyMessage → Sarah's chat

[Bot → Sarah]   [Message: "Reminder: class is rescheduled to Friday."]

[Bot → Ms Lim]  ✓ Sent to Wei Ming's parent.
```

#### Teacher-to-Multiple (Quick Broadcast Pattern)

For scenarios where a teacher wants to send the same message to all her students' parents:

```
[User]   Ms Lim types /message

[Bot]    ┌ Who do you want to message?
         └
         {A specific parent}    {All my students' parents}

[User]   Taps {All my students' parents}

[Bot]    ┌ Type your message and we'll send it to parents
         │ of all 18 of your students.
         │
         │ Type /cancel to abort.
         └

[User]   Types: "Class notes for today's session are attached."

[Bot]    ┌ Ready to send to 18 parents:
         │ "Class notes for today's session are attached."
         │
         │ Confirm?
         └
         {Confirm Send}    {Cancel}

[User]   {Confirm Send}

[System] Queue broadcast to 18 parents with rate limiting (1/sec per chat)

[Bot]    ┌ Sending to 18 parents... (Est. delivery: ~20 seconds)
         └

[System] After all delivered:

[Bot]    ✓ Sent to all 18 parents.
```

---

### 3E. Admin Operations Flow

> **Note:** The web dashboard is the primary interface for Admin and Superadmin operations. The bot commands documented in this section serve as a mobile supplement — for quick actions on the go when a laptop is not available. See Section 11 for dashboard UX.

#### Guard: Admin Authentication

Every admin command first verifies the sender's Telegram user_id is in the admin or Superadmin role list. If the sender is not registered as either:

```
[Bot]    ┌ This command is not available.
         │ If you need admin access, contact Math Mavens.
         └
```

If an Admin user attempts a Superadmin-only command (e.g., /deactivate, /audit, /promote):

```
[Bot]    ┌ You don't have permission to use this command.
         │ Please contact your Superadmin for assistance.
         └
```

Note: Admin and Superadmin are distinct roles. Admin covers day-to-day operational tasks. Superadmin-only commands cover system-level and destructive operations. See Section 3G for Superadmin flows.

#### Command: /admin — Admin Menu

```
[User]   Priya types /admin

[Bot]    TEMPLATE: ADMIN_MENU
         ┌ Math Mavens Admin Panel
         │ ─────────────────────────
         │ Logged in as: Priya Nair (Admin)
         │ Time: 03 Mar 2026, 10:14 AM (SGT)
         └
         {Add Student Mapping}      {Remove Student}
         {Reassign Teacher}         {Generate Onboarding Link}
         {Broadcast Message}        {View Mappings}
         {View Teachers}            {View Parents}
```

#### Command: /add_student — Add Student Mapping

```
[User]   Priya taps {Add Student Mapping} or types /add_student

[Bot]    ┌ Add Student Mapping
         │ ─────────────────────────
         │ Enter the student's full name:
         └

[User]   Types: "Lim Wei Ming"

[Bot]    ┌ Student name: Lim Wei Ming
         │
         │ Enter the student's enrollment ID (or skip with /skip):
         └

[User]   Types: "MM2026-P5-042"

[Bot]    ┌ Select the assigned teacher:
         └
         {Ms Lim Boon Hui}    {Mr Tan Kah Wai}
         {Ms Chan Siew Yin}   {Other (type name)}

[User]   Taps {Ms Lim Boon Hui}

[Bot]    ┌ Now enter the parent's full name:
         └

[User]   Types: "Tan Siew Lian (Sarah)"

[Bot]    ┌ Summary — please confirm:
         │ ─────────────────────────
         │ Student:    Lim Wei Ming (MM2026-P5-042)
         │ Teacher:    Ms Lim Boon Hui
         │ Parent:     Tan Siew Lian (Sarah)
         │
         │ Next step: Generate a parent onboarding link
         │ for this family?
         └
         {Yes — Generate Link}    {Save Without Link}    {Cancel}

[User]   Taps {Yes — Generate Link}

[System] Create student record.
         Generate parent onboarding token (72hr TTL).
         Token stored and linked to this student.

[Bot]    ┌ Mapping created! Here's the parent's sign-up link:
         │
         │ t.me/MathMavens_bot?start=PARENT_abc789xyz
         │
         │ Send this to Tan Siew Lian. The link expires in 72 hours.
         │ (Tap to copy — then paste into your message to them)
         └
         {Generate Another Link}    {Back to Admin Menu}
```

#### Command: /remove_student — Remove Student Mapping

```
[User]   Priya types /remove_student or taps {Remove Student}

[Bot]    ┌ Remove Student Mapping
         │ ─────────────────────────
         │ Enter the student name or enrollment ID to remove:
         └

[User]   Types: "Wei Ming" or "MM2026-P5-042"

[System] Search student records → match found

[Bot]    ┌ Found: Lim Wei Ming (MM2026-P5-042)
         │ Teacher: Ms Lim Boon Hui
         │ Parent: Tan Siew Lian
         │
         │ This will deactivate message routing for this student.
         │ Existing message logs are retained for audit.
         │
         │ Remove this mapping?
         └
         {Confirm Remove}    {Cancel}

[User]   {Confirm Remove}

[System] Set student status: DEACTIVATED
         Routing entry disabled (not deleted — audit trail retained)

[Bot]    ┌ Done. Lim Wei Ming's mapping has been removed.
         │ Ms Lim and the parent will no longer receive routed
         │ messages for this student.
         └

[System] Optionally notify parent:

[Bot → Sarah] ┌ A message from Math Mavens:
              │ Wei Ming's enrollment has been updated.
              │ If you have questions, contact admin: [link]
              └
```

#### Command: /reassign — Reassign Student to New Teacher

```
[User]   Priya types /reassign

[Bot]    ┌ Reassign Student
         │ ─────────────────────────
         │ Enter the student name or enrollment ID:
         └

[User]   Types: "Wei Ming"

[Bot]    ┌ Found: Lim Wei Ming (MM2026-P5-042)
         │ Current teacher: Ms Lim Boon Hui
         │
         │ Select the new teacher:
         └
         {Mr Tan Kah Wai}    {Ms Chan Siew Yin}
         {Other (type name)}

[User]   Taps {Mr Tan Kah Wai}

[Bot]    ┌ Reassign summary:
         │ Student:       Lim Wei Ming
         │ From teacher:  Ms Lim Boon Hui
         │ To teacher:    Mr Tan Kah Wai
         │
         │ Future messages will route to Mr Tan.
         │ Past message history is preserved.
         │
         │ Notify parent of the teacher change?
         └
         {Reassign + Notify Parent}    {Reassign Only}    {Cancel}

[User]   {Reassign + Notify Parent}

[System] Update routing record. Activate new teacher mapping.

[Bot → Sarah] ┌ Update from Math Mavens:
              │
              │ Wei Ming's tutor has been updated.
              │ Going forward, messages will be routed to
              │ your new assigned tutor.
              │
              │ If you have any questions, contact admin.
              └

[Bot → Priya] ✓ Done. Wei Ming is now assigned to Mr Tan Kah Wai.
              The parent has been notified.
```

#### Note: /deactivate is a Superadmin-Only Command

User deactivation (parents, teachers, admins) is a system-level destructive operation reserved for the Superadmin role. If an Admin attempts /deactivate, they receive the permission denied message (see Guard section above). The full deactivation flow is documented in Section 3G (Superadmin Operations Flow).

#### Command: /broadcast — Send Announcements

```
[User]   Priya types /broadcast

[Bot]    TEMPLATE: BROADCAST_COMPOSER
         ┌ Broadcast Message
         │ ─────────────────────────
         │ Who should receive this message?
         └
         {All Parents}        {All Teachers}
         {Specific Cohort}    {Individual Parent}

[User]   Taps {Specific Cohort}

[Bot]    ┌ Select the cohort:
         └
         {P3 — All parents}    {P4 — All parents}
         {P5 — Ms Lim's class} {P5 — Mr Tan's class}
         {Custom (type class name)}

[User]   Taps {P5 — Ms Lim's class}

[Bot]    ┌ This will message 18 parents in Ms Lim's P5 class.
         │
         │ Type your broadcast message now.
         │ (You can include photos or documents too — just send them.)
         │
         │ Type /cancel to abort.
         └

[User]   Types: "Reminder: Mid-year assessment is on 15 Mar. Please
                ensure your child has revised chapters 5–8."

[Bot]    TEMPLATE: BROADCAST_CONFIRM
         ┌ Broadcast Preview
         │ ─────────────────────────
         │ To:      Ms Lim's P5 class (18 parents)
         │ Message: "Reminder: Mid-year assessment is on 15 Mar.
         │           Please ensure your child has revised
         │           chapters 5–8."
         │
         │ Estimated delivery: ~20 seconds
         └
         {Send Broadcast}    {Edit Message}    {Cancel}

[User]   {Send Broadcast}

[System] Queue 18 messages. Rate-limit to 1/sec per chat.

[Bot → Priya] Sending... (18 parents)
              ████████░░ 14/18 sent

[After all delivered]:

[Bot → Priya] ✓ Broadcast complete.
              Delivered to: 18/18 parents
              Failed:       0
              Time:         18 seconds

[Each Parent receives]:
         ┌ 📢 Message from Math Mavens:
         │
         │ Reminder: Mid-year assessment is on 15 Mar.
         │ Please ensure your child has revised chapters 5–8.
         └
```

#### Commands: /list_mappings, /list_teachers, /list_parents — View Lists

These commands return paginated views of the current operational data. See T-15 for the mapping list template. Teachers and parents lists follow the same paginated format.

```
[User]   Priya types /list_teachers

[Bot]    ┌ Registered Teachers — Page 1 of 1
         │ ─────────────────────────
         │ 1. Ms Lim Boon Hui
         │    Students: 30  |  Status: Active
         │
         │ 2. Mr Tan Kah Wai
         │    Students: 24  |  Status: Active
         │
         │ 3. Ms Chan Siew Yin
         │    Students: 18  |  Status: Active
         │
         │ (Showing 3 of 3 total)
         └
         {Close}
```

---

### 3G. Superadmin Operations Flow

#### Guard: Superadmin Authentication

Superadmin commands verify the sender's Telegram user_id is registered with the SUPERADMIN role. Admins attempting these commands receive the permission denied message (see Section 3E Guard). Unregistered users receive the standard "command not available" message.

#### Command: /deactivate and /reactivate — User Lifecycle Management

```
[User]   Jonathan types /deactivate

[Bot]    ┌ Deactivate User
         │ ─────────────────────────
         │ Who are you deactivating?
         └
         {Parent}    {Teacher}    {Admin}

[User]   Taps {Parent}

[Bot]    ┌ Enter the parent's name or their enrolled student's name:
         └

[User]   Types: "Sarah Tan" or "Wei Ming"

[Bot]    ┌ Found: Tan Siew Lian (Sarah) — parent of:
         │ • Lim Wei Ming (P5, Ms Lim's class)
         │ • Lim Jia Hui (P3, Mr Tan's class)
         │
         │ Deactivating will stop all routing for this parent.
         │ Both children's mappings will be paused.
         │
         │ Deactivate this parent?
         └
         {Confirm Deactivate}    {Cancel}

[User]   {Confirm Deactivate}

[System] Set parent status: DEACTIVATED
         All associated student routing: PAUSED
         Future messages from parent receive error response
         Audit log entry written: actor=Jonathan, action=DEACTIVATE_USER, target=Tan Siew Lian, timestamp

[Bot → Jonathan] ✓ Tan Siew Lian deactivated. All routing for her
                 children has been paused.
```

Reactivation flow:

```
[User]   Jonathan types /reactivate

[Bot]    ┌ Reactivate User
         │ ─────────────────────────
         │ Enter the name of the user to reactivate:
         └

[User]   Types: "Sarah Tan"

[Bot]    ┌ Found: Tan Siew Lian (Sarah) — currently DEACTIVATED
         │
         │ Reactivating will restore message routing for her children.
         │
         │ Reactivate this user?
         └
         {Confirm Reactivate}    {Cancel}

[User]   {Confirm Reactivate}

[System] Set parent status: ACTIVE
         Student routing records: ACTIVE
         Audit log entry written: actor=Jonathan, action=REACTIVATE_USER, target=Tan Siew Lian, timestamp

[Bot → Jonathan] ✓ Tan Siew Lian reactivated. Routing for her children
                 has been restored.
```

#### Command: /promote and /demote — Role Management

```
[User]   Jonathan types /promote

[Bot]    ┌ Promote User to Admin
         │ ─────────────────────────
         │ Enter the name or Telegram username of the user to promote:
         └

[User]   Types: "Priya" or "@priya_nair"

[Bot]    ┌ Found: Priya Nair (currently registered as: Parent/Teacher/User)
         │
         │ Promoting this user to Admin will grant access to:
         │ /admin, /add_student, /remove_student, /reassign,
         │ /gen_link, /broadcast, /list_mappings,
         │ /list_teachers, /list_parents
         │
         │ Confirm promotion?
         └
         {Confirm Promote}    {Cancel}

[User]   {Confirm Promote}

[System] Update user role: ADMIN
         Audit log entry written: actor=Jonathan, action=PROMOTE_USER, target=Priya Nair, new_role=ADMIN, timestamp

[Bot → Jonathan] ✓ Priya Nair promoted to Admin.
                 They now have access to all Admin commands.
```

Demotion flow:

```
[User]   Jonathan types /demote

[Bot]    ┌ Demote Admin
         │ ─────────────────────────
         │ Enter the name of the Admin to demote:
         └

[User]   Types: "Priya"

[Bot]    ┌ Found: Priya Nair (currently: Admin)
         │
         │ Demoting will remove all Admin command access.
         │ They will revert to their base role.
         │
         │ Demote this user?
         └
         {Confirm Demote}    {Cancel}

[User]   {Confirm Demote}

[System] Update user role: base role (PARENT / TEACHER / USER)
         Audit log entry written: actor=Jonathan, action=DEMOTE_USER, target=Priya Nair, timestamp

[Bot → Jonathan] ✓ Priya Nair demoted. Admin access has been removed.
```

#### Command: /audit — View Relay Audit Log

```
[User]   Jonathan types /audit

[Bot]    ┌ Audit Log — Recent Activity
         │ ─────────────────────────
         │ Showing: last 4 entries (Page 1 of N)
         │
         │ 1. 03 Mar 2026, 3:47 PM
         │    Parent → Teacher | Wei Ming (P5)
         │    Status: Delivered
         │
         │ 2. 03 Mar 2026, 3:44 PM
         │    Teacher → Parent | Wei Ming (P5)
         │    Status: Delivered
         │
         │ 3. 03 Mar 2026, 2:10 PM
         │    Broadcast | P5 Ms Lim's class (18 parents)
         │    Status: 18/18 delivered
         │
         │ 4. 03 Mar 2026, 11:02 AM
         │    DEACTIVATE_USER | Tan Siew Lian
         │    Actor: Jonathan Tan
         │
         │ (Content not stored — metadata only)
         └
         {◀ Prev}    {Next ▶}    {Close}
```

Note: Audit log shows relay metadata only — no message content is stored or displayed. Actor field is populated for Superadmin actions.

#### Command: /system_status — View System Health

```
[User]   Jonathan types /system_status

[Bot]    ┌ System Status — Math Mavens Bot
         │ ─────────────────────────
         │ Status:      ✓ Operational
         │ Uptime:      4d 7h 23m
         │ Bot latency: 120ms (Telegram API)
         │
         │ Active users
         │ • Parents:   47 registered, 43 active
         │ • Teachers:  5 registered, 5 active
         │ • Admins:    1
         │
         │ Message queue
         │ • Pending:   0
         │ • Failed (last 24h): 0
         │
         │ Last checked: 03 Mar 2026, 10:14 AM (SGT)
         └
         {Refresh}    {Close}
```

#### Command: /process_deletion — Process PDPA Data Deletion Request

```
[User]   Jonathan types /process_deletion

[Bot]    ┌ Pending Deletion Requests
         │ ─────────────────────────
         │ 1. Tan Siew Lian
         │    Requested: 03 Mar 2026, 3:47 PM
         │    Children: Lim Wei Ming, Lim Jia Hui
         │    Days since request: 2
         └
         {Process Tan Siew Lian}    {Close}

[User]   Taps {Process Tan Siew Lian}

[Bot]    ┌ Process Deletion: Tan Siew Lian
         │ ─────────────────────────
         │ This will:
         │ • Remove Telegram ID and display name
         │ • Deactivate account and routing for all children
         │ • Mark deletion as processed (timestamp recorded)
         │
         │ Audit trail metadata is retained per PDPA
         │ compliance obligations (up to 2 years).
         │
         │ This action cannot be undone.
         │
         │ Confirm deletion?
         └
         {Confirm Delete}    {Cancel}

[User]   {Confirm Delete}

[System] Erase PII: Telegram ID, display name, consent record
         Deactivate account and all child routing
         Mark deletion record: processed=true, processed_by=Jonathan, processed_at=timestamp
         Audit log entry written

[Bot → Jonathan] ✓ Deletion processed for Tan Siew Lian.
                 Personal data has been erased. Audit trail retained.

[Bot → parent's chat (if still reachable)]:
         ┌ Your data deletion request has been processed.
         │ Your account is now closed.
         │ Thank you for using Math Mavens.
         └
```

---

### 3F. Error and Edge Case Flows

#### Error: Unregistered User Sends Message

```
[User]   Unknown Telegram user types anything to the bot

[Bot]    ┌ Hi! This bot is for Math Mavens students and families.
         │
         │ It looks like you don't have an account with us yet.
         │
         │ If you're a parent or teacher at Math Mavens, please
         │ use the sign-up link sent to you by our admin team.
         │
         │ Questions? Contact us: [Admin Contact]
         └
```

#### Error: Student Mapping Not Found (Routing Failure)

```
[System] Parent sends message.
         Look up routing → student record found but teacher mapping missing or null.

[Bot → Sarah] ┌ We couldn't route your message right now.
              │
              │ This sometimes happens during a class reassignment.
              │ Please try again in a few minutes.
              │
              │ If this keeps happening, contact admin: [link]
              └

[System] Alert sent to admin chat: "Routing failure for parent [ID],
         student [ID]. Manual check required."
```

#### Error: Teacher Unavailable / Deactivated

```
[System] Parent sends message.
         Teacher record found but status = DEACTIVATED or INACTIVE.

[Bot → Sarah] ┌ Your message couldn't be delivered right now —
              │ there may be a class assignment update in progress.
              │
              │ Math Mavens admin has been notified and will
              │ follow up with you shortly.
              └

[System] Alert admin: "Message undeliverable. Teacher [ID] inactive.
         Student: [ID]. Parent: [ID]."
```

Note: We do not tell the parent the teacher is deactivated. This leaks operational information. Neutral "delivery issue" language protects privacy.

#### Error: Rate Limit Hit

```
[System] Bot hits Telegram's 1 msg/sec per-chat limit during broadcast.

[System] Queue management: exponential back-off retry (1s → 2s → 4s → 8s)
         After 3 retries, mark as failed and continue queue.

[Bot → Admin] ┌ Broadcast to [Parent Name] failed after retries.
              │ Reason: Rate limit / temporary error.
              │ Action: Retry manually with /resend_failed or
              │         contact them directly.
              └
```

#### Error: Bot Blocked by User

```
[System] Telegram returns error 403 (Forbidden) when bot attempts to send to user.
         This means the user blocked the bot.

[System] Mark user status: BLOCKED_BOT
         Log: user_id, timestamp, context

[Bot → Admin] ┌ Could not reach [Parent/Teacher Name].
              │
              │ It looks like they may have blocked the bot.
              │ Please contact them to resolve: [known contact if available]
              └
```

#### Error: Deactivated Parent Tries to Message

```
[User]   Deactivated parent sends any message

[Bot]    ┌ Your account is not currently active.
         │
         │ Please contact Math Mavens to reinstate your access:
         │ [Admin Contact]
         └
```

#### Error: Mid-Flow Timeout (User Goes Idle)

```
[System] Parent started child selector flow but did not select within 5 minutes.
         Buffer cleared. State reset to IDLE.

[Bot → Sarah] ┌ Your session timed out. No message was sent.
              │
              │ When you're ready, just type your message again.
              └
```

---

## 4. Message Templates

### Template Design Conventions

- **Bold** (`**text**`) for key labels, student names, action outcomes.
- `monospace` for IDs, tokens, links.
- Consistent header for system-injected messages: `📌 [Student Name — Level]`
- Broadcast messages prefixed: `📢 Message from Math Mavens:`
- Admin alerts prefixed: `⚠️ Admin Alert:`
- Confirmations: `✓` (plain tick) — not emoji, feels more professional
- Errors: Plain text, no red X emoji — less alarming, more trustworthy

---

### T-01: Parent Welcome + PDPA Consent

```
┌─────────────────────────────────────────┐
│ 🤖 @MathMavens_bot                      │
│                                         │
│ Hi Sarah! Welcome to Math Mavens.       │
│                                         │
│ This bot lets you message your          │
│ children's tutors securely — your       │
│ personal contact details stay private,  │
│ and so do theirs.                       │
│                                         │
│ Before we continue, please review our   │
│ data notice:                            │
│                                         │
│ We collect your Telegram ID and link    │
│ it to your child's enrollment.          │
│ Messages are relayed but not stored.    │
│ You can request data deletion at any    │
│ time by typing /privacy.               │
│                                         │
│ By tapping Agree, you consent to this   │
│ data processing under Singapore's PDPA. │
│                                         │
│ ┌─────────────────────────────────┐    │
│ │     I Agree — Let's Go          │    │
│ └─────────────────────────────────┘    │
│ ┌─────────────────────────────────┐    │
│ │     I Need More Info            │    │
│ └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

**Notes:**
- Full-width single-column buttons (stacked) — legible on mobile, no risk of two buttons not fitting on narrow screens
- First button is primary action — prominent
- "Let's Go" signals low friction. "More Info" signals respect for the user's autonomy

---

### T-02: Parent Onboarding Confirmation

```
┌─────────────────────────────────────────┐
│ 🤖 @MathMavens_bot                      │
│                                         │
│ You're all set, Sarah!                  │
│                                         │
│ Children enrolled:                      │
│ • Wei Ming — P5 (Ms Lim's class)       │
│ • Jia Hui — P3 (Mr Tan's class)        │
│                                         │
│ To message a tutor, just type here      │
│ anytime. If you have more than one      │
│ child, we'll ask which one your         │
│ message is about.                       │
│                                         │
│ Need help? Type /help                   │
└─────────────────────────────────────────┘
```

---

### T-03: Teacher Welcome

```
┌─────────────────────────────────────────┐
│ 🤖 @MathMavens_bot                      │
│                                         │
│ Hi Ms Lim! Welcome to Math Mavens'      │
│ teacher communication system.           │
│                                         │
│ This bot routes messages from your      │
│ students' parents directly to you —     │
│ no personal contact details are shared. │
│                                         │
│ You're linked to:                       │
│ • P5 Excellence (18 students)           │
│ • P5 Foundation (12 students)           │
│                                         │
│ To reply to a message: use Telegram's   │
│ reply function on the message.          │
│                                         │
│ ┌─────────────────────────────────┐    │
│ │     Confirm — I'm Ready         │    │
│ └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

---

### T-04: Message Header (Teacher-Side Context Injection)

This is the header injected before every relayed parent message. It is a separate text message sent immediately before the copyMessage.

```
┌─────────────────────────────────────────┐
│ 🤖 @MathMavens_bot                      │
│                                         │
│ 📌 Wei Ming — P5 Excellence             │
└─────────────────────────────────────────┘
```

Followed immediately by:

```
┌─────────────────────────────────────────┐
│ 🤖 @MathMavens_bot                      │
│                                         │
│ Hi, Wei Ming doesn't understand         │
│ question 3 of today's worksheet.        │
│                                         │
└─────────────────────────────────────────┘
```

**Notes:**
- The header is minimal. Teachers learn to read the `📌` marker as context.
- No timestamp (Telegram shows this natively). No "From Parent" label (unnecessary — teachers know what the bot does).
- Class group is included because some teachers have students named the same across classes.

---

### T-05: Child Session Selector

```
┌─────────────────────────────────────────┐
│ 🤖 @MathMavens_bot                      │
│                                         │
│ Which child is this message about?      │
│                                         │
│ ┌──────────────────┐ ┌───────────────┐ │
│ │  Wei Ming — P5   │ │ Jia Hui — P3  │ │
│ └──────────────────┘ └───────────────┘ │
└─────────────────────────────────────────┘
```

**Notes:**
- Two-column layout fits well for 2–3 children. For 4+ children, stack in single column.
- Show level (P3, P5) to help parent disambiguate quickly — especially for siblings in same level.
- No "Cancel" button. If the parent wants to cancel, they stop responding. State times out gracefully.

---

### T-06: Message Sent Confirmation (Parent)

```
┌─────────────────────────────────────────┐
│ 🤖 @MathMavens_bot                      │
│                                         │
│ ✓ Message sent to Wei Ming's tutor.     │
└─────────────────────────────────────────┘
```

**Notes:**
- Single line. Very light. Does not clutter the conversation.
- Uses "Wei Ming's tutor" — not "Ms Lim" — reinforces anonymity.
- "tutor" preferred over "teacher" to match MM's brand vocabulary.

---

### T-07: Teacher Student Selector (Outbound Message)

For when a teacher starts a new (non-reply) message:

```
┌─────────────────────────────────────────┐
│ 🤖 @MathMavens_bot                      │
│                                         │
│ Who is this message for?                │
│ (Recent active students shown first)    │
│                                         │
│ ┌───────────┐ ┌───────────┐ ┌────────┐ │
│ │  Wei Ming │ │  Jun Hao  │ │Mei Ling│ │
│ └───────────┘ └───────────┘ └────────┘ │
│ ┌───────────┐ ┌───────────┐ ┌────────┐ │
│ │  Li Xuan  │ │   Rajan   │ │  Priya │ │
│ └───────────┘ └───────────┘ └────────┘ │
│ ┌─────────────────────────────────┐    │
│ │         More students ▼         │    │
│ └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

**Notes:**
- Three-column grid works on most phone screens (test on 320px width).
- "More students ▼" expands to next page of 6.
- Recent-first ordering means frequent contacts are at top — reduces scroll.

---

### T-08: Admin Menu

```
┌─────────────────────────────────────────┐
│ 🤖 @MathMavens_bot                      │
│                                         │
│ Math Mavens Admin Panel                 │
│ ─────────────────────────               │
│ Logged in as: Priya Nair (Admin)        │
│ 03 Mar 2026, 10:14 AM (SGT)             │
│                                         │
│ ┌──────────────────┐ ┌───────────────┐ │
│ │ Add Mapping      │ │ Remove Student│ │
│ └──────────────────┘ └───────────────┘ │
│ ┌──────────────────┐ ┌───────────────┐ │
│ │ Reassign Teacher │ │ Generate Link │ │
│ └──────────────────┘ └───────────────┘ │
│ ┌─────────────────────────────────┐    │
│ │         Broadcast Message       │    │
│ └─────────────────────────────────┘    │
│ ┌──────────────────┐ ┌───────────────┐ │
│ │  View Mappings   │ │ View Teachers │ │
│ └──────────────────┘ └───────────────┘ │
│ ┌─────────────────────────────────┐    │
│ │         View Parents            │    │
│ └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

**Notes:**
- Deactivate User and View Audit Log have been removed from Admin menu — these are Superadmin-only operations.
- Superadmin accessing /admin sees their own menu variant (T-08-SA) with additional options.

---

### T-09: Broadcast Confirmation Preview

```
┌─────────────────────────────────────────┐
│ 🤖 @MathMavens_bot                      │
│                                         │
│ Broadcast Preview                       │
│ ─────────────────────────               │
│ To:      Ms Lim's P5 class (18 parents) │
│ Message: "Reminder: Mid-year assessment │
│           is on 15 Mar. Please ensure   │
│           your child has revised        │
│           chapters 5–8."               │
│                                         │
│ Est. delivery: ~20 seconds              │
│                                         │
│ ┌──────────────────┐ ┌───────────────┐ │
│ │  Send Broadcast  │ │  Edit Message │ │
│ └──────────────────┘ └───────────────┘ │
│ ┌─────────────────────────────────┐    │
│ │           Cancel                │    │
│ └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

---

### T-10: Broadcast Received (Parent View)

```
┌─────────────────────────────────────────┐
│ 🤖 @MathMavens_bot                      │
│                                         │
│ 📢 Message from Math Mavens:            │
│                                         │
│ Reminder: Mid-year assessment is on     │
│ 15 Mar. Please ensure your child has    │
│ revised chapters 5–8.                   │
└─────────────────────────────────────────┘
```

**Notes:**
- `📢` icon and "Message from Math Mavens:" prefix clearly marks this as an institutional message, not a tutor reply. Prevents confusion.

---

### T-11: Error — Generic User-Facing

```
┌─────────────────────────────────────────┐
│ 🤖 @MathMavens_bot                      │
│                                         │
│ Something went wrong sending your       │
│ message. Please try again in a moment.  │
│                                         │
│ If this keeps happening, contact admin: │
│ [Admin contact or @handle]              │
└─────────────────────────────────────────┘
```

---

### T-12: Error — Token Invalid

```
┌─────────────────────────────────────────┐
│ 🤖 @MathMavens_bot                      │
│                                         │
│ Hmm, that link doesn't seem to be       │
│ working.                                │
│                                         │
│ This can happen if:                     │
│ • The link was used before              │
│   (each link is single-use)             │
│ • The link has expired                  │
│   (links are valid for 72 hours)        │
│                                         │
│ Please contact Math Mavens admin for    │
│ a fresh link:                           │
│ [Admin Contact]                         │
└─────────────────────────────────────────┘
```

---

### T-13: Admin — Generate Onboarding Link Result

```
┌─────────────────────────────────────────┐
│ 🤖 @MathMavens_bot                      │
│                                         │
│ ✓ Mapping created!                      │
│                                         │
│ Parent sign-up link:                    │
│                                         │
│ t.me/MathMavens_bot?start=PARENT_abc789 │
│                                         │
│ Send this to Tan Siew Lian.             │
│ Expires: 05 Mar 2026, 10:14 AM (SGT)   │
│                                         │
│ ┌──────────────────┐ ┌───────────────┐ │
│ │ Generate Another │ │ Admin Menu    │ │
│ └──────────────────┘ └───────────────┘ │
└─────────────────────────────────────────┘
```

---

### T-14: Admin Alert — System / Routing Failure

```
┌─────────────────────────────────────────┐
│ 🤖 @MathMavens_bot                      │
│                                         │
│ ⚠️ Admin Alert                          │
│                                         │
│ Routing failure detected.               │
│                                         │
│ Parent: Tan Siew Lian                   │
│ Student: Lim Wei Ming (MM2026-P5-042)  │
│ Time: 03 Mar 2026, 3:47 PM (SGT)       │
│ Reason: Teacher record not found        │
│                                         │
│ Action needed: Check mapping in /admin  │
└─────────────────────────────────────────┘
```

---

### T-15: View Mappings (Paginated)

```
┌─────────────────────────────────────────┐
│ 🤖 @MathMavens_bot                      │
│                                         │
│ Active Mappings — Page 1 of 4           │
│ ─────────────────────────               │
│ 1. Lim Wei Ming (P5)                    │
│    Teacher: Ms Lim Boon Hui             │
│    Parent:  Tan Siew Lian               │
│    Status:  Active                      │
│                                         │
│ 2. Chen Jun Hao (P5)                    │
│    Teacher: Ms Lim Boon Hui             │
│    Parent:  Chen Mei Hua                │
│    Status:  Active                      │
│                                         │
│ 3. Priya Subramanian (P3)               │
│    Teacher: Mr Tan Kah Wai              │
│    Parent:  Kamala Subramanian          │
│    Status:  Active                      │
│                                         │
│ (Showing 3 of 42 total)                 │
│                                         │
│ ┌──────────┐ ┌────────────┐ ┌────────┐ │
│ │  ◀ Prev  │ │  Next ▶   │ │ Close  │ │
│ └──────────┘ └────────────┘ └────────┘ │
└─────────────────────────────────────────┘
```

---

### T-16: /help Response (Parent)

```
┌─────────────────────────────────────────┐
│ 🤖 @MathMavens_bot                      │
│                                         │
│ Math Mavens Bot — Help                  │
│                                         │
│ To message your child's tutor:          │
│ Just type your message here!            │
│                                         │
│ Commands you can use:                   │
│ /switch  — change which child to message│
│ /privacy — view or delete your data     │
│ /help    — show this message            │
│                                         │
│ Need urgent help? Contact admin:        │
│ [Admin Contact]                         │
└─────────────────────────────────────────┘
```

---

### T-17: /help Response (Teacher)

```
┌─────────────────────────────────────────┐
│ 🤖 @MathMavens_bot                      │
│                                         │
│ Math Mavens Bot — Teacher Help          │
│                                         │
│ To reply to a parent: use Telegram's    │
│ native Reply on the message.            │
│                                         │
│ Commands:                               │
│ /message — send a message to a parent  │
│ /students — list your students          │
│ /help    — show this message            │
│                                         │
│ Issues? Contact admin: [Admin Contact]  │
└─────────────────────────────────────────┘
```

---

### T-18: Superadmin — Permission Denied (Admin Attempts Superadmin Command)

```
┌─────────────────────────────────────────┐
│ 🤖 @MathMavens_bot                      │
│                                         │
│ You don't have permission to use        │
│ this command.                           │
│                                         │
│ Please contact your Superadmin          │
│ for assistance.                         │
└─────────────────────────────────────────┘
```

**Notes:**
- Does not specify which role is required — avoids leaking role architecture to the user.
- Does not say "Admin" or "Superadmin" explicitly — just directs to escalation path.

---

### T-19: /system_status Response

```
┌─────────────────────────────────────────┐
│ 🤖 @MathMavens_bot                      │
│                                         │
│ System Status — Math Mavens Bot         │
│ ─────────────────────────               │
│ Status:      ✓ Operational              │
│ Uptime:      4d 7h 23m                  │
│ Bot latency: 120ms (Telegram API)       │
│                                         │
│ Active users                            │
│ • Parents:   47 registered, 43 active   │
│ • Teachers:  5 registered, 5 active     │
│ • Admins:    1                          │
│                                         │
│ Message queue                           │
│ • Pending:   0                          │
│ • Failed (last 24h): 0                  │
│                                         │
│ Last checked: 03 Mar 2026, 10:14 AM     │
│ (SGT)                                   │
│                                         │
│ ┌──────────────────┐ ┌───────────────┐ │
│ │     Refresh      │ │     Close     │ │
│ └──────────────────┘ └───────────────┘ │
└─────────────────────────────────────────┘
```

**Notes:**
- Superadmin-only command. Admin attempting this receives T-18.
- Uptime and latency are best-effort estimates from the bot process.
- "Failed (last 24h)" gives a quick health signal without needing to read the full audit log.

---

### T-20: /audit Log Entry

Individual audit log entry format (shown paginated in /audit response):

```
┌─────────────────────────────────────────┐
│ 🤖 @MathMavens_bot                      │
│                                         │
│ Audit Log — Page 1 of N                 │
│ ─────────────────────────               │
│                                         │
│ 1. 03 Mar 2026, 3:47 PM (SGT)           │
│    Type:   Parent → Teacher (relay)     │
│    Student: Lim Wei Ming (P5)           │
│    Status:  Delivered                   │
│                                         │
│ 2. 03 Mar 2026, 3:44 PM (SGT)           │
│    Type:   Teacher → Parent (relay)     │
│    Student: Lim Wei Ming (P5)           │
│    Status:  Delivered                   │
│                                         │
│ 3. 03 Mar 2026, 2:10 PM (SGT)           │
│    Type:   Broadcast                    │
│    Target:  Ms Lim's P5 (18 parents)    │
│    Status:  18/18 delivered             │
│                                         │
│ 4. 03 Mar 2026, 11:02 AM (SGT)          │
│    Type:   DEACTIVATE_USER              │
│    Target:  Tan Siew Lian               │
│    Actor:   Jonathan Tan (Superadmin)   │
│                                         │
│ (Content not stored — metadata only)    │
│                                         │
│ ┌──────────┐ ┌────────────┐ ┌────────┐ │
│ │  ◀ Prev  │ │  Next ▶   │ │ Close  │ │
│ └──────────┘ └────────────┘ └────────┘ │
└─────────────────────────────────────────┘
```

**Notes:**
- 4 entries per page (audit entries are 3–4 lines each).
- Actor field only appears for Superadmin actions (deactivate, reactivate, promote, demote, process_deletion).
- Message relay entries show student context and delivery status, never content.

---

## 5. Command Reference Table

> **Note:** All admin and Superadmin commands below have richer equivalents in the web dashboard (Section 11). Bot commands are the mobile supplement — designed for quick on-the-go actions when a laptop is not available. For day-to-day operational work, Admin and Superadmin should use the dashboard.

### Parent Commands

| Command | Description | When to Use | Example |
|---------|-------------|-------------|---------|
| `/start` | Initiates bot registration (used with deep-link token) | On first open via deep link | `/start PARENT_abc123` |
| `/switch` | Resets active child session; triggers child selector | When wanting to message a different child | `/switch` |
| `/privacy` | Shows data privacy notice and data deletion request option | Any time | `/privacy` |
| `/help` | Shows help message for parents | When unsure how to use the bot | `/help` |

**Parents do not need to type any command to send a message. All message routing is automatic.**

---

### Teacher Commands

| Command | Description | When to Use | Example |
|---------|-------------|-------------|---------|
| `/start` | Initiates bot registration (used with deep-link token) | On first open via deep link | `/start TEACHER_lim_bh_001` |
| `/message` | Initiates a new outbound message to a parent (not a reply) | When proactively contacting a parent | `/message` |
| `/students` | Lists all assigned students with their parent link status | To check roster | `/students` |
| `/help` | Shows teacher-specific help | When unsure how to use the bot | `/help` |

**Replying to a relayed message requires only Telegram's native reply — no command needed.**

---

### Admin Commands (Office Staff — Operational)

These commands are available to users with the Admin role (e.g., Priya). They cover day-to-day mapping management, onboarding, announcements, and roster views.

| Command | Description | Scope | Example |
|---------|-------------|-------|---------|
| `/admin` | Opens Admin menu | Admin + Superadmin | `/admin` |
| `/add_student` | Starts wizard to add a new student mapping | Admin + Superadmin | `/add_student` |
| `/remove_student` | Starts wizard to remove a student mapping | Admin + Superadmin | `/remove_student` |
| `/reassign` | Starts wizard to reassign a student to a different teacher | Admin + Superadmin | `/reassign` |
| `/gen_link` | Generates a new onboarding deep link for a parent or teacher | Admin + Superadmin | `/gen_link` |
| `/broadcast` | Starts broadcast composer | Admin + Superadmin | `/broadcast` |
| `/list_mappings` | Shows paginated list of all active student-teacher-parent mappings | Admin + Superadmin | `/list_mappings` |
| `/list_teachers` | Lists all registered teachers and their student counts | Admin + Superadmin | `/list_teachers` |
| `/list_parents` | Lists all registered parents and their children | Admin + Superadmin | `/list_parents` |
| `/help` | Shows admin-specific help | Admin + Superadmin | `/help` |

---

### Superadmin Commands (God Mode — System Owner)

These commands are restricted to users with the Superadmin role (e.g., Mr. Jonathan Tan). Admin users attempting any of these receive T-18 (permission denied). Superadmin has full access to Admin commands as well.

| Command | Description | Scope | Example |
|---------|-------------|-------|---------|
| `/deactivate` | Deactivates a parent, teacher, or admin account | Superadmin only | `/deactivate` |
| `/reactivate` | Reactivates a previously deactivated account | Superadmin only | `/reactivate` |
| `/promote` | Promotes a registered user to Admin role | Superadmin only | `/promote` |
| `/demote` | Demotes an Admin back to their base role | Superadmin only | `/demote` |
| `/audit` | Shows recent message relay activity log (metadata only, paginated) | Superadmin only | `/audit` |
| `/system_status` | Shows system health, uptime, queue stats, and active user counts | Superadmin only | `/system_status` |
| `/process_deletion` | Lists and processes pending PDPA data deletion requests | Superadmin only | `/process_deletion` |
| `/help` | Shows superadmin help (extended, includes all commands) | Superadmin only | `/help` |

---

### System / Hidden Commands

| Command | Description | Triggered By |
|---------|-------------|--------------|
| `/start <token>` | Deep link entry point for all users | Telegram deep link |
| `/cancel` | Cancels any in-progress multi-step wizard | User during wizard |

---

## 6. Interaction Patterns

### Pattern 1: Confirmation Pattern

Used for any destructive or irreversible action (remove student, deactivate user, reassign teacher, send broadcast).

**Structure:**
1. Show a clear summary of what will happen
2. Two-button choice: Confirm action vs. Cancel
3. On confirm: execute action, show success/failure
4. On cancel: return to menu or state prior to wizard

**Visual Pattern:**
```
┌─────────────────────────────────────────┐
│ [Summary of the action to be taken]     │
│                                         │
│ [Any irreversible consequence noted]    │
│                                         │
│ ┌──────────────────┐ ┌───────────────┐ │
│ │ Confirm [Action] │ │     Cancel    │ │
│ └──────────────────┘ └───────────────┘ │
└─────────────────────────────────────────┘
```

**Rules:**
- Confirm button is always left / first — primary action
- Cancel is always right / second — escape hatch
- Cancel never needs confirmation. One tap = done.
- After cancel: "Cancelled. No changes were made." + relevant menu buttons
- Confirm button label includes the action verb: "Confirm Remove", "Confirm Deactivate", "Send Broadcast"

---

### Pattern 2: Session Selector (Multi-Child)

Used when a parent with multiple children sends a message without an active session context.

**Trigger Conditions:**
- Parent sends first message (no prior session)
- Session timeout (30 minutes of inactivity)
- Parent types /switch

**Structure:**
1. Show brief prompt: "Which child is this message about?"
2. Show one button per child, labelled: "[Name] — [Level]"
3. Hold the original message in a buffer (5-minute TTL)
4. On selection: activate session, release buffered message, send delivery confirmation
5. On timeout (5 min no selection): clear buffer, send timeout notice

**Layout Rules:**
- 1 child per row for 2 children
- 2 per row (side by side) for 3–4 children (test that names fit)
- Always add "Cancel" for 3+ children (in case parent sent accidentally)

**Session Persistence Rules:**
- Session stays active for 30 minutes of inactivity
- Session is explicitly cleared by /switch command
- Session context is shown in delivery confirmations: "✓ Sent to Wei Ming's tutor."
- A session is also implicitly maintained when a teacher replies — the reply flows back to the parent that message came from, regardless of current parent session

---

### Pattern 3: Paginated List

Used for: /list_mappings, teacher student selector with many students, audit log.

**Structure:**
- Show N items per page (recommended: 5 for mappings, 6 for student grids)
- Footer: "Showing X–Y of Z total"
- Navigation: [◀ Prev] [Next ▶] [Close]
- Items in consistent format (Name, Role/Status, one secondary detail)
- Prev is disabled (grayed out or absent) on first page
- Next is disabled (grayed out or absent) on last page

**Page Size Guidelines:**
- Mappings (3 lines each): 3–5 per page
- Student names (short): 6 per page in 3-column grid
- Audit log entries (2 lines each): 4 per page

**Implementation Note:** Telegram does not support disabling inline keyboard buttons. Instead, omit the button entirely if it would be disabled. Replace the blank space with padding text if layout requires it.

---

### Pattern 4: Broadcast Composer

Used for admin broadcasting announcements.

**Stages:**
1. **Audience selection** — who receives the broadcast (all, cohort, individual)
2. **Content input** — free-form message or media (bot waits for any message type)
3. **Preview and confirm** — formatted preview showing audience, content, estimated delivery time
4. **Sending progress** — live counter (or periodic update for very large sends)
5. **Completion report** — delivered count, failed count, time taken

**Abort at any stage:** User types /cancel → "Broadcast cancelled. Nothing was sent."

**Content Constraints:**
- Text messages: shown in full in preview
- Long text (> 200 chars): truncated in preview with "(... and X more characters)"
- Media: shown as "[Photo]", "[Document: filename.pdf]" placeholder in preview
- Combined text + media: both shown

---

### Pattern 5: Error Message Pattern

All error messages follow this structure:

```
[What happened — plain language, one sentence]

[Why it happened — optional, only if it helps the user]

[What to do next — specific action, never "try again" alone]
```

**Examples:**

Good:
```
We couldn't send your message right now.
This may be a temporary issue.
Please try again, or contact admin: @MathMavensAdmin
```

Bad:
```
Error: MESSAGE_DELIVERY_FAILED (code 503)
Retry later.
```

**Error Classification:**
- **User error** (wrong input, expired token): Tell them what was wrong and how to fix it. No apology.
- **System error** (routing failure, API error): Apologize briefly, give admin contact, log for admin alert.
- **Permission error** (unauthorized command): Do not explain why. Just "This command is not available."

---

### Pattern 6: Step-by-Step Wizard

Used for multi-step Admin and Superadmin operations (/add_student, /reassign, /broadcast, /deactivate, /promote, /process_deletion, etc.). The same wizard pattern applies to both roles; authorization checks happen at command entry, not mid-wizard.

**Structure:**
- Each step shows: what step we're on (implicitly via question asked), what was collected so far (brief recap at top if > 2 steps in), the current question or prompt
- Always offer /cancel as an escape
- On final step: show full summary before confirming
- After completion: show success message + relevant next action buttons

**Rules:**
- Never ask more than one question per message
- Free-text inputs: the bot is in a "waiting for input" state — only the cancel command is recognized; any other message is treated as the answer
- Inline keyboard inputs: only the offered buttons advance the flow; free text is ignored with a prompt to tap one of the options

---

### Pattern 7: Permission Escalation

When a user with Admin role attempts a Superadmin-only command, the bot responds with T-18 (permission denied) and directs them to contact the Superadmin. This is a terminal response — no wizard is started.

**Escalation path UX:**
```
Admin attempts Superadmin command
  → Immediate T-18 response (no wizard steps, no prompts)
  → Message: "You don't have permission to use this command.
               Please contact your Superadmin for assistance."
  → No further action. State remains IDLE.
```

**Design rationale:**
- The bot does not explain which role is required — role architecture is internal.
- The Admin's escalation path is clear and actionable (contact Superadmin).
- No retry mechanism from the bot side — the Superadmin can promote the Admin if broader access is genuinely needed.

---

## 7. Notification Design

### 7.1 Delivery Confirmations

**Design Decision: Lightweight Confirmations, Not Read Receipts**

The bot sends a delivery confirmation to the sender (parent or teacher) when a message is successfully relayed. This satisfies Singapore communication norms without creating noise.

The confirmation is:
- Sent as a separate bot message immediately after relay
- One line only: "✓ Message sent to Wei Ming's tutor."
- Does not include timestamp (Telegram shows this on the message itself)
- Does not indicate whether the recipient has read the message (unknown, and promising this would be misleading)

**No delivery confirmation is sent for:**
- Stickers (feels jarring)
- Casual emoji-only messages (optional, can be omitted to reduce noise)

**Read Status:** The bot does not attempt to emulate Telegram's blue tick (read receipt). Teachers are not expected to "mark messages as read" — they reply when they reply. This avoids creating parent anxiety about "has the teacher read this?"

---

### 7.2 System Alerts (Admin and Superadmin)

Operational alerts go to the Admin (Priya). System-level alerts go to the Superadmin (Jonathan). Both receive alerts in their private chat with the bot.

**Admin alerts (operational — sent to Admin):**

| Event | Alert Content | Priority |
|-------|---------------|----------|
| Routing failure | Parent ID, Student ID, Reason, Timestamp | High |
| Bot blocked by user | User name/ID, Direction | Medium |
| Broadcast partially failed | Failed count, names if < 5 | Medium |
| Token expired unused | Student name associated, expiry time | Low |

**Superadmin alerts (system-level — sent to Superadmin):**

| Event | Alert Content | Priority |
|-------|---------------|----------|
| Teacher deactivated with active students | Teacher name, count of affected students | High |
| PDPA data deletion request received | User name, Telegram ID, children, submission time | High |
| Any Superadmin command executed | Action, target, actor, timestamp (audit echo) | Medium |

**Format:** All alerts use T-14 (Admin Alert template) with contextual detail.

Alerts are sent to the designated recipient's private Telegram chat with the bot. If a recipient's chat is unreachable, alerts are logged to server logs. Superadmin alerts are also automatically captured in the /audit log.

---

### 7.3 Future Phase Notifications

**Phase 2 — Attendance:**
```
┌─────────────────────────────────────────┐
│ 📋 Attendance Confirmed — Math Mavens   │
│                                         │
│ Wei Ming attended P5 class today        │
│ 03 Mar 2026, 4:00 PM – 6:00 PM (SGT)   │
│                                         │
│ Marked by: Ms Lim                       │
└─────────────────────────────────────────┘
```

**Phase 3 — Payment:**
```
┌─────────────────────────────────────────┐
│ 💳 Payment Request — Math Mavens        │
│                                         │
│ March 2026 fees for Wei Ming: S$280.00  │
│                                         │
│ ┌─────────────────────────────────┐    │
│ │     Pay with PayNow             │    │
│ └─────────────────────────────────┘    │
│                                         │
│ Due: 10 Mar 2026                        │
└─────────────────────────────────────────┘
```

---

### 7.4 Out-of-Hours Handling (Phase 2 Preview)

In Phase 2, when a parent messages outside configured teacher hours:

```
┌─────────────────────────────────────────┐
│ 🤖 @MathMavens_bot                      │
│                                         │
│ Ms Lim is offline right now.            │
│                                         │
│ Your message has been delivered and     │
│ she'll respond during teaching hours    │
│ (Mon–Sat, 9 AM – 9 PM SGT).            │
│                                         │
│ In the meantime, would you like         │
│ homework help from our AI tutor?        │
│                                         │
│ ┌──────────────────┐ ┌───────────────┐ │
│ │ Get Homework Help│ │   No thanks   │ │
│ └──────────────────┘ └───────────────┘ │
└─────────────────────────────────────────┘
```

MVP note: In MVP, the message is relayed regardless of time. No out-of-hours interception is implemented.

---

## 8. Conversation State Machine

### States

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    CONVERSATION STATE MACHINE                             │
│                                                                          │
│  States:                                                                 │
│  ─────────────────────────────────────────────────────────────────────   │
│  UNKNOWN           — Telegram user; no record in system                  │
│  ONBOARDING        — Has received welcome/consent message; not yet       │
│                      accepted                                            │
│  IDLE              — Registered; no active session or wizard             │
│  SELECTING_CHILD   — Parent: waiting for child session selection         │
│  MESSAGING         — Parent: active child session (messages route        │
│                      directly)                                           │
│  ADMIN_WIZARD      — Admin or Superadmin: inside a multi-step wizard     │
│                      (authorization checked at command entry; same       │
│                       wizard pattern for both roles)                     │
│  AWAITING_MSG      — Teacher/Admin/Superadmin: bot waiting for           │
│                      free-text input                                     │
└──────────────────────────────────────────────────────────────────────────┘
```

Note: ADMIN_WIZARD covers wizard flows for both Admin and Superadmin roles. The bot does not maintain separate state slots per role — authorization is enforced at the command entry point (before the wizard starts), not as a mid-wizard state. A Superadmin executing /deactivate and an Admin executing /add_student are both in ADMIN_WIZARD state; the difference is which commands were permitted to enter that state.

### State Diagram

```
                    ┌─────────────────┐
                    │    UNKNOWN      │◄─── Any unregistered user messages
                    └────────┬────────┘
                             │ /start <token>
                             ▼
                    ┌─────────────────┐
                    │   ONBOARDING    │
                    └────────┬────────┘
                             │ Consent accepted
                             │ (token valid, record created)
                             ▼
            ┌────────────────────────────────┐
            │             IDLE               │◄───────────────────┐
            │  (registered, no active action) │                    │
            └─────┬──────────────────────┬───┘                    │
                  │                      │                        │
       Parent     │               Admin  │                        │
       sends msg  │            /admin or │                        │
      (multi-child│            command   │           /cancel      │
        case)     │                      │           or timeout   │
                  ▼                      ▼                        │
       ┌──────────────────┐  ┌───────────────────────┐           │
       │  SELECTING_CHILD │  │     ADMIN_WIZARD       │──────────►│
       └────────┬─────────┘  └───────────────────────┘           │
                │                                                  │
       Child    │                                                  │
       selected │                                                  │
                ▼                                                  │
       ┌──────────────────┐                                        │
       │    MESSAGING     │                                        │
       │ (session active) │                                        │
       └─────┬─────┬──────┘                                        │
             │     │                                               │
      /switch│     │ Timeout (30min)                               │
             │     │                                               │
             ▼     ▼                                               │
       ┌──────────────────┐                                        │
       │  SELECTING_CHILD │──────────────────────────────────────►│
       └──────────────────┘   (after selection, returns to        │
                               MESSAGING or IDLE if cancelled)    │
                                                                   │
         AWAITING_MSG state:                                       │
         Applies to admin wizard steps and teacher /message flow. │
         Any non-command message = answer to current wizard step. │
         /cancel = return to IDLE ──────────────────────────────►│
```

### State Definitions

**UNKNOWN**
- Trigger: Any message from an unregistered Telegram user ID
- Response: T-11-variant (registration prompt)
- Transitions: → ONBOARDING (via /start with valid token)
- Timeout: None (stateless)

**ONBOARDING**
- Trigger: /start with valid, unredeemed token
- Response: T-01 (PDPA consent message)
- Transitions:
  - → IDLE: User taps "I Agree" (consent recorded, registration complete)
  - → ONBOARDING: User taps "I Need More Info" (stays in onboarding, shows detail)
  - → UNKNOWN: User taps "Not Now" or timeout (no record created)
- Timeout: 30 minutes. If no consent given, state clears. Token remains valid (can retry).

**IDLE**
- Trigger: Registered user; no active wizard or session
- Response: For unknown input, send /help hint
- Transitions:
  - Parent with 1 child sends message → MESSAGING (direct, no selector needed)
  - Parent with 2+ children sends message → SELECTING_CHILD
  - Parent types /switch → SELECTING_CHILD
  - Teacher sends new message (non-reply) → AWAITING_MSG (student selector)
  - Admin types any permitted admin command → ADMIN_WIZARD
  - Admin types a Superadmin-only command → IDLE (T-18 permission denied; no state change)
  - Superadmin types any command (admin or superadmin) → ADMIN_WIZARD
- Timeout: N/A (IDLE is the resting state)

**SELECTING_CHILD**
- Trigger: Parent with multiple children sends message without active session
- Response: T-05 (child selector inline keyboard); message buffered
- Buffer TTL: 5 minutes
- Transitions:
  - User taps child button → MESSAGING (session set, buffered message released)
  - Buffer TTL expires → IDLE (buffer cleared, timeout message sent)
  - User types /cancel → IDLE (buffer cleared, cancellation message sent)
- Timeout message: "Your session timed out. No message was sent. Type your message again when ready."

**MESSAGING**
- Trigger: Parent with active child session sends any message or media
- Response: Route message via copyMessage; send delivery confirmation T-06
- Transitions:
  - Parent types /switch → SELECTING_CHILD (session cleared)
  - Session inactivity > 30 minutes → IDLE (silent reset; next message re-triggers selector if multi-child)
  - Parent sends message to different-child topic (Phase 2 AI detection) → SELECTING_CHILD
- Timeout: 30 minutes inactivity → silent IDLE reset. No message sent to user.

**ADMIN_WIZARD**
- Trigger: Admin or Superadmin invokes any multi-step command (Admin: operational commands; Superadmin: operational + system-level commands). Unauthorized command attempts from Admin do not enter this state — they receive T-18 and return to IDLE immediately.
- Response: Step-by-step prompts (see Pattern 6)
- Transitions:
  - Wizard completion (confirm) → IDLE
  - User types /cancel at any step → IDLE
  - Wizard timeout (10 minutes inactivity mid-wizard) → IDLE
- Timeout message: "Your admin session timed out. No changes were made. Type /admin to start again."

**AWAITING_MSG**
- Trigger: System is waiting for a free-text response from user (inside wizard or teacher outbound message flow)
- Behavior: Any non-command input is treated as the answer. Commands other than /cancel are ignored with a prompt to complete or cancel the current action.
- Transitions:
  - User provides valid input → next wizard step or IDLE (on last step)
  - User types /cancel → IDLE

### Timeout Summary

| State | Timeout | Behavior |
|-------|---------|----------|
| ONBOARDING | 30 minutes | State clears; token still valid for retry |
| SELECTING_CHILD | 5 minutes | Buffer cleared; timeout notice sent |
| MESSAGING (session) | 30 minutes | Silent IDLE reset; no message to user |
| ADMIN_WIZARD | 10 minutes | IDLE reset; "timed out" notice sent |
| AWAITING_MSG | 10 minutes | IDLE reset; "timed out" notice sent |

---

## 9. Multi-Language Considerations

### 9.1 English as Primary Language

All bot messages in MVP are in English. This is the appropriate default for Singapore because:
- English is the medium of instruction in Singapore schools, including math tuition
- Business communication in Singapore is predominantly English
- The product brief does not specify Mandarin-interface requirement for MVP
- Building multi-language bot responses at MVP stage adds significant complexity for uncertain incremental benefit

The bot can and does handle messages in any language from users — message routing is language-agnostic (copyMessage passes through whatever the user typed).

### 9.2 Singlish and Code-Switching

Singapore parents routinely mix English, Mandarin, Malay, and Tamil in the same message. This is culturally normal, not an error condition.

**Design Response:** The bot treats all parent and teacher messages as opaque payloads. It does not parse, translate, or alter the content of user messages. Singlish like "Wei Ming cannot understand lah, help or not?" is copied verbatim to the teacher. The bot has no NLP processing of message content in MVP.

**Implication for error messages:** Bot-generated error messages (not user messages) should use clear, simple English that reads well even for users whose first language is not English. Avoid idioms, contractions that could be confusing, and long sentences.

**Good:** "Your message has been sent." (Universal)
**Risky:** "Done! We've shot that off to the tutor." (Too idiomatic)

### 9.3 Bot Interface Language — Future Phases

**Phase 2 recommendation (not MVP):**

If Mandarin bot responses are added, the implementation approach should be:
1. At onboarding, add a language preference selection (English / 中文)
2. Store `preferred_language` on the user record
3. All bot-generated text messages are selected from a translated string table
4. User-generated messages continue to be passed through as-is (no translation)

**Singlish-specific note for AI phase:** When OpenClaw is integrated (Phase 2), the AI prompt context should include explicit guidance to understand and respond naturally to Singapore English, Singlish, and common Chinese educational vocabulary (e.g., PSLE, CA1, SA2, assessment book vs. textbook). This is a prompt-engineering task, not a language infrastructure task.

### 9.4 Student Name Handling

Singapore names are diverse: Chinese (two-character family name + given name), Indian (father's name + given name), Malay (given name + bin/binti + father's name), Western (first + last). The student name header (T-04) should display the student's name exactly as entered by admin — no reformatting, no reversal, no truncation. Admin should enter names in the display format they prefer.

---

## 10. Privacy UX

### 10.1 PDPA Consent Flow Design

The consent UX is governed by two constraints:
1. PDPA requires informed, voluntary, specific consent before data collection begins
2. The user must not feel manipulated or alarmed — excessive legalese will reduce consent rates and damage trust

**Design Approach: Layered Disclosure**

- **Layer 1 (Inline — T-01):** Simple plain-English summary in the welcome message. Two buttons: "I Agree — Let's Go" and "I Need More Info."
- **Layer 2 (On Request — T-01 branch):** More detailed but still human-readable explanation of what, why, and how long. Accessible before consent is given.
- **Layer 3 (Always Available — /privacy command):** Full PDPA disclosure available any time post-registration. Includes data deletion request mechanism.

The consent text is not a legal disclaimer. It is a plain-language summary written for a parent who is about to use a messaging bot, not a lawyer reviewing a contract. Legal language lives in Math Mavens' formal Privacy Notice (hosted on their website), which the /privacy command links to.

### 10.2 What Users See When Data Is Collected

At the point of each data collection event, the user sees:

| Event | What User Sees |
|-------|----------------|
| Onboarding consent | T-01 — full consent message before any data is stored |
| Session selection | Child selector only — no data notice (this is normal bot operation, not new data collection) |
| Broadcasting (parent receives) | Just the message — no data notice |
| Admin adds student mapping | No user-facing message — admin action; user's data notice is at their onboarding |

**No dark patterns:**
- Consent button is not pre-selected
- "I Need More Info" is equally prominent as "I Agree"
- "Not Now" is a real option that stops the process
- Consent is not bundled with other terms (no "I agree to T&C and Privacy Policy" bundling)

### 10.3 Data Deletion Request (/privacy command)

```
[User] Types /privacy

[Bot]  ┌─────────────────────────────────────────┐
       │ Your Privacy at Math Mavens             │
       │ ─────────────────────────               │
       │ What we hold about you:                 │
       │ • Your Telegram ID (internal use only)  │
       │ • Your Telegram display name            │
       │ • Your linked child's enrollment        │
       │ • Consent record (date/time you agreed) │
       │ • Message relay metadata (timestamps,   │
       │   direction — content not stored)       │
       │                                         │
       │ We do NOT store:                        │
       │ • Your message content                  │
       │ • Your phone number                     │
       │ • Your tutor's identity (to you)        │
       │                                         │
       │ To request data deletion:               │
       └─────────────────────────────────────────┘
       ┌─────────────────────────────────────────┐
       │    Request Data Deletion                │
       └─────────────────────────────────────────┘
       ┌─────────────────────────────────────────┐
       │    View Full Privacy Notice (web)       │
       └─────────────────────────────────────────┘
```

If user taps "Request Data Deletion":

```
[Bot]  ┌─────────────────────────────────────────┐
       │ Data Deletion Request                   │
       │                                         │
       │ Requesting deletion will:               │
       │ • Remove your Telegram ID and name      │
       │ • Deactivate your account               │
       │ • Remove your children's routing        │
       │   (they will no longer be able to       │
       │    message tutors through this bot)     │
       │                                         │
       │ Note: Audit trail metadata may be       │
       │ retained for up to 2 years as required  │
       │ by PDPA compliance obligations.         │
       │                                         │
       │ Confirm deletion request?               │
       └─────────────────────────────────────────┘
       ┌──────────────────┐ ┌───────────────────┐
       │  Yes, Delete     │ │      Cancel       │
       └──────────────────┘ └───────────────────┘
```

On confirm:

```
[Bot]  ┌─────────────────────────────────────────┐
       │ Your deletion request has been          │
       │ submitted to Math Mavens.               │
       │                                         │
       │ We will process this within 10 business │
       │ days and confirm via this chat.         │
       │                                         │
       │ Once processed, this bot will no longer │
       │ work for you.                           │
       └─────────────────────────────────────────┘

[Superadmin Alert]:
⚠️ Superadmin Alert
Data deletion request received.
User: Tan Siew Lian
Telegram ID: [ID]
Children: Lim Wei Ming, Lim Jia Hui
Submitted: 03 Mar 2026, 3:47 PM (SGT)
Action: Review and process within 10 business days via /process_deletion
```

Note: Deletion is not immediate — it is a two-step request workflow. The parent's /privacy command submits a REQUEST. The actual data erasure is performed by the Superadmin using /process_deletion (see Section 3G). The Admin role does not have access to /process_deletion; this ensures all PII erasure actions are attributable to a named Superadmin and logged in the audit trail. Full automation of deletion can be implemented in a future phase with appropriate safeguards.

### 10.4 What Metadata Is Visible vs. Hidden

| Data Point | Parent | Teacher | Admin | Superadmin |
|------------|--------|---------|-------|------------|
| Parent Telegram ID | Own only (implicit) | Hidden | Visible | Visible |
| Parent Telegram display name | Own only (implicit) | Hidden | Visible | Visible |
| Teacher Telegram ID | Hidden | Own only (implicit) | Visible | Visible |
| Teacher Telegram display name | Shown as "Wei Ming's tutor" only | Own only | Visible | Visible |
| Student name | Own children only | Assigned students only | Visible | Visible |
| Message content | Own messages (via Telegram) | Own messages (via Telegram) | Not stored | Not stored |
| Message timestamp | Own messages (native Telegram) | Own messages (native Telegram) | Not stored | Relay metadata timestamp only |
| Message direction (metadata only) | Hidden | Hidden | Hidden | Visible (audit log) |
| Consent timestamp | Accessible via /privacy | N/A | Visible | Visible |
| Deactivation / lifecycle actions | Hidden | Hidden | Hidden | Visible (audit log, with actor) |
| Audit log (relay metadata) | Hidden | Hidden | Hidden | Visible via /audit |
| System health / queue stats | Hidden | Hidden | Hidden | Visible via /system_status |

### 10.5 Anonymity Architecture — UX Communication

The bot's proxy nature is a feature, not a secret. But how it communicates this matters.

**What we tell parents:** "Your personal contact details stay private, and so do your tutor's." (Accurate, positive framing)

**What we do NOT do:**
- Claim the bot is a human
- Reveal the teacher's Telegram handle or username in any message
- Include message metadata that could be reverse-engineered to identify the teacher
- Use "Forwarded from [username]" — `copyMessage` eliminates this by design

**Teacher anonymity toward parents:**
- Bot never uses teacher names in messages to parents
- Delivery confirmations say "Wei Ming's tutor", not "Ms Lim"
- If a teacher accidentally includes their name in a message, the system cannot and does not redact it — this is a policy/training concern, documented in teacher onboarding

**Parent anonymity toward teachers:**
- Bot never uses parent names in injected headers
- The header shows only student context: `📌 [Wei Ming — P5]`
- Teachers know a message is "from Wei Ming's parent" but not the parent's name or Telegram identity
- Admin can see parent identities for operational purposes; teachers cannot

---

## 11. Web Dashboard UX

### 11.1 Dashboard Scope and Relationship to Bot

The web dashboard is the **primary operational interface** for Admin and Superadmin. It is where Priya manages the day-to-day running of the Math Mavens communication system from her office computer, and where Jonathan maintains governance and oversight.

**Dashboard branding:** The web dashboard is **Conduit-branded**. The Conduit logo appears on the login page and in the dashboard chrome (header/sidebar). The tuition center name ("Math Mavens") is displayed as the active tenant context within the dashboard after login — in the sidebar header or a tenant badge — so staff know which center they are operating. End users (parents, teachers) never interact with the dashboard and never see the Conduit brand; they only see @MathMavens_bot.

The Telegram bot serves two distinct roles:
1. **Messaging relay** — the interface for parents and teachers to communicate. This is the bot's core function and is unaffected by the existence of the dashboard.
2. **Mobile supplement for Admin/Superadmin** — a lightweight fallback for quick actions on the go when the dashboard is not accessible.

These two interfaces share the same backend and the same database. There is no sync delay and no separate data store. When Priya adds a student mapping in the dashboard, that student's parent can immediately send messages through the bot. When a parent onboards via the bot, the Students table in the dashboard updates in real time. The system is one system — the interface is just contextual to who is using it and where they are.

**Division of responsibility:**

| Interface | Primary Users | Primary Context |
|-----------|---------------|-----------------|
| Telegram Bot | Parents, Teachers | Mobile messaging — natural, frictionless, no account required beyond Telegram |
| Web Dashboard | Admin, Superadmin | Desktop operations — management, oversight, compliance |
| Bot (admin commands) | Admin, Superadmin | Mobile supplement — quick actions when away from desk |

Detailed web wireframes and component specifications belong in a separate dashboard design document. This section defines the conceptual structure, screen inventory, navigation, and relationship to bot commands at a level sufficient for implementation planning and alignment.

---

### 11.2 Authentication

The web dashboard uses its own authentication system, separate from Telegram identity.

**Branding on the login page:**
The login page displays the **Conduit** logo and name — it is the platform's authentication gateway, not a Math Mavens-branded page. Once authenticated, the dashboard shows the tuition center's name (e.g., "Math Mavens") prominently in the header and sidebar, so the internal operational experience is customer-contextualised. The Conduit branding at login reflects that the platform is the product; the customer context appears after login.

**Login mechanism:**
- Email and password login
- Session-based authentication with secure, HTTP-only cookies
- No public registration — all Admin and Superadmin accounts are provisioned by the Superadmin

**Account provisioning:**
- The Superadmin creates Admin accounts via the User Management screen
- New admins receive an invitation email with a one-time link to set their password
- The Superadmin account itself is seeded at system setup (not self-registered)

**Session management:**
- Sessions expire after a configurable idle timeout (default: 60 minutes; configurable in Settings)
- Re-authentication is required after session expiry
- Concurrent sessions from different devices are permitted

**Security constraints:**
- Dashboard is not accessible without valid session credentials
- Role-based access control: Admin and Superadmin see different screens and controls (see Section 11.4)
- Dashboard authentication is independent of the bot — a user can be an Admin in the dashboard without having a Telegram account linked to the bot's admin role list (though in practice, the same person will hold both)

---

### 11.3 Screen Inventory

The following screens make up the web dashboard. Screens marked "Admin +" are visible to both Admin and Superadmin. Screens marked "Superadmin only" are hidden from the Admin role entirely.

#### Dashboard Home (Admin +)

The landing screen after login. Provides an at-a-glance operational overview.

Key elements:
- Summary stat cards: total active students, total teachers, total registered parents, messages relayed today, pending onboarding tokens
- Quick action shortcuts: Generate Token, Compose Broadcast
- Recent activity feed: last 5–10 system events (onboardings, broadcasts, routing failures) — clickable to relevant detail screens
- Alert banner if any routing failures have occurred in the last 24 hours

#### Students (Admin +)

The primary data management screen. A table view of all students in the system.

Key elements:
- Searchable, sortable, filterable table: columns include student name, grade level, assigned teacher, linked parent(s), onboarding status, active/inactive status
- Row-level actions: Edit, Reassign Teacher, Deactivate, Generate Parent Token
- Add Student button: opens a form to create a new student record (equivalent to /add_student wizard in the bot)
- Bulk actions: select multiple rows → Deactivate, Export to CSV
- Pagination with configurable page size
- Filter panel: by grade level, by teacher, by onboarding status, by active status

#### Mappings (Admin +)

A focused view of the student-teacher-parent relationship graph.

Key elements:
- Table or card view showing each active mapping: student → teacher → parent(s)
- Inline reassignment: drag-and-drop a student card to a different teacher column, or use a form-based reassign modal
- Mapping status indicators: Active, Parent Not Yet Onboarded, Deactivated
- Filter by teacher to see one teacher's full student roster
- Clicking a mapping opens a detail panel with full history (when was the mapping created, any previous teacher assignments)

#### Onboarding (Admin +)

Token management screen. Priya uses this to generate parent and teacher onboarding links and track their status.

Key elements:
- Token list table: columns include associated student/teacher, token type (Parent/Teacher), created date, expiry date, status (Pending / Used / Expired)
- Generate Token button: form to create a new token linked to a student or teacher record — generates a deep link URL, shown with a one-click copy button
- Expired token cleanup: bulk-delete expired, unused tokens
- Filter by status: show only Pending, only Used, only Expired
- Token detail: clicking a token row shows the associated deep link and allows re-sending (generating a new token if the original has expired)

#### Broadcast (Admin +)

The broadcast composition and history screen. Richer than the bot's /broadcast wizard — supports formatting, audience preview, and delivery tracking.

Key elements:
- Compose panel: audience selector (All Parents / All Teachers / Specific Cohort / Individual), message text area with basic formatting (bold, line breaks), optional media attachment
- Audience preview: shows a count and list of recipients before sending ("18 parents in Ms Lim's P5 class")
- Send with confirmation dialog
- Broadcast history table: past broadcasts with date, audience, delivered count, failed count — clickable to detail
- Detail view per broadcast: per-recipient delivery status (delivered / failed / blocked), with option to retry failed sends

#### Teachers (Admin +)

A read-focused view of all registered teachers.

Key elements:
- Table: teacher name, email (if stored), student count, classes assigned, onboarding status, active/inactive
- Row-level action: Deactivate teacher (marks teacher inactive; triggers routing failure for their students — Admin is warned)
- Generate Teacher Token button per row (if teacher is not yet onboarded)
- Clicking a teacher row shows their full student roster

#### Parents (Admin +)

A read-focused view of all registered parents.

Key elements:
- Table: parent name (Telegram display name), linked children, onboarding date, last active, status
- Filter by onboarding status: Onboarded / Pending / Deactivated
- Clicking a parent row shows their children and the communication history (relay event count — not content)
- No message content is displayed anywhere in the dashboard (content is not stored)

#### User Management (Superadmin only)

The screen for managing admin accounts and Telegram-bot role assignments.

Key elements:
- Table of all Admin and Superadmin accounts: name, email, role, created date, last login, status
- Actions: Promote to Admin, Demote to base role, Deactivate Account, Reactivate Account
- Invite New Admin form: enter email → sends invitation → new admin sets password via invite link
- Role change and deactivation actions all require a confirmation dialog
- All actions written to the audit log with actor attribution

#### Audit Log (Superadmin only)

A searchable, filterable record of all system events — relay metadata and administrative actions.

Key elements:
- Table: timestamp, event type (Parent→Teacher relay / Teacher→Parent relay / Broadcast / Admin action / System event), actor (for admin actions), target (student/user), status
- Search: free-text search across actor, target, and event type fields
- Filters: date range picker, event type multi-select, actor filter, direction filter (inbound/outbound/admin/system)
- No message content is shown — metadata only (PDPA compliance by design)
- Export to CSV for compliance reporting

#### System Status (Superadmin only)

Real-time health monitoring for the bot infrastructure.

Key elements:
- Status indicator: Operational / Degraded / Outage with last-checked timestamp
- Uptime counter
- Bot API latency (current and 24h average)
- Message queue stats: pending, processing, failed (last 24h)
- Active sessions count (registered users who have interacted in the last 30 minutes)
- Error rate chart (last 24h, hourly buckets)
- Recent error log (last 10 errors, with type and timestamp)
- Manual refresh button; auto-refresh every 60 seconds

#### PDPA Requests (Superadmin only)

The managed queue for data deletion requests submitted by users via the bot's /privacy command.

Key elements:
- Request queue table: user name, Telegram ID, linked children, request submission date, days elapsed, status (Pending / Processing / Completed / Rejected)
- Processing workflow: click a request → review data to be deleted → confirm deletion → system erases PII and updates status
- Reject option: with a required reason field (reason is logged, not sent to user)
- SLA indicator: requests older than 8 business days are highlighted (approaching the 10-business-day PDPA deadline)
- Completed requests remain in the table for audit purposes, marked as Completed with processed_by and processed_at

#### Settings (Superadmin only)

System configuration panel.

Key elements:
- Business hours configuration (used for Phase 2 out-of-hours handling; stored but not enforced in MVP)
- Session timeout setting (default: 60 minutes for dashboard sessions)
- Rate limit configuration (messages per second per chat for broadcasts)
- Bot token and webhook status (read-only display; not editable in the UI — handled at deployment level)
- Admin account management shortcuts (link to User Management)

---

### 11.4 Navigation Structure

The dashboard uses a **persistent sidebar navigation** with role-based visibility. The sidebar is present on all screens after login.

**Admin sidebar items:**
- Dashboard (home)
- Students
- Mappings
- Onboarding
- Broadcast
- Teachers
- Parents

**Superadmin sidebar items (all Admin items plus):**
- User Management
- Audit Log
- System Status
- PDPA Requests
- Settings

Items only available to Superadmin are hidden from the Admin view entirely — they do not appear as locked or greyed out. Role architecture is not exposed to Admin users in the UI.

The sidebar shows the currently active screen with a visual active state. A persistent header shows the logged-in user's name and role, and a logout link.

---

### 11.5 Key Interaction Patterns

The dashboard follows standard SaaS data management conventions. The following patterns apply consistently across all screens.

**Data tables:**
- Search input above the table (searches across visible columns by default)
- Column headers are sortable (click to sort ascending/descending)
- Filter panel (collapsible) for multi-criteria filtering
- Pagination with configurable page size (10 / 25 / 50 per page)
- Row count indicator: "Showing 1–25 of 42 results"

**Inline editing:**
- Single-field changes (e.g., correcting a student name, updating a grade level) can be done inline without opening a modal — click the field to edit, press Enter to save or Escape to cancel
- Complex multi-field operations (adding a student, reassigning a teacher) use a modal form or a dedicated wizard panel

**Bulk actions:**
- Checkboxes on table rows enable multi-select
- A contextual action bar appears at the top of the table when rows are selected: "3 selected — [Deactivate] [Export] [Clear selection]"
- Bulk destructive actions (bulk deactivate) require a confirmation dialog that states the count and consequences

**CSV import:**
- Available on the Students screen for batch onboarding
- Import accepts a CSV with defined columns: student name, grade level, teacher name, parent name, enrollment ID
- Import preview step: shows parsed rows before committing, flags rows with validation errors
- Partial imports are supported: valid rows are imported, invalid rows are reported and skipped

**CSV export:**
- Available on Students, Mappings, Audit Log, and Broadcast History screens
- Exports the current filtered view (not the entire dataset if filters are active)
- Export button in the toolbar; triggers download immediately (no email delivery)

**Confirmation dialogs:**
- All destructive or irreversible actions use a modal confirmation dialog
- Dialog states the action, the target, and the consequence
- Confirm button uses the action verb: "Deactivate", "Delete", "Demote" — not a generic "OK"
- Cancel is always available and always the safe exit

**Toast notifications:**
- Success and error feedback delivered as non-blocking toast messages (top-right corner)
- Success: green, auto-dismisses after 4 seconds. "Student mapping created."
- Error: red, persistent until dismissed. "Failed to generate token. Please try again."
- Warning: amber, auto-dismisses after 6 seconds. "Broadcast sent with 2 failures. View details."

**Real-time updates:**
- The Students table, Mappings screen, and Onboarding token list update in real time when changes occur (e.g., a parent completes onboarding, a token is consumed)
- Real-time updates are delivered via WebSocket or server-sent events — no manual refresh required
- A subtle "updated just now" indicator appears on rows that have changed since page load

---

### 11.6 Relationship to Bot Commands

The table below maps each administrative operation to its availability in the dashboard and as a bot command. The dashboard is the primary interface for all operations; bot commands are the mobile supplement.

| Operation | Dashboard | Bot Command |
|-----------|-----------|-------------|
| Add student mapping | Primary (form with validation) | `/add_student` (wizard) |
| Edit student record | Primary (inline or modal) | Not available |
| Remove/deactivate student | Primary (table row action) | `/remove_student` (wizard) |
| Reassign student to teacher | Primary (drag-and-drop or form) | `/reassign` (wizard) |
| Bulk import students | Dashboard only (CSV import) | Not available |
| Generate onboarding token | Primary (one-click, copy button) | `/gen_link` |
| View token status | Primary (Onboarding table) | Not available |
| Send broadcast | Primary (rich composer, preview, delivery tracking) | `/broadcast` (text only) |
| View broadcast history | Primary (Broadcast screen) | Not available |
| View student mappings | Primary (searchable, sortable table) | `/list_mappings` (paginated) |
| View teachers | Primary (Teachers screen) | `/list_teachers` (paginated) |
| View parents | Primary (Parents screen) | `/list_parents` (paginated) |
| Promote/demote admin | Primary (User Management) | `/promote`, `/demote` |
| Deactivate/reactivate user | Primary (User Management) | `/deactivate`, `/reactivate` |
| View audit log | Primary (searchable, filterable, exportable) | `/audit` (paginated snapshot, Superadmin) |
| System health check | Primary (real-time System Status screen) | `/system_status` (snapshot) |
| Process PDPA deletion | Primary (PDPA Requests queue with workflow) | `/process_deletion` |
| Configure system settings | Dashboard only (Settings screen) | Not available |

Bot commands that have no dashboard equivalent (e.g., `/start`, `/privacy`, `/switch`, `/help`) are user-facing commands for parents and teachers — they are not administrative operations and do not belong in the dashboard.

---

*Document prepared by BMAD UX Designer. This document supersedes any prior informal UX assumptions. All flows are designed against the Conduit Product Brief (2026-03-03) for the Math Mavens customer deployment and Singapore PDPA requirements. Implementation team should reference this document alongside the architecture and story mapping documents.*

*Next: Architecture Review and Story Mapping should cross-reference these flows to ensure all state transitions and error cases are captured in development stories.*
