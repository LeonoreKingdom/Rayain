import { integer, index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const invitationStatuses = ["draft", "published"] as const;
export const invitationTypes = [
  "wedding",
  "birthday",
  "anniversary",
  "engagement",
  "other",
] as const;
export const userStatuses = ["active", "blocked", "invited"] as const;
export const userRoles = ["owner", "editor", "admin"] as const;
export const contentStatuses = ["draft", "published", "archived"] as const;

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    whatsapp: text("whatsapp"),
    passwordHash: text("password_hash"),
    role: text("role", { enum: userRoles }).notNull().default("owner"),
    status: text("status", { enum: userStatuses }).notNull().default("active"),
    lastLoginAt: integer("last_login_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    index("users_status_idx").on(table.status),
    index("users_role_idx").on(table.role),
  ],
);

export const resetTokens = sqliteTable(
  "reset_tokens",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    usedAt: integer("used_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    index("reset_tokens_user_id_idx").on(table.userId),
    index("reset_tokens_expires_at_idx").on(table.expiresAt),
  ],
);

export const authSessions = sqliteTable(
  "auth_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    lastUsedAt: integer("last_used_at", { mode: "timestamp_ms" }),
    revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    index("auth_sessions_user_id_idx").on(table.userId),
    index("auth_sessions_expires_at_idx").on(table.expiresAt),
    index("auth_sessions_revoked_at_idx").on(table.revokedAt),
  ],
);

export const content = sqliteTable(
  "content",
  {
    id: text("id").primaryKey(),
    contentKey: text("content_key").notNull().unique(),
    section: text("section").notNull().default("general"),
    title: text("title").notNull(),
    payload: text("payload").notNull().default("{}"),
    status: text("status", { enum: contentStatuses })
      .notNull()
      .default("draft"),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    index("content_status_idx").on(table.status),
    index("content_section_idx").on(table.section),
  ],
);

export const templates = sqliteTable(
  "templates",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    eventType: text("event_type", { enum: invitationTypes }).notNull(),
    thumbnailUrl: text("thumbnail_url"),
    defaultDesign: text("default_design").notNull().default("{}"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    index("templates_event_type_idx").on(table.eventType),
    index("templates_active_idx").on(table.isActive),
  ],
);

export const music = sqliteTable(
  "music",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    artist: text("artist").notNull(),
    mood: text("mood").notNull().default("Romantic & warm"),
    duration: text("duration").notNull().default("00:00"),
    audioUrl: text("audio_url"),
    previewUrl: text("preview_url"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    index("music_active_idx").on(table.isActive),
    index("music_title_idx").on(table.title),
  ],
);

