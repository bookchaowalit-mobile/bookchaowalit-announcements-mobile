/** Pure logic for an announcements feed: ordering, filtering and read state. */

export type Priority = "urgent" | "normal" | "info";

export type Announcement = {
  id: string;
  title: string;
  body: string;
  category: string;
  priority: Priority;
  pinned: boolean;
  publishedAt: string; // ISO date-time
  /** Optional expiry; expired announcements are hidden. */
  expiresAt?: string;
};

const PRIORITY_RANK: Record<Priority, number> = { urgent: 0, normal: 1, info: 2 };

/** Pinned first, then by priority, then newest first. Does not mutate the input. */
export function sortAnnouncements(items: Announcement[]): Announcement[] {
  return [...items].sort(
    (a, b) =>
      Number(b.pinned) - Number(a.pinned) ||
      PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
      b.publishedAt.localeCompare(a.publishedAt),
  );
}

export function isActive(item: Announcement, now: Date): boolean {
  return new Date(item.publishedAt) <= now && (!item.expiresAt || new Date(item.expiresAt) > now);
}

export type FeedFilter = { category?: string | null; unreadOnly?: boolean; read?: ReadonlySet<string> };

export function visibleFeed(items: Announcement[], now: Date, filter: FeedFilter = {}): Announcement[] {
  const read = filter.read ?? new Set<string>();
  return sortAnnouncements(
    items.filter(
      (a) =>
        isActive(a, now) &&
        (!filter.category || a.category === filter.category) &&
        (!filter.unreadOnly || !read.has(a.id)),
    ),
  );
}

export function unreadCount(items: Announcement[], read: ReadonlySet<string>, now: Date): number {
  return items.filter((a) => isActive(a, now) && !read.has(a.id)).length;
}

export function markRead(read: ReadonlySet<string>, id: string): Set<string> {
  return new Set(read).add(id);
}

export function markAllRead(read: ReadonlySet<string>, items: Announcement[]): Set<string> {
  const next = new Set(read);
  for (const a of items) next.add(a.id);
  return next;
}

export function categories(items: Announcement[]): string[] {
  return [...new Set(items.map((a) => a.category))].sort();
}

export const SAMPLE_ANNOUNCEMENTS: Announcement[] = [
  { id: "n1", title: "Scheduled maintenance Saturday", body: "The service will be unavailable from 01:00 to 03:00 (ICT) for database upgrades.", category: "Operations", priority: "urgent", pinned: true, publishedAt: "2025-06-20T09:00:00Z", expiresAt: "2030-01-01T00:00:00Z" },
  { id: "n2", title: "New dark mode", body: "Dark mode is now available in settings on all platforms.", category: "Product", priority: "normal", pinned: false, publishedAt: "2025-06-18T08:00:00Z" },
  { id: "n3", title: "Holiday office hours", body: "Support replies may take up to 48 hours during the holiday week.", category: "Support", priority: "info", pinned: false, publishedAt: "2025-06-15T08:00:00Z" },
  { id: "n4", title: "Security: rotate API keys", body: "Please rotate API keys created before March. Old keys stop working next month.", category: "Security", priority: "urgent", pinned: false, publishedAt: "2025-06-10T08:00:00Z" },
  { id: "n5", title: "Community meetup recap", body: "Slides and recordings from the Bangkok meetup are now online.", category: "Community", priority: "info", pinned: false, publishedAt: "2025-06-05T08:00:00Z" },
  { id: "n6", title: "Beta sign-ups closed", body: "Thanks to everyone who joined the beta.", category: "Product", priority: "normal", pinned: false, publishedAt: "2025-05-01T08:00:00Z", expiresAt: "2025-05-31T00:00:00Z" },
];
