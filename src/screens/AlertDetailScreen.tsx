import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { radius, spacing } from '@/theme';
import { Theme, useTheme, useThemedStyles } from '@/theme/ThemeContext';
import {
  AlertBadge,
  Card,
  ErrorState,
  LoadingState,
  PrimaryButton,
  Screen,
  SeverityPill,
} from '@/components';
import { useAcknowledgeAlert, useAlerts, useFarm } from '@/hooks/queries';
import { ALERT_ICONS, ALERT_LABELS, formatRelativeTime, formatTime } from '@/hooks/format';
import { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AlertDetail'>;

export function AlertDetailScreen({ route, navigation }: Props) {
  const { alertId } = route.params;
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const alerts = useAlerts();
  const farm = useFarm();
  const ack = useAcknowledgeAlert();

  const alert = useMemo(
    () => alerts.data?.find((a) => a.id === alertId),
    [alerts.data, alertId]
  );
  const barn = farm.data?.barns.find((b) => b.id === alert?.barnId);

  if (alerts.isLoading) {
    return (
      <Screen padded>
        <LoadingState />
      </Screen>
    );
  }
  if (alerts.isError || !alert) {
    return (
      <Screen padded>
        <ErrorState title="Alert not found" onRetry={() => alerts.refetch()} />
      </Screen>
    );
  }

  return (
    <Screen edges={[]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Snapshot placeholder */}
        <View style={styles.snapshot}>
          <Feather name="image" size={30} color={colors.textMuted} />
          <Text style={styles.snapshotText}>Snapshot unavailable</Text>
          {/* TODO[BACKEND]: render signed snapshot image (alert.snapshotUrl) from edge device */}
        </View>

        <View style={styles.headRow}>
          <AlertBadge
            icon={ALERT_ICONS[alert.type] as keyof typeof Feather.glyphMap}
            severity={alert.severity}
            size={48}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{ALERT_LABELS[alert.type]}</Text>
            <Text style={styles.meta}>
              {barn?.name ?? alert.barnId} · {alert.zone}
            </Text>
          </View>
          <SeverityPill severity={alert.severity} />
        </View>

        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.body}>{alert.message}</Text>
        </Card>

        <Card style={styles.card}>
          <DetailRow icon="clock" label="Time" value={`${formatTime(alert.timestamp)} · ${formatRelativeTime(alert.timestamp)}`} />
          <DetailRow icon="map-pin" label="Zone" value={alert.zone} />
          <DetailRow
            icon={alert.acknowledged ? 'check-circle' : 'circle'}
            label="Status"
            value={alert.acknowledged ? 'Acknowledged' : 'Needs attention'}
            valueColor={alert.acknowledged ? colors.success : colors.warning}
            last
          />
        </Card>

        <View style={styles.actions}>
          <PrimaryButton
            title={alert.acknowledged ? 'Acknowledged' : 'Acknowledge'}
            onPress={() => ack.mutate(alert.id)}
            disabled={alert.acknowledged}
            loading={ack.isPending}
          />
          <PrimaryButton
            title="View Live Feed"
            variant="secondary"
            onPress={() => navigation.navigate('BarnDetail', { barnId: alert.barnId })}
            style={{ marginTop: spacing.md }}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

function DetailRow({
  icon,
  label,
  value,
  valueColor,
  last,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  valueColor?: string;
  last?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[styles.detailRow, !last && styles.detailDivider]}>
      <Feather name={icon} size={16} color={colors.textMuted} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
    snapshot: {
      height: 200,
      borderRadius: radius.lg,
      backgroundColor: t.colors.surfaceAlt,
      borderWidth: 1,
      borderColor: t.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    snapshotText: { ...t.typography.caption, marginTop: spacing.sm },
    headRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
    title: { ...t.typography.h2, fontSize: 20 },
    meta: { ...t.typography.bodySecondary, marginTop: 2 },
    card: { marginBottom: spacing.md },
    sectionLabel: { ...t.typography.overline, marginBottom: spacing.sm },
    body: { ...t.typography.body },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
    detailDivider: { borderBottomWidth: 1, borderBottomColor: t.colors.border },
    detailLabel: { ...t.typography.bodySecondary, flex: 1 },
    detailValue: { ...t.typography.body, fontWeight: '600' },
    actions: { marginTop: spacing.md },
  });