export const guests = sqliteTable(
  "guests",
  {
    id: text("id").primaryKey(),
    invitationId: text("invitation_id").notNull(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    groupName: text("group_name").notNull().default("Lainnya"),
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    index("guests_invitation_id_idx").on(table.invitationId),
    index("guests_phone_idx").on(table.phone),
  ],
);

export const blastStatuses = [
  "draft",
  "scheduled",
  "sending",
  "completed",
  "cancelled",
  "failed",
] as const;
export const blastLogStatuses = ["queued", "sent", "failed"] as const;

export const blasts = sqliteTable(
  "blasts",
  {
    id: text("id").primaryKey(),
    invitationId: text("invitation_id").notNull(),
    channel: text("channel").notNull().default("whatsapp"),
    message: text("message").notNull(),
    status: text("status", { enum: blastStatuses }).notNull().default("draft"),
    scheduledAt: integer("scheduled_at", { mode: "timestamp_ms" }),
    startedAt: integer("started_at", { mode: "timestamp_ms" }),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
    totalRecipients: integer("total_recipients").notNull().default(0),
    sentCount: integer("sent_count").notNull().default(0),
    failedCount: integer("failed_count").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    index("blasts_invitation_id_idx").on(table.invitationId),
    index("blasts_status_idx").on(table.status),
    index("blasts_scheduled_at_idx").on(table.scheduledAt),
  ],
);

export const blastLogs = sqliteTable(
  "blast_logs",
  {
    id: text("id").primaryKey(),
    blastId: text("blast_id").notNull(),
    guestId: text("guest_id"),
    recipientName: text("recipient_name").notNull(),
    recipientPhone: text("recipient_phone").notNull(),
    status: text("status", { enum: blastLogStatuses })
      .notNull()
      .default("queued"),
    errorMessage: text("error_message"),
    sentAt: integer("sent_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    index("blast_logs_blast_id_idx").on(table.blastId),
    index("blast_logs_guest_id_idx").on(table.guestId),
    index("blast_logs_status_idx").on(table.status),
  ],
);

export const rsvpStatuses = ["attending", "declined", "maybe"] as const;
export const notificationTypes = ["rsvp", "blast", "system"] as const;

export const rsvps = sqliteTable(
  "rsvps",
  {
    id: text("id").primaryKey(),
    invitationId: text("invitation_id").notNull(),
    guestId: text("guest_id"),
    name: text("name").notNull(),
    phone: text("phone"),
    status: text("status", { enum: rsvpStatuses }).notNull().default("maybe"),
    partySize: integer("party_size").notNull().default(1),
    message: text("message"),
    respondedAt: integer("responded_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    index("rsvps_invitation_id_idx").on(table.invitationId),
    index("rsvps_guest_id_idx").on(table.guestId),
    index("rsvps_status_idx").on(table.status),
  ],
);

export const notifications = sqliteTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id"),
    invitationId: text("invitation_id"),
    rsvpId: text("rsvp_id"),
    type: text("type", { enum: notificationTypes }).notNull().default("system"),
    title: text("title").notNull(),
    body: text("body").notNull(),
    isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
    readAt: integer("read_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    index("notifications_user_id_idx").on(table.userId),
    index("notifications_invitation_id_idx").on(table.invitationId),
    index("notifications_is_read_idx").on(table.isRead),
  ],
);

export const invitations = sqliteTable(
  "invitations",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    userId: text("user_id"),
    templateId: text("template_id"),
    musicId: text("music_id"),
    title: text("title").notNull(),
    eventType: text("event_type", { enum: invitationTypes }).notNull(),
    eventDate: text("event_date").notNull(),
    eventTime: text("event_time").notNull(),
    location: text("location").notNull(),
    message: text("message").notNull(),
    content: text("content").notNull().default("{}"),
    designData: text("design_data").notNull().default("{}"),
    rsvpOptions: text("rsvp_options").notNull().default("{}"),
    musicAutoplay: integer("music_autoplay", { mode: "boolean" })
      .notNull()
      .default(false),
    template: text("template").notNull().default("soft-promise"),
    color: text("color").notNull().default("blush"),
    font: text("font").notNull().default("serif"),
    photo: text("photo").notNull().default("none"),
    layout: text("layout").notNull().default("classic"),
    status: text("status", { enum: invitationStatuses })
      .notNull()
      .default("draft"),
    guestCount: integer("guest_count").notNull().default(0),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    index("invitations_user_id_idx").on(table.userId),
    index("invitations_status_idx").on(table.status),
    index("invitations_event_date_idx").on(table.eventDate),
  ],
);

export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ResetToken = typeof resetTokens.$inferSelect;
export type NewResetToken = typeof resetTokens.$inferInsert;
export type AuthSession = typeof authSessions.$inferSelect;
export type NewAuthSession = typeof authSessions.$inferInsert;
export type Content = typeof content.$inferSelect;
export type NewContent = typeof content.$inferInsert;
export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;
export type Music = typeof music.$inferSelect;
export type NewMusic = typeof music.$inferInsert;
export type Guest = typeof guests.$inferSelect;
export type NewGuest = typeof guests.$inferInsert;
export type Blast = typeof blasts.$inferSelect;
export type NewBlast = typeof blasts.$inferInsert;
export type BlastLog = typeof blastLogs.$inferSelect;
export type NewBlastLog = typeof blastLogs.$inferInsert;
export type RSVP = typeof rsvps.$inferSelect;
export type NewRSVP = typeof rsvps.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
