import React from 'react';
import { View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useTheme } from '@/theme/ThemeContext';

/** Compact inline trend line for cards. No axes, no labels. */
export function Sparkline({
  values,
  color,
  width = 96,
  height = 34,
}: {
  values: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  const { colors } = useTheme();
  const lineColor = color ?? colors.forest;
  if (values.length < 2) return <View style={{ width, height }} />;
  return (
    <View style={{ width, height }} pointerEvents="none">
      <LineChart
        data={values.map((v) => ({ value: v }))}
        width={width}
        height={height}
        thickness={2}
        color={lineColor}
        hideDataPoints
        hideAxesAndRules
        hideYAxisText
        curved
        adjustToWidth
        initialSpacing={0}
        endSpacing={0}
        disableScroll
        yAxisOffset={Math.min(...values)}
      />
    </View>
  );
}
