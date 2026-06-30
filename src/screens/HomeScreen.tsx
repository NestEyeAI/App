import React, { useMemo } from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { radius, spacing } from '@/theme';
import { Theme, useTheme, useThemedStyles } from '@/theme/ThemeContext';
import {
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  SectionHeader,
  StatTile,
  StatusDot,
} from '@/components';
import { Sparkline } from '@/components/Sparkline';
import { useActivityReadings, useAlerts, useFarm } from '@/hooks/queries';
import { STATUS_LABELS } from '@/hooks/format';
import { useAuthStore } from '@/store/authStore';
import { Barn, BarnStatus } from '@/types';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STATUS_TONE: Record<BarnStatus, 'success' | 'warning' | 'danger'> = {
  healthy: 'success',
  watch: 'warning',
  alert: 'danger',
};

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const user = useAuthStore((s) => s.user);
  const farm = useFarm();
  const alerts = useAlerts();

  const isLoading = farm.isLoading || alerts.isLoading;
  const isError = farm.isError;

  const summary = useMemo(() => {
    if (!farm.data) return null;
    const barns = farm.data.barns;
    const activeAlerts = (alerts.data ?? []).filter((a) => !a.acknowledged).length;
    const birdsMonitored = barns.reduce((sum, b) => sum + b.birdCount, 0);
    const worst: BarnStatus = barns.some((b) => b.status === 'alert')
      ? 'alert'
      : barns.some((b) => b.status === 'watch')
        ? 'watch'
        : 'healthy';
    const daysToCatch = Math.min(...barns.map((b) => b.targetCatchDay - b.flockAgeDays));
    return { barns, activeAlerts, birdsMonitored, worst, daysToCatch };
  }, [farm.data, alerts.data]);

  const onRefresh = () => {
    farm.refetch();
    alerts.refetch();
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={farm.isRefetching} onRefresh={onRefresh} tintColor={colors.forest} />
        }
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Hello{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</Text>
            <Text style={styles.farmName}>{farm.data?.name ?? 'Your Farm'}</Text>
          </View>
          <Image
            source={require('../../assets/logo-mark.png')}
            style={styles.logoMark}
            resizeMode="contain"
          />
        </View>

        {isLoading ? (
          <LoadingState message="Loading your farm…" />
        ) : isError || !summary ? (
          <ErrorState onRetry={onRefresh} />
        ) : (
          <>
            <FlockHealthCard status={summary.worst} barnCount={summary.barns.length} />

            <View style={styles.statRow}>
              <StatTile
                label="Active Alerts"
                value={String(summary.activeAlerts)}
                icon="bell"
                tone={summary.activeAlerts > 0 ? 'warning' : 'success'}
              />
              <View style={{ width: spacing.md }} />
              <StatTile
                label="Birds Monitored"
                value={summary.birdsMonitored.toLocaleString()}
                icon="eye"
              />
            </View>
            <View style={styles.statRow}>
              <StatTile
                label="Days to Catch"
                value={String(summary.daysToCatch)}
                unit="days"
                icon="calendar"
              />
              <View style={{ width: spacing.md }} />
              <StatTile label="Barns" value={String(summary.barns.length)} icon="grid" />
            </View>

            <View style={{ height: spacing.xl }} />
            <SectionHeader title="Your Barns" overline="Live Status" />
            {summary.barns.length === 0 ? (
              <EmptyState icon="grid" title="No barns yet" message="Add a barn in Settings to begin." />
            ) : (
              summary.barns.map((barn) => (
                <BarnCard
                  key={barn.id}
                  barn={barn}
                  onPress={() => navigation.navigate('BarnDetail', { barnId: barn.id })}
                />
              ))
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function FlockHealthCard({ status, barnCount }: { status: BarnStatus; barnCount: number }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const tone = STATUS_TONE[status];
  const bg =
    tone === 'success' ? colors.successBg : tone === 'warning' ? colors.warningBg : colors.dangerBg;
  const fg = tone === 'success' ? colors.success : tone === 'warning' ? colors.warning : colors.danger;
  const copy =
    status === 'healthy'
      ? 'All barns operating normally.'
      : status === 'watch'
        ? 'One or more barns need attention.'
        : 'Critical condition detected. Act now.';
  return (
    <View style={[styles.healthCard, { backgroundColor: bg }]}>
      <View style={styles.healthRow}>
        <View>
          <Text style={styles.healthOverline}>Flock Health</Text>
          <Text style={[styles.healthStatus, { color: fg }]}>{STATUS_LABELS[status]}</Text>
          <Text style={styles.healthCopy}>{copy}</Text>
        </View>
        <View style={[styles.healthIcon, { backgroundColor: fg }]}>
          <Feather
            name={status === 'healthy' ? 'check' : status === 'watch' ? 'eye' : 'alert-triangle'}
            size={22}
            color={colors.textInverse}
          />
        </View>
      </View>
      <Text style={styles.healthFoot}>{barnCount} barns monitored 24/7</Text>
    </View>
  );
}

function BarnCard({ barn, onPress }: { barn: Barn; onPress: () => void }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const activity = useActivityReadings(barn.id);
  const onlineCams = barn.cameras.filter((c) => c.status === 'online').length;
  const spark = (activity.data ?? []).slice(-24).map((r) => r.activityIndex);
  const tone = STATUS_TONE[barn.status];
  const sparkColor =
    tone === 'success' ? colors.success : tone === 'warning' ? colors.warning : colors.danger;

  return (
    <Card onPress={onPress} style={styles.barnCard}>
      <View style={styles.barnTop}>
        <View style={styles.barnTitleRow}>
          <StatusDot state={barn.status} />
          <Text style={styles.barnName}>{barn.name}</Text>
        </View>
        <Feather name="chevron-right" size={20} color={colors.textMuted} />
      </View>

      <View style={styles.barnMetaRow}>
        <View>
          <Text style={styles.barnMeta}>
            Day {barn.flockAgeDays} · {barn.birdCount.toLocaleString()} birds
          </Text>
          <Text style={styles.barnMetaMuted}>
            {onlineCams}/{barn.cameras.length} cameras online
          </Text>
        </View>
        <Sparkline values={spark.length ? spark : [1, 1]} color={sparkColor} />
      </View>
    </Card>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
    header: { paddingTop: spacing.md, marginBottom: spacing.lg, flexDirection: 'row', alignItems: 'center' },
    greeting: { ...t.typography.bodySecondary },
    farmName: { ...t.typography.h1 },
    logoMark: { width: 56, height: 64 },

    healthCard: { borderRadius: radius.lg, padding: spacing.lg, ...t.shadow.card },
    healthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    healthOverline: { ...t.typography.overline },
    healthStatus: { ...t.typography.statMd, marginVertical: 2 },
    healthCopy: { ...t.typography.bodySecondary, maxWidth: 220 },
    healthIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    healthFoot: { ...t.typography.caption, marginTop: spacing.md },

    statRow: { flexDirection: 'row', marginTop: spacing.md },

    barnCard: { marginBottom: spacing.md },
    barnTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    barnTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    barnName: { ...t.typography.h3 },
    barnMetaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginTop: spacing.md,
    },
    barnMeta: { ...t.typography.body },
    barnMetaMuted: { ...t.typography.caption, marginTop: 2 },
  });
