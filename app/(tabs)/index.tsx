import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  categories,
  markAllRead,
  markRead,
  SAMPLE_ANNOUNCEMENTS,
  unreadCount,
  visibleFeed,
  type Announcement,
} from "../../lib/announcements";

const CATEGORIES = categories(SAMPLE_ANNOUNCEMENTS);
const PRIORITY_COLOR = { urgent: "#B00020", normal: "#2A5A8C", info: "#5F6B7A" } as const;

export default function AnnouncementsScreen() {
  const [read, setRead] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const now = useMemo(() => new Date(), []);

  const feed = visibleFeed(SAMPLE_ANNOUNCEMENTS, now, { category, unreadOnly, read });
  const unread = unreadCount(SAMPLE_ANNOUNCEMENTS, read, now);

  const toggle = (a: Announcement) => {
    setOpen(open === a.id ? null : a.id);
    setRead(markRead(read, a.id));
  };

  return (
    <FlatList
      style={styles.container}
      data={feed}
      keyExtractor={(a) => a.id}
      ListHeaderComponent={
        <View style={styles.filters}>
          <View style={styles.row}>
            <Text style={styles.unread} accessibilityLiveRegion="polite">
              {unread} unread
            </Text>
            <Pressable
              onPress={() => setRead(markAllRead(read, SAMPLE_ANNOUNCEMENTS))}
              accessibilityRole="button"
              disabled={unread === 0}
            >
              <Text style={[styles.link, unread === 0 && styles.disabled]}>Mark all read</Text>
            </Pressable>
          </View>
          <View style={styles.chips}>
            <Chip label="All" active={category === null} onPress={() => setCategory(null)} />
            {CATEGORIES.map((c) => (
              <Chip key={c} label={c} active={category === c} onPress={() => setCategory(category === c ? null : c)} />
            ))}
            <Chip label="Unread only" active={unreadOnly} onPress={() => setUnreadOnly(!unreadOnly)} />
          </View>
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>Nothing to show.</Text>}
      renderItem={({ item }) => {
        const isRead = read.has(item.id);
        const expanded = open === item.id;
        return (
          <Pressable
            style={[styles.card, { borderLeftColor: PRIORITY_COLOR[item.priority] }]}
            onPress={() => toggle(item)}
            accessibilityRole="button"
            accessibilityState={{ expanded }}
            accessibilityLabel={`${item.pinned ? "Pinned. " : ""}${item.priority} ${item.title}${isRead ? "" : ", unread"}`}
          >
            <View style={styles.row}>
              <Text style={[styles.cardTitle, !isRead && styles.bold]} numberOfLines={expanded ? undefined : 1}>
                {item.title}
              </Text>
              {item.pinned && <Ionicons name="pin" size={16} color="#8A5A00" />}
              {!isRead && <View style={styles.dot} />}
            </View>
            <Text style={styles.meta}>
              {item.category} · {item.priority} · {item.publishedAt.slice(0, 10)}
            </Text>
            {expanded && <Text style={styles.body}>{item.body}</Text>}
          </Pressable>
        );
      }}
    />
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  filters: { padding: 16, gap: 10 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  unread: { fontSize: 16, fontWeight: "600", color: "#333" },
  link: { color: "#4A90D9", fontWeight: "600" },
  disabled: { color: "#aaa" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: "#E3ECF7" },
  chipActive: { backgroundColor: "#4A90D9" },
  chipText: { color: "#2A5A8C", fontWeight: "500" },
  chipTextActive: { color: "#fff" },
  empty: { textAlign: "center", color: "#777", marginTop: 32 },
  card: { backgroundColor: "#fff", borderRadius: 10, borderLeftWidth: 5, padding: 14, marginHorizontal: 16, marginBottom: 10, gap: 4, elevation: 1 },
  cardTitle: { flex: 1, fontSize: 16, color: "#333" },
  bold: { fontWeight: "700" },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#4A90D9" },
  meta: { fontSize: 12, color: "#777", textTransform: "capitalize" },
  body: { fontSize: 14, color: "#444", lineHeight: 20, marginTop: 4 },
});
