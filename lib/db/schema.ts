import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

export const shareKind = pgEnum("share_kind", ["text", "file", "link"])
export const shareState = pgEnum("share_state", [
  "pending",
  "ready",
  "trashed",
  "deleted",
])
export const visibility = pgEnum("visibility", [
  "private",
  "unlisted",
  "public",
])

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  displayName: text("display_name"),
  ...timestamps,
})

export const settings = pgTable("settings", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  theme: text("theme").default("system").notNull(),
  defaultVisibility: visibility("default_visibility")
    .default("unlisted")
    .notNull(),
  defaultTtlHours: integer("default_ttl_hours"),
  maxUploadBytes: integer("max_upload_bytes").default(104857600).notNull(),
  preferences: jsonb("preferences")
    .$type<Record<string, unknown>>()
    .default({})
    .notNull(),
  ...timestamps,
})

export const collections = pgTable(
  "collections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    icon: text("icon").default("folder").notNull(),
    slug: text("slug").notNull(),
    visibility: visibility("visibility").default("private").notNull(),
    publicTokenHash: text("public_token_hash"),
    ...timestamps,
  },
  (t) => [uniqueIndex("collections_owner_slug_uq").on(t.ownerId, t.slug)]
)

export const shares = pgTable(
  "shares",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    collectionId: uuid("collection_id").references(() => collections.id, {
      onDelete: "set null",
    }),
    slug: text("slug").notNull().unique(),
    kind: shareKind("kind").notNull(),
    state: shareState("state").default("pending").notNull(),
    visibility: visibility("visibility").default("unlisted").notNull(),
    title: text("title"),
    content: text("content"),
    targetUrl: text("target_url"),
    storageKey: text("storage_key"),
    originalName: text("original_name"),
    mediaType: text("media_type"),
    language: text("language"),
    sizeBytes: integer("size_bytes").default(0).notNull(),
    passwordHash: text("password_hash"),
    managementTokenHash: text("management_token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    trashedAt: timestamp("trashed_at", { withTimezone: true }),
    lastViewedAt: timestamp("last_viewed_at", { withTimezone: true }),
    viewCount: integer("view_count").default(0).notNull(),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    ...timestamps,
  },
  (t) => [
    index("shares_owner_state_idx").on(t.ownerId, t.state),
    index("shares_collection_idx").on(t.collectionId),
    index("shares_expires_idx").on(t.expiresAt),
  ]
)

export const recentViews = pgTable(
  "recent_views",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    shareId: uuid("share_id")
      .notNull()
      .references(() => shares.id, { onDelete: "cascade" }),
    viewedAt: timestamp("viewed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.shareId] })]
)

export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    prefix: text("prefix").notNull(),
    secretHash: text("secret_hash").notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("api_keys_prefix_idx").on(t.prefix)]
)

export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorId: uuid("actor_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(),
    resourceType: text("resource_type").notNull(),
    resourceId: text("resource_id"),
    ipHash: text("ip_hash"),
    data: jsonb("data").$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("audit_actor_created_idx").on(t.actorId, t.createdAt)]
)

export const rateLimits = pgTable(
  "rate_limits",
  {
    key: text("key").notNull(),
    bucket: timestamp("bucket", { withTimezone: true }).notNull(),
    count: integer("count").default(0).notNull(),
  },
  (t) => [primaryKey({ columns: [t.key, t.bucket] })]
)
