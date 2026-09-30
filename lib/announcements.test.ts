import { describe, expect, it } from "vitest";
import {
  categories,
  isActive,
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
