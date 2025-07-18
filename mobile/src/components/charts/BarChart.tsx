/**
 * BarChart - Componente de gráfico de barras com glass effect
 */

import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import Svg, { Rect, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { GlassContainer } from '../ui/GlassContainer';
import { COLORS } from '../../constants/theme';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: DataPoint[];
  title: string;
  yAxisLabel: string;
  height?: number;
  showValues?: boolean;
  horizontal?: boolean;
  style?: any;
}

const { width: screenWidth } = Dimensions.get('window');

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  yAxisLabel,
  height = 250,
  showValues = true,
  horizontal = false,
  style,
}) => {
  const chartWidth = screenWidth - 80;
  const chartHeight = height - 100;
  const padding = 40;

  if (!data || data.length === 0) {
    return (
      <GlassContainer variant="widget" style={[styles.container, style]}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>Sem dados para exibir</Text>
        </View>
      </GlassContainer>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const valueRange = maxValue - minValue;

  if (horizontal) {
    return renderHorizontalChart();
  }

  const barWidth = (chartWidth - 2 * padding) / data.length * 0.7;
  const barSpacing = (chartWidth - 2 * padding) / data.length * 0.3;

  function renderHorizontalChart() {
    const barHeight = (chartHeight - 2 * padding) / data.length * 0.7;
    const barSpacing = (chartHeight - 2 * padding) / data.length * 0.3;

    return (
      <GlassContainer variant="widget" style={[styles.container, style]}>
        <Text style={styles.title}>{title}</Text>
        
        <View style={styles.chartContainer}>
          <Svg width={chartWidth} height={chartHeight}>
            <Defs>
              {data.map((_, index) => (
                <LinearGradient key={index} id={`barGradient${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor={COLORS.primary.coral} stopOpacity="0.8" />
                  <Stop offset="100%" stopColor={COLORS.primary.teal} stopOpacity="0.8" />
                </LinearGradient>
              ))}
            </Defs>

            {data.map((item, index) => {
              const barLength = ((item.value - minValue) / valueRange) * (chartWidth - 2 * padding - 60);
              const y = padding + index * (barHeight + barSpacing);

              return (
                <React.Fragment key={index}>
                  {/* Barra */}
                  <Rect
                    x={60}
                    y={y}
                    width={barLength || 1}
                    height={barHeight}
                    fill={item.color || `url(#barGradient${index})`}
                    rx={4}
                    ry={4}
                  />

                  {/* Label do item */}
                  <SvgText
                    x={55}
                    y={y + barHeight / 2 + 4}
                    fontSize="12"
                    fill={COLORS.text.primary}
                    textAnchor="end"
                    fontWeight="600"
                  >
                    {item.label}
                  </SvgText>

                  {/* Valor */}
                  {showValues && (
                    <SvgText
                      x={65 + barLength}
                      y={y + barHeight / 2 + 4}
                      fontSize="11"
                      fill={COLORS.text.secondary}
                      textAnchor="start"
                    >
                      {item.value.toFixed(1)}
                    </SvgText>
                  )}
                </React.Fragment>
              );
            })}
          </Svg>
        </View>

        {renderStats()}
      </GlassContainer>
    );
  }

  return (
    <GlassContainer variant="widget" style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            {data.map((_, index) => (
              <LinearGradient key={index} id={`barGradient${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={COLORS.primary.coral} stopOpacity="0.8" />
                <Stop offset="100%" stopColor={COLORS.primary.teal} stopOpacity="0.8" />
              </LinearGradient>
            ))}
          </Defs>

          {data.map((item, index) => {
            const barHeight = ((item.value - minValue) / valueRange) * (chartHeight - 2 * padding);
            const x = padding + index * (barWidth + barSpacing);
            const y = chartHeight - padding - barHeight;

            return (
              <React.Fragment key={index}>
                {/* Barra */}
                <Rect
                  x={x}
                  y={y || chartHeight - padding - 1}
                  width={barWidth}
                  height={barHeight || 1}
                  fill={item.color || `url(#barGradient${index})`}
                  rx={4}
                  ry={4}
                />

                {/* Label do item */}
                <SvgText
                  x={x + barWidth / 2}
                  y={chartHeight - 10}
                  fontSize="10"
                  fill={COLORS.text.secondary}
                  textAnchor="middle"
                  fontWeight="500"
                >
                  {item.label.length > 8 ? item.label.substring(0, 8) + '...' : item.label}
                </SvgText>

                {/* Valor */}
                {showValues && (
                  <SvgText
                    x={x + barWidth / 2}
                    y={y - 5}
                    fontSize="11"
                    fill={COLORS.text.primary}
                    textAnchor="middle"
                    fontWeight="600"
                  >
                    {item.value.toFixed(1)}
                  </SvgText>
                )}
              </React.Fragment>
            );
          })}

          {/* Eixo Y - labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const value = minValue + valueRange * ratio;
            const y = chartHeight - padding - ratio * (chartHeight - 2 * padding);
            
            return (
              <SvgText
                key={index}
                x={padding - 10}
                y={y + 4}
                fontSize="10"
                fill={COLORS.text.secondary}
                textAnchor="end"
              >
                {value.toFixed(1)}
              </SvgText>
            );
          })}
        </Svg>

        {/* Label do eixo Y */}
        <View style={styles.yAxisLabel}>
          <Text style={styles.axisLabelText}>{yAxisLabel}</Text>
        </View>
      </View>

      {renderStats()}
    </GlassContainer>
  );

  function renderStats() {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const average = total / data.length;
    const max = Math.max(...data.map(d => d.value));

    return (
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{total.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{average.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Média</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{max.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Máximo</Text>
        </View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  yAxisLabel: {
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: [{ rotate: '-90deg' }],
  },
  axisLabelText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.primary,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  emptyChart: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
});