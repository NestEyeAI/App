import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { colors, radius, spacing, typography } from '@/theme';

export interface TrendPoint {
  value: number;
  label?: string;
}

interface TrendChartProps {
  data: TrendPoint[];
  color?: string;
  height?: number;
  /** Optional reference line (e.g. Cobb 500 target). */
  reference?: TrendPoint[];
  referenceColor?: string;
  suffix?: string;
  caption?: string;
}

/**
 * Thin wrapper around gifted-charts LineChart with Nesteye styling.
 * Keeps chart config in one place so every trend looks consistent.
 */
export function TrendChart({
  data,
  color = colors.forest,
  height = 160,
  reference,
  referenceColor = colors.accent,
  suffix = '',
  caption,
}: TrendChartProps) {
  if (!data.length) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={typography.caption}>No data yet</Text>
      </View>
    );
  }

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.15 || 1;

  return (
    <View>
      <LineChart
        data={data.map((d) => ({ value: d.value, label: d.label }))}
        data2={reference?.map((d) => ({ value: d.value }))}
        height={height}
        thickness={2.5}
        color1={color}
        color2={referenceColor}
        dataPointsColor1={color}
        hideDataPoints2
        curved
        areaChart
        startFillColor1={color}
        startOpacity={0.18}
        endOpacity={0.01}
        yAxisOffset={Math.max(0, min - pad)}
        maxValue={max + pad}
        noOfSections={4}
        yAxisColor="transparent"
        xAxisColor={colors.border}
        rulesColor={colors.border}
        rulesType="dashed"
        yAxisTextStyle={styles.axisText}
        xAxisLabelTextStyle={styles.axisText}
        hideRules={false}
        initialSpacing={12}
        endSpacing={8}
        adjustToWidth
        yAxisLabelSuffix={suffix}
        disableScroll
      />
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
  },
  axisText: { color: colors.textMuted, fontSize: 10 },
  caption: { ...typography.caption, marginTop: spacing.sm, textAlign: 'center' },
});
