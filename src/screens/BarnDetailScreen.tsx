import React, { useLayoutEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, radius, spacing, typography } from '@/theme';
import {
  Card,
  ErrorState,
  LoadingState,
  Screen,
  StatTile,
  StatusDot,
  TrendChart,
} from '@/components';
import {
  useActivityReadings,
  useBarn,
  useEnvReadings,
  useWeightReadings,
} from '@/hooks/queries';
import { gramsToKg, STATUS_LABELS } from '@/hooks/format';
import { Barn, Camera } from '@/types';
import { RootStackParamList } from '@/navigation/types';
import { usePreferencesStore } from '@/store/preferencesStore';

type Props = NativeStackScreenProps<RootStackParamList, 'BarnDetail'>;

type InnerTab = 'Overview' | 'Weight' | 'Environment' | 'Activity';
const TABS: InnerTab[] = ['Overview', 'Weight', 'Environment', 'Activity'];

export function BarnDetailScreen({ route, navigation }: Props) {
  const { barnId } = route.params;
  const barn = useBarn(barnId);
  const [tab, setTab] = useState<InnerTab>('Overview');

  useLayoutEffect(() => {
    if (barn.data) navigation.setOptions({ title: barn.data.name });
  }, [barn.data, navigation]);

  if (barn.isLoading) {
    return (
      <Screen padded>
        <LoadingState />
      </Screen>
    );
  }
  if (barn.isError || !barn.data) {
    return (
      <Screen padded>
        <ErrorState title="Barn not found" onRetry={() => barn.refetch()} />
      </Screen>
    );
  }

  const b = barn.data;

  return (
    <Screen edges={[]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <BarnHeader barn={b} />
        <CameraGrid cameras={b.cameras} />

        <View style={styles.tabBar}>
          {TABS.map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tab, tab === t && styles.tabActive]}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
            </Pressable>
          ))}
        </View>

        {tab === 'Overview' && <OverviewTab barn={b} />}
        {tab === 'Weight' && <WeightTab barnId={barnId} flockAge={b.flockAgeDays} catchDay={b.targetCatchDay} />}
        {tab === 'Environment' && <EnvironmentTab barnId={barnId} />}
        {tab === 'Activity' && <ActivityTab barnId={barnId} />}
      </ScrollView>
    </Screen>
  );
}

function BarnHeader({ barn }: { barn: Barn }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <StatusDot state={barn.status} size={12} />
        <Text style={styles.status}>{STATUS_LABELS[barn.status]}</Text>
      </View>
      <Text style={styles.headerMeta}>
        Day {barn.flockAgeDays} of {barn.targetCatchDay} · {barn.birdCount.toLocaleString()} birds
      </Text>
    </View>
  );
}

