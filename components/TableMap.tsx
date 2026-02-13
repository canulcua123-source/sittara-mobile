import React from 'react';
import { View, Text, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import Svg, { Rect, Circle, G, Text as SvgText } from 'react-native-svg';
import { Users, Layout } from 'lucide-react-native';
import { Table } from '../src/types';

interface TableMapProps {
    tables: Table[];
    selectedTableId?: string;
    onTableSelect: (table: Table) => void;
    isLoading?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_WIDTH = 800;
const MAP_HEIGHT = 600;

export const TableMap: React.FC<TableMapProps> = ({ tables, selectedTableId, onTableSelect, isLoading }) => {
    // Zoom and Pan states removed for stability, using ScrollView instead


    const getStatusColor = (status: string, isSelected: boolean) => {
        if (isSelected) return '#1f7a66'; // primary-orange
        switch (status) {
            case 'available': return '#22c55e'; // green
            case 'reserved': return '#eab308'; // yellow
            case 'occupied': return '#ef4444'; // red
            case 'blocked': return '#94a3b8'; // slate
            default: return '#cbd5e1'; // slate-light
        }
    };

    const getTableOpacity = (status: string) => {
        if (status === 'available') return 1;
        return 0.6;
    };

    if (isLoading) {
        return (
            <View className="h-64 items-center justify-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <ActivityIndicator color="#1f7a66" />
                <Text className="mt-4 text-slate-500 font-medium">Cargando mapa...</Text>
            </View>
        );
    }

    return (
        <View className="space-y-4">
            <View className="flex-row items-center justify-between bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm mb-4">
                <View className="flex-row items-center">
                    <Layout size={18} color="#64748b" />
                    <Text className="ml-2 text-slate-700 font-bold">Mapa de Mesas</Text>
                </View>
                <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pinch p/ Zoom</Text>
            </View>

            <View className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 h-96 relative">
                <ScrollView horizontal showsHorizontalScrollIndicator={true} persistentScrollbar>
                    <ScrollView showsVerticalScrollIndicator={true} persistentScrollbar>
                        <View style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}>
                            <Svg width={MAP_WIDTH} height={MAP_HEIGHT} viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}>
                                {/* Floor Plan decorations */}
                                <Rect x="300" y="0" width="200" height="40" fill="#f1f5f9" rx="10" />
                                <SvgText x="400" y="25" textAnchor="middle" fontSize="14" fill="#94a3b8" fontWeight="bold">ENTRADA</SvgText>

                                <Rect x="650" y="500" width="120" height="80" fill="#f1f5f9" rx="10" />
                                <SvgText x="710" y="545" textAnchor="middle" fontSize="14" fill="#94a3b8" fontWeight="bold">COCINA</SvgText>

                                {/* Tables */}
                                {tables.map((table) => {
                                    const isSelected = selectedTableId === table.id;
                                    const color = getStatusColor(table.status || 'available', isSelected);
                                    const opacity = getTableOpacity(table.status || 'available');

                                    return (
                                        <G
                                            key={table.id}
                                            onPress={() => table.status === 'available' && onTableSelect(table)}
                                        >
                                            {table.shape === 'round' ? (
                                                <Circle
                                                    cx={table.x + 40 + (table.width || 60) / 2}
                                                    cy={table.y + 60 + (table.height || 60) / 2}
                                                    r={(table.width || 60) / 2}
                                                    fill={isSelected ? color : 'white'}
                                                    stroke={color}
                                                    strokeWidth={isSelected ? 4 : 2}
                                                    opacity={opacity}
                                                />
                                            ) : (
                                                <Rect
                                                    x={table.x + 40}
                                                    y={table.y + 60}
                                                    width={table.width || 60}
                                                    height={table.height || 60}
                                                    rx={10}
                                                    fill={isSelected ? color : 'white'}
                                                    stroke={color}
                                                    strokeWidth={isSelected ? 4 : 2}
                                                    opacity={opacity}
                                                />
                                            )}

                                            {/* Table Number */}
                                            <SvgText
                                                x={table.x + 40 + (table.width || 60) / 2}
                                                y={table.y + 60 + (table.height || 60) / 2 + 5}
                                                textAnchor="middle"
                                                fontSize="16"
                                                fontWeight="bold"
                                                fill={isSelected ? 'white' : color}
                                            >
                                                {table.number}
                                            </SvgText>

                                            {/* Capacity Info */}
                                            <SvgText
                                                x={table.x + 40 + (table.width || 60) / 2}
                                                y={table.y + 60 + (table.height || 60) / 2 + 20}
                                                textAnchor="middle"
                                                fontSize="10"
                                                fill={isSelected ? 'white' : '#94a3b8'}
                                            >
                                                {table.capacity}p
                                            </SvgText>
                                        </G>
                                    );
                                })}
                            </Svg>
                        </View>
                    </ScrollView>
                </ScrollView>
            </View>

            {/* Legend */}
            <View className="flex-row flex-wrap justify-between mt-4">
                <View className="flex-row items-center mr-4 mb-2">
                    <View className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                    <Text className="text-xs text-slate-500 font-medium">Libre</Text>
                </View>
                <View className="flex-row items-center mr-4 mb-2">
                    <View className="w-3 h-3 rounded-full bg-orange-600 mr-2" />
                    <Text className="text-xs text-slate-500 font-medium">Seleccionada</Text>
                </View>
                <View className="flex-row items-center mr-4 mb-2">
                    <View className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                    <Text className="text-xs text-slate-500 font-medium">Ocupada</Text>
                </View>
                <View className="flex-row items-center mb-2">
                    <View className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
                    <Text className="text-xs text-slate-500 font-medium">Reservada</Text>
                </View>
            </View>
        </View>
    );
};
