import { describe, expect, it } from "vitest";
import { markAllRead, markRead, SAMPLE_ANNOUNCEMENTS, unreadCount } from "./announcements";
import { encodeEnvelope, isStringArray, valueCodec } from "./persist";

describe("read-state persistence", () => {
  const codec = valueCodec(isStringArray);
  const now = new Date("2025-06-15T00:00:00Z");

  it("round-trips read ids so unread counts survive a restart", () => {
    const read = markRead(new Set(), SAMPLE_ANNOUNCEMENTS[0].id);
    const restored = new Set(codec.decode(codec.encode([...read])));
    expect(unreadCount(SAMPLE_ANNOUNCEMENTS, restored, now)).toBe(unreadCount(SAMPLE_ANNOUNCEMENTS, read, now));
  });

  it("stores every id after mark-all-read", () => {
    const all = markAllRead(new Set(), SAMPLE_ANNOUNCEMENTS);
    expect(codec.decode(codec.encode([...all]))?.length).toBe(all.size);
  });

  it("ignores malformed stored data", () => {
    expect(codec.decode(encodeEnvelope({ ids: [] }))).toBeUndefined();
    expect(codec.decode("not json")).toBeUndefined();
  });
});
