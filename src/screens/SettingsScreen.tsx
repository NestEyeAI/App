import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/theme';
import { Card, PrimaryButton, Screen, SectionHeader, StatusDot } from '@/components';
import { useFarm } from '@/hooks/queries';
import { useAuthStore } from '@/store/authStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import { confirm } from '@/hooks/confirm';

export function SettingsScreen() {
  const farm = useFarm();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const prefs = usePreferencesStore((s) => s.preferences);
  const update = usePreferencesStore((s) => s.update);

  const onAddBarn = async () => {
    // TODO[BACKEND]: POST /barns to provision a new barn + pair edge device
    await confirm({
      title: 'Add Barn',
      message: 'Barn provisioning connects here once the backend is live.',
      confirmLabel: 'OK',
    });
  };

  const onLogout = async () => {
    const ok = await confirm({
      title: 'Sign out',
      message: 'Are you sure you want to sign out?',
      confirmLabel: 'Sign out',
      destructive: true,
    });
    if (ok) await signOut();
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerWrap}>
          <SectionHeader title="Settings" overline={farm.data?.name ?? 'Farm'} />
        </View>

        {/* Farm profile */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Farm Profile</Text>
          <Row label="Farm" value={farm.data?.name ?? '—'} />
          <Row label="Location" value={farm.data?.location ?? '—'} />
          <Row
            label="Subscription"
            value={(farm.data?.subscriptionTier ?? 'starter').toUpperCase()}
            last
          />
        </Card>

        {/* Barns + cameras */}
        <Card style={styles.card}>
          <View style={styles.cardHeadRow}>
            <Text style={styles.cardTitle}>Barns & Cameras</Text>
            <Feather name="plus-circle" size={20} color={colors.accent} onPress={onAddBarn} />
          </View>
          {farm.data?.barns.map((b, i, arr) => {
            const online = b.cameras.filter((c) => c.status === 'online').length;
            return (
              <View key={b.id} style={[styles.barnRow, i < arr.length - 1 && styles.divider]}>
                <StatusDot state={b.status} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.barnName}>{b.name}</Text>
                  <Text style={styles.barnMeta}>
                    {online}/{b.cameras.length} cameras · {b.birdCount.toLocaleString()} birds
                  </Text>
                </View>
              </View>
            );
          })}
          <PrimaryButton title="Add Barn" variant="secondary" onPress={onAddBarn} style={{ marginTop: spacing.md }} />
        </Card>

        {/* Alert preferences */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Alert Preferences</Text>
          <ToggleRow
            label="Piling alerts"
            value={prefs.pilingEnabled}
            onChange={(v) => update({ pilingEnabled: v })}
          />
          <ToggleRow
            label="Mortality alerts"
            value={prefs.mortalityEnabled}
            onChange={(v) => update({ mortalityEnabled: v })}
          />
          <ToggleRow
            label="Environment alerts"
            value={prefs.environmentEnabled}
            onChange={(v) => update({ environmentEnabled: v })}
          />
          <ToggleRow
            label="Activity alerts"
            value={prefs.activityEnabled}
            onChange={(v) => update({ activityEnabled: v })}
          />
          <ToggleRow
            label="System health"
            value={prefs.systemEnabled}
            onChange={(v) => update({ systemEnabled: v })}
          />
          <ToggleRow
            label="Quiet hours"
            sub={`${prefs.quietHoursStart}–${prefs.quietHoursEnd}`}
            value={prefs.quietHoursEnabled}
            onChange={(v) => update({ quietHoursEnabled: v })}
            last
          />
        </Card>

        {/* Thresholds */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Thresholds</Text>
          <StepperRow
            label="High temperature"
            value={prefs.tempHighC}
            unit="°C"
            onStep={(d) => update({ tempHighC: clamp(prefs.tempHighC + d, 20, 40) })}
            step={1}
          />
          <StepperRow
            label="High ammonia"
            value={prefs.ammoniaHighPpm}
            unit="ppm"
            onStep={(d) => update({ ammoniaHighPpm: clamp(prefs.ammoniaHighPpm + d, 10, 50) })}
            step={1}
            last
          />
        </Card>

        {/* Account */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>
          <Row label="Name" value={user?.name ?? '—'} />
          <Row label="Email" value={user?.email ?? '—'} last />
        </Card>

        <PrimaryButton title="Sign Out" variant="danger" onPress={onLogout} />
        <Text style={styles.version}>Nesteye Mobile v1.0.0 · Mock data mode</Text>
      </ScrollView>
    </Screen>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.divider]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function ToggleRow({
  label,
  sub,
  value,
  onChange,
  last,
}: {
  label: string;
  sub?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.divider]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.forest }}
        thumbColor={colors.surface}
      />
    </View>
  );
}

function StepperRow({
  label,
  value,
  unit,
  onStep,
  step,
  last,
}: {
  label: string;
  value: number;
  unit: string;
  onStep: (delta: number) => void;
  step: number;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.divider]}>
      <Text style={[styles.rowLabel, { flex: 1 }]}>{label}</Text>
      <View style={styles.stepper}>
        <Feather name="minus" size={18} color={colors.forest} onPress={() => onStep(-step)} />
        <Text style={styles.stepperValue}>
          {value}
          {unit}
        </Text>
        <Feather name="plus" size={18} color={colors.forest} onPress={() => onStep(step)} />
      </View>
    </View>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  headerWrap: { paddingTop: spacing.md, marginBottom: spacing.sm },
  card: { marginBottom: spacing.md },
  cardTitle: { ...typography.h3, fontSize: 15, marginBottom: spacing.sm },
  cardHeadRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { ...typography.body, flex: 1 },
  rowSub: { ...typography.caption, marginTop: 2 },
  rowValue: { ...typography.body, fontWeight: '600', color: colors.textSecondary, textAlign: 'right' },
  barnRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  barnName: { ...typography.body, fontWeight: '600' },
  barnMeta: { ...typography.caption, marginTop: 2 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepperValue: { ...typography.body, fontWeight: '700', minWidth: 52, textAlign: 'center' },
  version: { ...typography.caption, textAlign: 'center', marginTop: spacing.lg },
});
