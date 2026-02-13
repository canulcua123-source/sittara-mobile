import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Clock } from 'lucide-react-native';
import { TimeSlot } from '../src/types';

interface TimeSlotPickerProps {
    timeSlots: (TimeSlot | string)[];
    selectedTime: string | null;
    onSelectTime: (time: string) => void;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ timeSlots, selectedTime, onSelectTime }) => {
    if (!timeSlots || timeSlots.length === 0) {
        return (
            <View className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200 items-center justify-center">
                <Text className="text-slate-400 font-medium">No hay horarios disponibles</Text>
            </View>
        );
    }

    return (
        <View className="space-y-4">
            <View className="flex-row items-center mb-4">
                <Clock size={18} color="#64748b" />
                <Text className="ml-2 text-slate-700 font-bold">Horarios Disponibles</Text>
            </View>

            <View className="flex-row flex-wrap gap-3">
                {timeSlots.map((slot) => {
                    // Normalizar: el backend puede enviar strings ("13:00") u objetos ({ time: "13:00" })
                    const timeValue = typeof slot === 'string' ? slot : slot.time;
                    const requiresDeposit = typeof slot === 'object' ? slot.requiresDeposit : false;
                    const isSelected = selectedTime === timeValue;

                    return (
                        <TouchableOpacity
                            key={timeValue}
                            activeOpacity={0.8}
                            onPress={() => onSelectTime(timeValue)}
                            className={`px-6 py-3 rounded-2xl border ${isSelected
                                ? 'bg-orange-600 border-orange-600 shadow-md shadow-orange-600/20'
                                : 'bg-white border-slate-100 shadow-sm'
                                }`}
                        >
                            <Text className={`font-bold ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                                {timeValue}
                            </Text>
                            {requiresDeposit && (
                                <View className="mt-1 flex-row items-center justify-center">
                                    <View className={`w-1 h-1 rounded-full mr-1 ${isSelected ? 'bg-white' : 'bg-orange-600'}`} />
                                    <Text className={`text-[8px] font-bold ${isSelected ? 'text-white/80' : 'text-orange-600 uppercase'}`}>
                                        Anticipo
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};
