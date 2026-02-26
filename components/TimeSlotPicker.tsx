import { BadgePercent, Clock, MessageSquare, Users } from 'lucide-react-native';
import React from 'react';
import { Linking, Text, TouchableOpacity, View } from 'react-native';
import { TimeSlot } from '../src/types';

interface TimeSlotPickerProps {
    timeSlots: (TimeSlot | string)[];
    selectedTime: string | null;
    onSelectTime: (time: string) => void;
    guestCount?: number;
    restaurantPhone?: string;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
    timeSlots,
    selectedTime,
    onSelectTime,
    guestCount = 1,
    restaurantPhone = ''
}) => {
    const isLargeGroup = guestCount >= 8;

    if (!timeSlots || timeSlots.length === 0) {
        return (
            <View className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200 items-center justify-center">
                <Text className="text-slate-400 font-medium mb-4 text-center">
                    Lo sentimos, no hay disponibilidad directa para este número de personas.
                </Text>

                {isLargeGroup && (
                    <TouchableOpacity
                        onPress={() => Linking.openURL(`https://wa.me/${restaurantPhone.replace(/\D/g, '')}`)}
                        className="bg-green-600 px-6 py-3 rounded-2xl flex-row items-center"
                    >
                        <MessageSquare size={18} color="white" />
                        <Text className="text-white font-bold ml-2">Hablar con el restaurante</Text>
                    </TouchableOpacity>
                )}
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
                    const timeValue = typeof slot === 'string' ? slot : slot.time;
                    const requiresDeposit = typeof slot === 'object' ? slot.requiresDeposit : false;
                    const isJoined = typeof slot === 'object' ? slot.isJoinedTable : false;
                    const isSelected = selectedTime === timeValue;

                    return (
                        <TouchableOpacity
                            key={timeValue}
                            activeOpacity={0.8}
                            onPress={() => onSelectTime(timeValue)}
                            className={`px-6 py-3 rounded-2xl border ${isSelected
                                ? 'bg-orange-600 border-orange-600 shadow-md shadow-orange-600/20'
                                : isJoined ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-slate-100 shadow-sm'
                                }`}
                        >
                            <Text className={`font-bold ${isSelected ? 'text-white' : isJoined ? 'text-indigo-700' : 'text-slate-700'}`}>
                                {timeValue}
                            </Text>

                            {isJoined && (
                                <View className="mt-1 flex-row items-center justify-center">
                                    <Users size={10} color={isSelected ? 'white' : '#4338ca'} />
                                    <Text className={`text-[8px] font-bold ml-1 ${isSelected ? 'text-white/80' : 'text-indigo-600 uppercase'}`}>
                                        Mesas Unidas
                                    </Text>
                                </View>
                            )}

                            {requiresDeposit && !isJoined && (
                                <View className="mt-1 flex-row items-center justify-center">
                                    <BadgePercent size={10} color={isSelected ? 'white' : '#ea580c'} />
                                    <Text className={`text-[8px] font-bold ml-1 ${isSelected ? 'text-white/80' : 'text-orange-600 uppercase'}`}>
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
