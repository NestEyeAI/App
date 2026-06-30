import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, spacing, typography } from '@/theme';
import {
  AlertBadge,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  SectionHeader,
  SeverityPill,
} from '@/components';
import { useAlerts, useFarm } from '@/hooks/queries';
import { ALERT_ICONS, ALERT_LABELS, formatRelativeTime } from '@/hooks/format';
import { Alert, AlertType } from '@/types';
import { RootStackParamList } from '@/navigation/types';
import { Feather as FeatherType } from '@expo/vector-icons';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type TypeFilter = 'all' | AlertType;

const TYPE_FILTERS: { key: TypeFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'piling', label: 'Piling' },
  { key: 'mortality', label: 'Mortality' },
  { key: 'high_temperature', label: 'Temp' },
  { key: 'low_activity', label: 'Activity' },
  { key: 'camera_offline', label: 'Camera' },
  { key: 'system_health', label: 'System' },
];

export function AlertsScreen() {
  const navigation = useNavigation<Nav>();
  const alerts = useAlerts();
  const farm = useFarm();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [barnFilter, setBarnFilter] = useState<string>('all');

  const barnName = useMemo(() => {
    const map: Record<string, string> = {};
    farm.data?.barns.forEach((b) => (map[b.id] = b.name));
    return map;
  }, [farm.data]);

  const filtered = useMemo(() => {
    let list = alerts.data ?? [];
    if (typeFilter !== 'all') list = list.filter((a) => a.type === typeFilter);
    if (barnFilter !== 'all') list = list.filter((a) => a.barnId === barnFilter);
    return list;
  }, [alerts.data, typeFilter, barnFilter]);

  return (
    <Screen>
      <View style={styles.headerWrap}>
        <SectionHeader title="Alerts" overline="Live Feed" />
      </View>

      {/* Type filter chips */}
      <View style={styles.chips}>
        {TYPE_FILTERS.map((f) => (
          <Chip
            key={f.key}
            label={f.label}
            active={typeFilter === f.key}
            onPress={() => setTypeFilter(f.key)}
          />
        ))}
      </View>

      {/* Barn filter chips */}
      <View style={styles.chips}>
        <Chip label="All Barns" active={barnFilter === 'all'} onPress={() => setBarnFilter('all')} />
        {farm.data?.barns.map((b) => (
          <Chip
            key={b.id}
            label={b.name}
            active={barnFilter === b.id}
            onPress={() => setBarnFilter(b.id)}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {alerts.isLoading ? (
          <LoadingState message="Loading alerts…" />
        ) : alerts.isError ? (
          <ErrorState onRetry={() => alerts.refetch()} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="bell-off"
            title="No alerts"
            message="Nothing matches these filters. Your flock is calm."
          />
        ) : (
          filtered.map((alert) => (
            <AlertRow
              key={alert.id}
              alert={alert}
              barnName={barnName[alert.barnId] ?? alert.barnId}
              onPress={() => navigation.navigate('AlertDetail', { alertId: alert.id })}
            />
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function AlertRow({
  alert,
  barnName,
  onPress,
}: {
  alert: Alert;
  barnName: string;
  onPress: () => void;
}) {
  return (
    <Card onPress={onPress} style={styles.row}>
      <AlertBadge
        icon={ALERT_ICONS[alert.type] as keyof typeof FeatherType.glyphMap}
        severity={alert.severity}
      />
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={styles.rowTitle}>{ALERT_LABELS[alert.type]}</Text>
          {!alert.acknowledged ? <View style={styles.unreadDot} /> : null}
        </View>
        <Text style={styles.rowMeta}>
          {barnName} · {alert.zone} · {formatRelativeTime(alert.timestamp)}
        </Text>
        <Text style={styles.rowMsg} numberOfLines={2}>
          {alert.message}
        </Text>
        <View style={styles.rowFoot}>
          <SeverityPill severity={alert.severity} />
          {alert.acknowledged ? (
            <View style={styles.ackRow}>
              <Feather name="check" size={12} color={colors.success} />
              <Text style={styles.ackText}>Acknowledged</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  headerWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    flexShrink: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipIdle: { backgroundColor: colors.surface, borderColor: colors.border },
  chipActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  chipText: { ...typography.caption, fontWeight: '600', color: colors.textSecondary, textDecorationLine: 'none' },
  chipTextActive: { color: colors.textInverse, textDecorationLine: 'none' },

  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, paddingTop: spacing.sm },
  row: { flexDirection: 'row', marginBottom: spacing.md, gap: spacing.md },
  rowBody: { flex: 1 },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowTitle: { ...typography.h3, fontSize: 15 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  rowMeta: { ...typography.caption, marginTop: 2 },
  rowMsg: { ...typography.bodySecondary, marginTop: spacing.sm },
  rowFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md },
  ackRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ackText: { ...typography.caption, color: colors.success },
});
