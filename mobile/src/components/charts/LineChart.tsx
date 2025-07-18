/**
 * LineChart - Componente de gráfico de linha com glass effect
 */

import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import Svg, { Polyline, Circle, Text as SvgText, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { GlassContainer } from '../ui/GlassContainer';
import { COLORS } from '../../constants/theme';

interface DataPoint {
  x: number;
  y: number;
  label?: string;
  date?: string;
}

interface LineChartProps {
  data: DataPoint[];
  title: string;
  yAxisLabel: string;
  color?: string;
  height?: number;
  showGradient?: boolean;
  showDots?: boolean;
  showLabels?: boolean;
  style?: any;
}

const { width: screenWidth } = Dimensions.get('window');

export const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  yAxisLabel,
  color = COLORS.primary.coral,
  height = 200,
  showGradient = true,
  showDots = true,
  showLabels = true,
  style,
}) => {
  const chartWidth = screenWidth - 80; // Padding das laterais
  const chartHeight = height - 60; // Espaço para labels
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

  // Calcular limites dos dados
  const minX = Math.min(...data.map(d => d.x));
  const maxX = Math.max(...data.map(d => d.x));
  const minY = Math.min(...data.map(d => d.y));
  const maxY = Math.max(...data.map(d => d.y));

  // Adicionar margem aos valores Y
  const yRange = maxY - minY;
  const yMargin = yRange * 0.1;
  const adjustedMinY = minY - yMargin;
  const adjustedMaxY = maxY + yMargin;

  // Função para converter coordenadas de dados para coordenadas do SVG
  const scaleX = (x: number) => 
    padding + ((x - minX) / (maxX - minX)) * (chartWidth - 2 * padding);
  
  const scaleY = (y: number) => 
    chartHeight - padding - ((y - adjustedMinY) / (adjustedMaxY - adjustedMinY)) * (chartHeight - 2 * padding);

  // Gerar pontos para a linha
  const linePoints = data.map(point => `${scaleX(point.x)},${scaleY(point.y)}`).join(' ');

  // Gerar pontos para a área de gradiente
  const areaPoints = [
    `${scaleX(minX)},${chartHeight - padding}`, // Início na base
    ...data.map(point => `${scaleX(point.x)},${scaleY(point.y)}`),
    `${scaleX(maxX)},${chartHeight - padding}`, // Fim na base
  ].join(' ');

  // Gerar labels do eixo Y
  const yLabels = [];
  const labelCount = 5;
  for (let i = 0; i <= labelCount; i++) {
    const value = adjustedMinY + (adjustedMaxY - adjustedMinY) * (i / labelCount);
    const y = scaleY(value);
    yLabels.push(
      <SvgText
        key={i}
        x={padding - 10}
        y={y + 4}
        fontSize="10"
        fill={COLORS.text.secondary}
        textAnchor="end"
      >
        {value.toFixed(1)}
      </SvgText>
    );
  }

  // Gerar labels do eixo X (datas)
  const xLabels = data
    .filter((_, index) => index % Math.ceil(data.length / 5) === 0) // Mostrar apenas algumas labels
    .map((point, index) => (
      <SvgText
        key={index}
        x={scaleX(point.x)}
        y={chartHeight - 10}
        fontSize="10"
        fill={COLORS.text.secondary}
        textAnchor="middle"
      >
        {point.date || point.x.toString()}
      </SvgText>
    ));

  return (
    <GlassContainer variant="widget" style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            {/* Gradiente para a área */}
            <LinearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <Stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </LinearGradient>
          </Defs>

          {/* Linhas de grade horizontais */}
          {[0, 1, 2, 3, 4].map(i => {
            const y = padding + (i * (chartHeight - 2 * padding)) / 4;
            return (
              <Path
                key={i}
                d={`M ${padding} ${y} L ${chartWidth - padding} ${y}`}
                stroke={COLORS.border.primary}
                strokeWidth="0.5"
                strokeDasharray="3,3"
              />
            );
          })}

          {/* Área com gradiente */}
          {showGradient && data.length > 1 && (
            <Polyline
              points={areaPoints}
              fill="url(#areaGradient)"
              stroke="none"
            />
          )}

          {/* Linha principal */}
          {data.length > 1 && (
            <Polyline
              points={linePoints}
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Pontos de dados */}
          {showDots && data.map((point, index) => (
            <Circle
              key={index}
              cx={scaleX(point.x)}
              cy={scaleY(point.y)}
              r="4"
              fill={color}
              stroke={COLORS.background.primary}
              strokeWidth="2"
            />
          ))}

          {/* Labels dos eixos */}
          {showLabels && (
            <>
              {yLabels}
              {xLabels}
            </>
          )}
        </Svg>

        {/* Label do eixo Y */}
        <View style={styles.yAxisLabel}>
          <Text style={styles.axisLabelText}>{yAxisLabel}</Text>
        </View>
      </View>

      {/* Estatísticas */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {data.length > 0 ? data[data.length - 1].y.toFixed(1) : '0'}
          </Text>
          <Text style={styles.statLabel}>Atual</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {maxY.toFixed(1)}
          </Text>
          <Text style={styles.statLabel}>Máximo</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {(data.reduce((sum, point) => sum + point.y, 0) / data.length).toFixed(1)}
          </Text>
          <Text style={styles.statLabel}>Média</Text>
        </View>
      </View>
    </GlassContainer>
  );
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