import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

export default function TermsScreen() {
    const router = useRouter();

    const sections = [
        {
            title: '1. Aceptación de Términos',
            content: `Al descargar, instalar o usar la aplicación Sittara, usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al servicio.`
        },
        {
            title: '2. Descripción del Servicio',
            content: `Sittara es una plataforma que facilita la reservación de mesas en restaurantes participantes en Mérida, Yucatán. Actuamos como intermediarios entre usted (el usuario) y los restaurantes.`
        },
        {
            title: '3. Cuenta de Usuario',
            content: `Para usar ciertas funciones de Sittara, debe crear una cuenta proporcionando información veraz y actualizada. Usted es responsable de mantener la confidencialidad de su contraseña y de todas las actividades que ocurran bajo su cuenta.`
        },
        {
            title: '4. Reservaciones',
            content: `Las reservaciones están sujetas a disponibilidad. Una vez confirmada una reservación, se espera que el usuario asista puntualmente. El incumplimiento reiterado de reservaciones puede resultar en restricciones a su cuenta.`
        },
        {
            title: '5. Política de Cancelación',
            content: `Las cancelaciones deben realizarse con al menos 2 horas de anticipación. Algunos restaurantes pueden requerir un depósito que será reembolsable bajo las condiciones específicas de cada establecimiento.`
        },
        {
            title: '6. Pagos',
            content: `Los pagos realizados a través de Sittara son procesados de forma segura mediante proveedores de pago certificados. Los depósitos se manejan según la política de cada restaurante.`
        },
        {
            title: '7. Privacidad',
            content: `Respetamos su privacidad. La recopilación y uso de información personal se rige por nuestra Política de Privacidad, disponible en la aplicación y en nuestro sitio web.`
        },
        {
            title: '8. Propiedad Intelectual',
            content: `Todo el contenido de Sittara, incluyendo textos, gráficos, logos, iconos e imágenes, es propiedad de Sittara o sus licenciantes y está protegido por las leyes de propiedad intelectual.`
        },
        {
            title: '9. Limitación de Responsabilidad',
            content: `Sittara actúa únicamente como intermediario. No somos responsables por la calidad del servicio, comida o experiencia proporcionada por los restaurantes. Las disputas deben resolverse directamente con el establecimiento.`
        },
        {
            title: '10. Modificaciones',
            content: `Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación. El uso continuado del servicio constituye aceptación de los términos modificados.`
        },
        {
            title: '11. Contacto',
            content: `Para cualquier pregunta sobre estos Términos y Condiciones, puede contactarnos en soporte@sittara.com o a través de la sección de ayuda en la aplicación.`
        },
    ];

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white px-6 py-4 flex-row items-center border-b border-slate-100">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ChevronLeft size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-900">Términos y Condiciones</Text>
            </View>

            <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
                <View className="bg-white rounded-2xl p-6 mb-6">
                    <Text className="text-slate-500 text-sm mb-4">
                        Última actualización: Febrero 2026
                    </Text>
                    <Text className="text-slate-700 leading-6">
                        Bienvenido a Sittara. Al utilizar nuestra aplicación, usted acepta cumplir
                        con los siguientes términos y condiciones. Por favor, léalos detenidamente.
                    </Text>
                </View>

                {sections.map((section, index) => (
                    <View key={index} className="bg-white rounded-2xl p-5 mb-3">
                        <Text className="text-slate-900 font-bold mb-2">{section.title}</Text>
                        <Text className="text-slate-600 leading-6">{section.content}</Text>
                    </View>
                ))}

                <View className="items-center py-8">
                    <Text className="text-slate-400 text-sm text-center">
                        © 2024 Sittara. Todos los derechos reservados.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
