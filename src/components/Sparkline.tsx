import React from 'react';
import { View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { colors } from '@/theme';

/** Compact inline trend line for cards. No axes, no labels. */
export function Sparkline({
  values,
  color = colors.forest,
  width = 96,
  height = 34,
}: {
  values: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  if (values.length < 2) return <View style={{ width, height }} />;
  return (
    <View style={{ width, height }} pointerEvents="none">
      <LineChart
        data={values.map((v) => ({ value: v }))}
        width={width}
        height={height}
        thickness={2}
        color={color}
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
