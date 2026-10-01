import { describe, expect, it } from "vitest";
import {
  categories,
  isActive,
  localDateLabel,
  markAllRead,
  markRead,
  SAMPLE_ANNOUNCEMENTS,
  sortAnnouncements,
  unreadCount,
  visibleFeed,
} from "./announcements";

const NOW = new Date("2025-06-25T00:00:00Z");

describe("sortAnnouncements", () => {
  it("orders pinned, then priority, then newest", () => {
    expect(sortAnnouncements(SAMPLE_ANNOUNCEMENTS).map((a) => a.id)).toEqual(["n1", "n4", "n2", "n6", "n3", "n5"]);
  });
  it("does not mutate the input", () => {
    const ids = SAMPLE_ANNOUNCEMENTS.map((a) => a.id);
    sortAnnouncements(SAMPLE_ANNOUNCEMENTS);
    expect(SAMPLE_ANNOUNCEMENTS.map((a) => a.id)).toEqual(ids);
  });
});

describe("visibility", () => {
  it("hides expired and future announcements", () => {
    expect(isActive(SAMPLE_ANNOUNCEMENTS[5], NOW)).toBe(false);
    expect(isActive(SAMPLE_ANNOUNCEMENTS[1], new Date("2025-01-01T00:00:00Z"))).toBe(false);
    expect(visibleFeed(SAMPLE_ANNOUNCEMENTS, NOW).map((a) => a.id)).not.toContain("n6");
  });
  it("filters by category and unread", () => {
    expect(visibleFeed(SAMPLE_ANNOUNCEMENTS, NOW, { category: "Product" }).map((a) => a.id)).toEqual(["n2"]);
    const read = new Set(["n1", "n4"]);
    expect(visibleFeed(SAMPLE_ANNOUNCEMENTS, NOW, { unreadOnly: true, read }).map((a) => a.id)).toEqual(["n2", "n3", "n5"]);
  });
});

describe("read state", () => {
  it("counts unread active items", () => {
    expect(unreadCount(SAMPLE_ANNOUNCEMENTS, new Set(), NOW)).toBe(5);
    expect(unreadCount(SAMPLE_ANNOUNCEMENTS, markRead(new Set(), "n2"), NOW)).toBe(4);
  });
  it("marks all read without mutating", () => {
    const before = new Set<string>();
    const after = markAllRead(before, SAMPLE_ANNOUNCEMENTS);
    expect(before.size).toBe(0);
    expect(unreadCount(SAMPLE_ANNOUNCEMENTS, after, NOW)).toBe(0);
  });
  it("lists categories", () => {
    expect(categories(SAMPLE_ANNOUNCEMENTS)).toEqual(["Community", "Operations", "Product", "Security", "Support"]);
  });
});

describe("pass 3 edge cases", () => {
  it("shows the local calendar date, not the UTC one", () => {
    const prev = process.env.TZ;
    process.env.TZ = "Asia/Bangkok";
    try {
      expect(localDateLabel("2025-06-20T20:00:00Z")).toBe("2025-06-21");
      expect(localDateLabel("2025-06-20T16:59:59Z")).toBe("2025-06-20");
      expect(localDateLabel("garbage")).toBe("garbage");
    } finally {
      process.env.TZ = prev;
    }
  });
  it("orders by instant even when offsets differ", () => {
    const base = { ...SAMPLE_ANNOUNCEMENTS[1], pinned: false, priority: "normal" as const };
    const a = { ...base, id: "a", publishedAt: "2025-06-02T01:00:00+07:00" }; // 2025-06-01T18:00Z
    const b = { ...base, id: "b", publishedAt: "2025-06-01T20:00:00Z" };
    expect(sortAnnouncements([a, b]).map((x) => x.id)).toEqual(["b", "a"]);
  });
});
