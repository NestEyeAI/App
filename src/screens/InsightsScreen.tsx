import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/theme';
import {
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  PrimaryButton,
  Screen,
  SectionHeader,
  StatTile,
  TrendChart,
} from '@/components';
import { useDailySummaries, useFarm, useWeightReadings } from '@/hooks/queries';
import { formatDate, gramsToKg } from '@/hooks/format';

export function InsightsScreen() {
  const farm = useFarm();
  const [barnId, setBarnId] = useState<string | null>(null);

  const activeBarnId = barnId ?? farm.data?.barns[0]?.id ?? null;
  const summaries = useDailySummaries(activeBarnId ?? '');
  const weight = useWeightReadings(activeBarnId ?? '');

  const latestSummary = summaries.data?.[summaries.data.length - 1];

  const growth = useMemo(() => {
    const data = weight.data ?? [];
    return {
      measured: data.map((r) => ({ value: Math.round(r.avgWeightG) })),
    };
  }, [weight.data]);

  const mortalityTrend = useMemo(
    () => (summaries.data ?? []).map((s) => ({ value: s.mortalityCount })),
    [summaries.data]
  );

  const onShare = async (barnName: string) => {
    // TODO[BACKEND]: generate a real PDF/CSV daily report server-side
    if (!latestSummary) return;
    await Share.share({
      message:
        `Nesteye Daily Report — ${barnName} (${formatDate(latestSummary.date)})\n` +
        `Avg weight: ${gramsToKg(latestSummary.avgWeight)} kg\n` +
        `Mortality: ${latestSummary.mortalityCount}\n` +
        `Alerts: ${latestSummary.alertsCount}`,
    });
  };

  if (farm.isLoading) {
    return (
      <Screen padded>
        <LoadingState />
      </Screen>
    );
  }
  if (farm.isError || !farm.data) {
    return (
      <Screen padded>
        <ErrorState onRetry={() => farm.refetch()} />
      </Screen>
    );
  }

  const activeBarn = farm.data.barns.find((b) => b.id === activeBarnId);

  return (
    <Screen>
      <View style={styles.headerWrap}>
        <SectionHeader title="Insights" overline="Reports" />
      </View>

      <View style={styles.chips}>
        {farm.data.barns.map((b) => (
          <Pressable
            key={b.id}
            onPress={() => setBarnId(b.id)}
            style={[styles.chip, activeBarnId === b.id ? styles.chipActive : styles.chipIdle]}
          >
            <Text style={[styles.chipText, activeBarnId === b.id && styles.chipTextActive]}>
              {b.name}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {summaries.isLoading || weight.isLoading ? (
          <LoadingState />
        ) : summaries.isError ? (
          <ErrorState onRetry={() => summaries.refetch()} />
        ) : !latestSummary ? (
          <EmptyState icon="bar-chart-2" title="No reports yet" />
        ) : (
          <>
            {/* Daily summary */}
            <Card style={styles.card}>
              <Text style={styles.cardOverline}>Daily Summary · {formatDate(latestSummary.date)}</Text>
              <View style={styles.statRow}>
                <StatTile label="Avg Weight" value={gramsToKg(latestSummary.avgWeight)} unit="kg" icon="bar-chart-2" />
                <View style={{ width: spacing.md }} />
                <StatTile
                  label="Mortality"
                  value={String(latestSummary.mortalityCount)}
                  icon="alert-octagon"
                  tone={latestSummary.mortalityCount > 12 ? 'warning' : 'default'}
                />
                <View style={{ width: spacing.md }} />
                <StatTile label="Alerts" value={String(latestSummary.alertsCount)} icon="bell" />
              </View>
            </Card>

            {/* Growth curve */}
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>Weight Growth</Text>
              <TrendChart data={growth.measured} suffix="g" caption="Flock average weight, grams" />
            </Card>

            {/* Mortality trend */}
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>Mortality · last 14 days</Text>
              <TrendChart data={mortalityTrend} color={colors.danger} />
            </Card>

            {/* Feed efficiency placeholder */}
            <Card style={styles.card}>
              <View style={styles.feedRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>Feed Conversion Ratio</Text>
                  <Text style={styles.placeholder}>
                    FCR tracking coming soon — pairs feed delivery data with measured weight gain.
                  </Text>
                  {/* TODO[BACKEND]: compute FCR from feed-line telemetry + weight pipeline */}
                </View>
                <View style={styles.comingSoon}>
                  <Feather name="clock" size={18} color={colors.accent} />
                </View>
              </View>
            </Card>

            <PrimaryButton
              title="Share Daily Report"
              variant="secondary"
              onPress={() => onShare(activeBarn?.name ?? 'Barn')}
              style={{ marginTop: spacing.sm }}
            />
          </>
        )}
      </ScrollView>
    </Screen>
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
  chip: { flexShrink: 0, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1 },
  chipIdle: { backgroundColor: colors.surface, borderColor: colors.border },
  chipActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  chipText: { ...typography.caption, fontWeight: '600', color: colors.textSecondary, textDecorationLine: 'none' },
  chipTextActive: { color: colors.textInverse, textDecorationLine: 'none' },

  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  card: { marginBottom: spacing.md },
  cardOverline: { ...typography.overline, marginBottom: spacing.md },
  sectionTitle: { ...typography.h3, fontSize: 15, marginBottom: spacing.md },
  statRow: { flexDirection: 'row' },
  feedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  placeholder: { ...typography.bodySecondary },
  comingSoon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