function CameraGrid({ cameras }: { cameras: Camera[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Live Cameras</Text>
      <View style={styles.camGrid}>
        {cameras.map((cam) => (
          <View key={cam.id} style={styles.camTile}>
            <View style={styles.camFeed}>
              {/* TODO[BACKEND]: replace placeholder with live IR/depth stream (cam.lastFrameUrl) */}
              <Feather
                name={cam.status === 'online' ? 'video' : 'video-off'}
                size={20}
                color={cam.status === 'online' ? colors.textInverse : colors.danger}
              />
              <View style={styles.camTypeTag}>
                <Text style={styles.camTypeText}>{cam.type}</Text>
              </View>
              {cam.status === 'offline' && (
                <View style={styles.camOffline}>
                  <Text style={styles.camOfflineText}>OFFLINE</Text>
                </View>
              )}
            </View>
            <Text style={styles.camLabel}>{cam.zone}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function OverviewTab({ barn }: { barn: Barn }) {
  const online = barn.cameras.filter((c) => c.status === 'online').length;
  return (
    <View style={styles.section}>
      <View style={styles.statRow}>
        <StatTile label="Flock Age" value={String(barn.flockAgeDays)} unit="days" icon="calendar" />
        <View style={{ width: spacing.md }} />
        <StatTile label="Bird Count" value={barn.birdCount.toLocaleString()} icon="eye" />
      </View>
      <View style={styles.statRow}>
        <StatTile
          label="Cameras Online"
          value={`${online}/${barn.cameras.length}`}
          icon="video"
          tone={online === barn.cameras.length ? 'success' : 'warning'}
        />
        <View style={{ width: spacing.md }} />
        <StatTile
          label="Days to Catch"
          value={String(barn.targetCatchDay - barn.flockAgeDays)}
          unit="days"
          icon="flag"
        />
      </View>
    </View>
  );
}

function WeightTab({
  barnId,
  flockAge,
  catchDay,
}: {
  barnId: string;
  flockAge: number;
  catchDay: number;
}) {
  const weight = useWeightReadings(barnId);

  const { points, latest } = useMemo(() => {
    const data = weight.data ?? [];
    const pts = data.map((r, i) => ({
      value: Math.round(r.avgWeightG),
      label: i % 7 === 0 ? `d${i}` : undefined,
    }));
    return { points: pts, latest: data[data.length - 1] };
  }, [weight.data]);

  if (weight.isLoading) return <LoadingState />;
  if (weight.isError) return <ErrorState onRetry={() => weight.refetch()} />;

  const uniformityPct = latest ? Math.round((1 - latest.uniformityCV) * 100) : 0;
  const predictedCatch = catchDay; // TODO[BACKEND]: predict from depth-camera growth model

  return (
    <View style={styles.section}>
      {/* TODO[BACKEND]: replace mock weight with depth-camera weight pipeline */}
      <Card style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Flock Avg Weight</Text>
        <TrendChart data={points} suffix="g" caption="Daily flock average, grams" />
      </Card>

      <View style={styles.statRow}>
        <StatTile
          label="Current Avg"
          value={latest ? gramsToKg(latest.avgWeightG) : '—'}
          unit="kg"
          icon="bar-chart-2"
        />
        <View style={{ width: spacing.md }} />
        <StatTile label="Uniformity" value={`${uniformityPct}`} unit="%" icon="layers" />
      </View>
      <View style={styles.statRow}>
        <StatTile label="Predicted Catch" value={`Day ${predictedCatch}`} icon="flag" />
        <View style={{ width: spacing.md }} />
        <StatTile
          label="Sampled"
          value={latest ? String(latest.birdsSampled) : '—'}
          unit="birds"
          icon="eye"
        />
      </View>
    </View>
  );
}

function EnvironmentTab({ barnId }: { barnId: string }) {
  const env = useEnvReadings(barnId);
  const prefs = usePreferencesStore((s) => s.preferences);

  const series = useMemo(() => {
    const data = (env.data ?? []).slice(-48);
    return {
      temp: data.map((r) => ({ value: r.tempC })),
      humidity: data.map((r) => ({ value: r.humidityPct })),
      ammonia: data.map((r) => ({ value: r.ammoniaPpm })),
      latest: data[data.length - 1],
    };
  }, [env.data]);

  if (env.isLoading) return <LoadingState />;
  if (env.isError) return <ErrorState onRetry={() => env.refetch()} />;

  const l = series.latest;
  const tempBreach = l ? l.tempC >= prefs.tempHighC : false;
  const ammoniaBreach = l ? l.ammoniaPpm >= prefs.ammoniaHighPpm : false;

  return (
    <View style={styles.section}>
      <View style={styles.statRow}>
        <StatTile
          label="Temp"
          value={l ? l.tempC.toFixed(1) : '—'}
          unit="°C"
          icon="thermometer"
          tone={tempBreach ? 'danger' : 'success'}
        />
        <View style={{ width: spacing.md }} />
        <StatTile label="Humidity" value={l ? String(l.humidityPct) : '—'} unit="%" icon="droplet" />
        <View style={{ width: spacing.md }} />
        <StatTile
          label="Ammonia"
          value={l ? l.ammoniaPpm.toFixed(0) : '—'}
          unit="ppm"
          icon="wind"
          tone={ammoniaBreach ? 'danger' : 'success'}
        />
      </View>

      <Card style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Temperature · last 48h</Text>
        <TrendChart data={series.temp} suffix="°" color={tempBreach ? colors.danger : colors.forest} />
        <Text style={styles.threshold}>
          Threshold: {prefs.tempHighC}°C {tempBreach ? '· BREACHED' : '· within range'}
        </Text>
      </Card>

      <Card style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Ammonia · last 48h</Text>
        <TrendChart
          data={series.ammonia}
          suffix=""
          color={ammoniaBreach ? colors.danger : colors.accent}
        />
        <Text style={styles.threshold}>
          Threshold: {prefs.ammoniaHighPpm} ppm {ammoniaBreach ? '· BREACHED' : '· within range'}
        </Text>
      </Card>
    </View>
  );
}

function ActivityTab({ barnId }: { barnId: string }) {
  const activity = useActivityReadings(barnId);

  const { points, avg } = useMemo(() => {
    const data = (activity.data ?? []).slice(-48);
    const pts = data.map((r) => ({ value: r.activityIndex }));
    const a = data.length ? Math.round(data.reduce((s, r) => s + r.activityIndex, 0) / data.length) : 0;
    return { points: pts, avg: a };
  }, [activity.data]);

  if (activity.isLoading) return <LoadingState />;
  if (activity.isError) return <ErrorState onRetry={() => activity.refetch()} />;

  return (
    <View style={styles.section}>
      {/* TODO[BACKEND]: feeding/drinking derived from behavior model; mock for now */}
      <Card style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Activity Index · last 48h</Text>
        <TrendChart data={points} caption="0–100 movement index from IR tracking" />
      </Card>
      <View style={styles.statRow}>
        <StatTile label="Avg Activity" value={String(avg)} unit="/100" icon="activity" />
        <View style={{ width: spacing.md }} />
        <StatTile label="Feeding" value="Normal" icon="coffee" />
        <View style={{ width: spacing.md }} />
        <StatTile label="Drinking" value="Normal" icon="droplet" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  status: { ...typography.h3 },
  headerMeta: { ...typography.bodySecondary, marginTop: 4 },

  section: { marginTop: spacing.sm },
  sectionTitle: { ...typography.h3, fontSize: 15, marginBottom: spacing.md },

  camGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  camTile: { width: '31%' },
  camFeed: {
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  camTypeTag: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  camTypeText: { color: colors.textInverse, fontSize: 9, fontWeight: '700' },
  camOffline: { position: 'absolute', bottom: 6, backgroundColor: colors.danger, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  camOfflineText: { color: colors.textInverse, fontSize: 8, fontWeight: '700' },
  camLabel: { ...typography.caption, marginTop: 4, textAlign: 'center' },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    padding: 4,
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.pill },
  tabActive: { backgroundColor: colors.surface, ...{ shadowColor: colors.shadow, shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1 } },
  tabText: { ...typography.caption, fontWeight: '600' },
  tabTextActive: { color: colors.forest, fontWeight: '700' },

  statRow: { flexDirection: 'row', marginTop: spacing.md },
  chartCard: { marginTop: spacing.md },
  threshold: { ...typography.caption, marginTop: spacing.sm },
});
