/**
 * PieChart - Componente de gráfico de pizza com glass effect
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import { GlassContainer } from '../ui/GlassContainer';
import { COLORS } from '../../constants/theme';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: DataPoint[];
  title: string;
  size?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  style?: any;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  size = 200,
  showLabels = true,
  showLegend = true,
  style,
}) => {
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

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = size / 2 - 20;
  const centerX = size / 2;
  const centerY = size / 2;

  // Cores padrão caso não sejam fornecidas
  const defaultColors = [
    COLORS.primary.coral,
    COLORS.primary.teal,
    COLORS.semantic.warning,
    COLORS.semantic.success,
    COLORS.semantic.info,
    COLORS.semantic.error,
  ];

  // Calcular ângulos para cada fatia
  let currentAngle = -90; // Começar do topo
  const slices = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    const slice = {
      ...item,
      percentage,
      startAngle,
      endAngle,
      color: item.color || defaultColors[index % defaultColors.length],
    };

    currentAngle += angle;
    return slice;
  });

  // Função para converter graus em radianos
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  // Função para criar o path de uma fatia
  const createSlicePath = (startAngle: number, endAngle: number, radius: number) => {
    const startAngleRad = toRadians(startAngle);
    const endAngleRad = toRadians(endAngle);
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  // Função para calcular posição do texto
  const getTextPosition = (startAngle: number, endAngle: number, radius: number) => {
    const midAngle = (startAngle + endAngle) / 2;
    const midAngleRad = toRadians(midAngle);
    const textRadius = radius * 0.7;
    
    return {
      x: centerX + textRadius * Math.cos(midAngleRad),
      y: centerY + textRadius * Math.sin(midAngleRad),
    };
  };

  return (
    <GlassContainer variant="widget" style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.chartContainer}>
        <Svg width={size} height={size}>
          {/* Círculo de fundo */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke={COLORS.border.primary}
            strokeWidth="1"
            strokeDasharray="3,3"
          />

          {/* Fatias do gráfico */}
          {slices.map((slice, index) => (
            <React.Fragment key={index}>
              <Path
                d={createSlicePath(slice.startAngle, slice.endAngle, radius)}
                fill={slice.color}
                stroke={COLORS.background.primary}
                strokeWidth="2"
              />

              {/* Labels nas fatias */}
              {showLabels && slice.percentage > 5 && (
                <SvgText
                  x={getTextPosition(slice.startAngle, slice.endAngle, radius).x}
                  y={getTextPosition(slice.startAngle, slice.endAngle, radius).y}
                  fontSize="12"
                  fill={COLORS.background.primary}
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {slice.percentage.toFixed(0)}%
                </SvgText>
              )}
            </React.Fragment>
          ))}

          {/* Círculo central para criar um donut chart */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={radius * 0.4}
            fill={COLORS.background.primary}
            stroke={COLORS.border.primary}
            strokeWidth="1"
          />

          {/* Valor total no centro */}
          <SvgText
            x={centerX}
            y={centerY - 5}
            fontSize="16"
            fill={COLORS.text.primary}
            textAnchor="middle"
            fontWeight="bold"
          >
            {total.toFixed(0)}
          </SvgText>
          <SvgText
            x={centerX}
            y={centerY + 15}
            fontSize="10"
            fill={COLORS.text.secondary}
            textAnchor="middle"
          >
            Total
          </SvgText>
        </Svg>
      </View>

      {/* Legenda */}
      {showLegend && (
        <View style={styles.legend}>
          {slices.map((slice, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: slice.color }]} />
              <View style={styles.legendText}>
                <Text style={styles.legendLabel}>{slice.label}</Text>
                <Text style={styles.legendValue}>
                  {slice.value.toFixed(1)} ({slice.percentage.toFixed(1)}%)
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Estatísticas */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{data.length}</Text>
          <Text style={styles.statLabel}>Categorias</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {Math.max(...data.map(d => d.value)).toFixed(1)}
          </Text>
          <Text style={styles.statLabel}>Maior Valor</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {(total / data.length).toFixed(1)}
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
    alignItems: 'center',
    marginBottom: 16,
  },
  legend: {
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
  },
  legendLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  legendValue: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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