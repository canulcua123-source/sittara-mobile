import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    ChevronLeft,
    ChevronRight,
    Search,
    MessageCircle,
    Phone,
    Mail,
    HelpCircle,
    Calendar,
    CreditCard,
    User,
    MapPin,
    Star
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const FAQ_DATA: FAQItem[] = [
    {
        category: 'Reservaciones',
        question: '¿Cómo hago una reservación?',
        answer: 'Para hacer una reservación, busca el restaurante de tu preferencia, selecciona la fecha, hora y número de personas, elige tu mesa y confirma. ¡Es muy fácil!'
    },
    {
        category: 'Reservaciones',
        question: '¿Puedo cancelar mi reservación?',
        answer: 'Sí, puedes cancelar tu reservación desde la sección "Mis Reservas". Te recomendamos hacerlo con al menos 2 horas de anticipación para evitar cargos.'
    },
    {
        category: 'Reservaciones',
        question: '¿Qué pasa si llego tarde?',
        answer: 'Los restaurantes mantienen tu mesa por 15 minutos después de la hora reservada. Si vas a retrasarte, te recomendamos contactar al restaurante.'
    },
    {
        category: 'Pagos',
        question: '¿Cómo funciona el depósito?',
        answer: 'Algunos restaurantes solicitan un depósito al reservar, que se descuenta de tu cuenta final. Si cancelas a tiempo, el depósito se reembolsa automáticamente.'
    },
    {
        category: 'Pagos',
        question: '¿Qué métodos de pago aceptan?',
        answer: 'Aceptamos Visa, Mastercard y American Express. Puedes agregar y gestionar tus tarjetas desde tu perfil.'
    },
    {
        category: 'Cuenta',
        question: '¿Cómo cambio mi contraseña?',
        answer: 'Ve a Perfil > Privacidad y Seguridad > Recuperar Contraseña. Te enviaremos un enlace a tu correo para crear una nueva contraseña.'
    },
    {
        category: 'Cuenta',
        question: '¿Cómo elimino mi cuenta?',
        answer: 'Para eliminar tu cuenta, contacta a nuestro equipo de soporte. Ten en cuenta que esta acción es irreversible.'
    },
];

const CATEGORIES = [
    { id: 'all', name: 'Todo', icon: HelpCircle },
    { id: 'Reservaciones', name: 'Reservaciones', icon: Calendar },
    { id: 'Pagos', name: 'Pagos', icon: CreditCard },
    { id: 'Cuenta', name: 'Cuenta', icon: User },
];

export default function HelpCenterScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const filteredFAQ = FAQ_DATA.filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && (searchQuery === '' || matchesSearch);
    });

    const handleContactWhatsApp = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const url = 'https://wa.me/529991234567?text=Hola,%20necesito%20ayuda%20con%20Sittara';
        try {
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
            } else {
                // Si no puede abrir WhatsApp, copiar el número
                Toast.show({
                    type: 'info',
                    text1: 'WhatsApp no disponible',
                    text2: 'Contáctanos al +52 999 123 4567',
                });
            }
        } catch (error) {
            Toast.show({
                type: 'info',
                text1: 'WhatsApp no disponible',
                text2: 'Contáctanos al +52 999 123 4567',
            });
        }
    };

    const handleContactEmail = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const url = 'mailto:soporte@sittara.com?subject=Ayuda%20con%20Sittara';
        try {
            await Linking.openURL(url);
        } catch (error) {
            Toast.show({
                type: 'info',
                text1: 'No se pudo abrir el email',
                text2: 'Escríbenos a soporte@sittara.com',
            });
        }
    };

    const handleContactPhone = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const url = 'tel:+529991234567';
        try {
            await Linking.openURL(url);
        } catch (error) {
            Toast.show({
                type: 'info',
                text1: 'No se pudo llamar',
                text2: 'Marca al +52 999 123 4567',
            });
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white px-6 py-4 flex-row items-center border-b border-slate-100">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ChevronLeft size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-900">Centro de Ayuda</Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Search */}
                <View className="px-6 py-4">
                    <View className="flex-row items-center bg-white px-4 py-3 rounded-xl border border-slate-100">
                        <Search size={20} color="#94a3b8" />
                        <TextInput
                            className="flex-1 ml-3 text-slate-900"
                            placeholder="Buscar en preguntas frecuentes..."
                            placeholderTextColor="#94a3b8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* Categories */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="px-6 mb-4"
                >
                    {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = selectedCategory === cat.id;
                        return (
                            <TouchableOpacity
                                key={cat.id}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setSelectedCategory(cat.id);
                                }}
                                className={`mr-3 px-4 py-2 rounded-full flex-row items-center ${isSelected ? 'bg-orange-600' : 'bg-white'
                                    }`}
                            >
                                <Icon size={16} color={isSelected ? 'white' : '#64748b'} />
                                <Text className={`ml-2 font-medium ${isSelected ? 'text-white' : 'text-slate-600'
                                    }`}>{cat.name}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* FAQ */}
                <View className="px-6 mb-6">
                    <Text className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                        Preguntas Frecuentes
                    </Text>
                    {filteredFAQ.length === 0 ? (
                        <View className="bg-white rounded-2xl p-6 items-center">
                            <HelpCircle size={40} color="#cbd5e1" />
                            <Text className="text-slate-500 mt-3 text-center">
                                No encontramos resultados para tu búsqueda
                            </Text>
                        </View>
                    ) : (
                        filteredFAQ.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setExpandedIndex(expandedIndex === index ? null : index);
                                }}
                                className="bg-white rounded-2xl p-4 mb-3"
                            >
                                <View className="flex-row items-center justify-between">
                                    <Text className="flex-1 text-slate-900 font-medium pr-4">
                                        {item.question}
                                    </Text>
                                    <ChevronRight
                                        size={20}
                                        color="#94a3b8"
                                        style={{
                                            transform: [{ rotate: expandedIndex === index ? '90deg' : '0deg' }]
                                        }}
                                    />
                                </View>
                                {expandedIndex === index && (
                                    <Text className="text-slate-500 mt-3 leading-5">
                                        {item.answer}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {/* Contact Options */}
                <View className="px-6 mb-8">
                    <Text className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                        ¿Necesitas más ayuda?
                    </Text>

                    <TouchableOpacity
                        onPress={handleContactWhatsApp}
                        className="bg-green-500 rounded-2xl p-4 flex-row items-center mb-3"
                    >
                        <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
                            <MessageCircle size={24} color="white" />
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="text-white font-bold">WhatsApp</Text>
                            <Text className="text-white/80 text-sm">Respuesta inmediata</Text>
                        </View>
                        <ChevronRight size={20} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleContactEmail}
                        className="bg-white rounded-2xl p-4 flex-row items-center mb-3 border border-slate-100"
                    >
                        <View className="w-12 h-12 bg-orange-50 rounded-xl items-center justify-center">
                            <Mail size={24} color="#1f7a66" />
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="text-slate-900 font-bold">Email</Text>
                            <Text className="text-slate-500 text-sm">soporte@sittara.com</Text>
                        </View>
                        <ChevronRight size={20} color="#94a3b8" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleContactPhone}
                        className="bg-white rounded-2xl p-4 flex-row items-center border border-slate-100"
                    >
                        <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center">
                            <Phone size={24} color="#3b82f6" />
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="text-slate-900 font-bold">Teléfono</Text>
                            <Text className="text-slate-500 text-sm">+52 999 123 4567</Text>
                        </View>
                        <ChevronRight size={20} color="#94a3b8" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
