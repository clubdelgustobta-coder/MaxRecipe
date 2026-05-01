import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Linking,
    ActivityIndicator,
} from 'react-native';
import { login } from '../services/firebaseService';

const ADMIN_WHATSAPP = process.env.EXPO_PUBLIC_ADMIN_WHATSAPP || '';

// state: 'login' | 'sent'
export default function LoginScreen() {
    const [state, setState] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin() {
        if (!email.trim() || !password.trim()) {
            setError('Completá email y contraseña.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await login(email.trim(), password.trim());
            // onAuthChange en App.js detecta el cambio y desmonta esta pantalla
        } catch (e) {
            const msg = firebaseErrorMessage(e.code);
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    function handleRequestAccess() {
        const emailPart = email.trim() ? `%0AEmail%3A%20${encodeURIComponent(email.trim())}` : '';
        const text = `Hola%2C%20quiero%20acceder%20al%20Recetario%20Club%20del%20Gusto.${emailPart}`;
        const url = `https://wa.me/${ADMIN_WHATSAPP}?text=${text}`;
        Linking.openURL(url);
        setState('sent');
    }

    if (state === 'sent') {
        return (
            <View style={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.icon}>📩</Text>
                    <Text style={styles.title}>Solicitud enviada</Text>
                    <Text style={styles.subtitle}>
                        Una vez que el administrador te habilite, volvé aquí con tu email y contraseña.
                    </Text>
                    <TouchableOpacity style={styles.secondaryBtn} onPress={() => setState('login')}>
                        <Text style={styles.secondaryBtnText}>Volver al inicio de sesión</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.card}>
                <Text style={styles.icon}>🍝</Text>
                <Text style={styles.title}>Club del Gusto</Text>
                <Text style={styles.subtitle}>Recetario Personal</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#666"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    placeholderTextColor="#666"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                {error !== '' && <Text style={styles.error}>{error}</Text>}

                <TouchableOpacity
                    style={[styles.primaryBtn, loading && styles.btnDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.primaryBtnText}>Ingresar</Text>
                    }
                </TouchableOpacity>

                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>¿No tenés acceso?</Text>
                    <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                    style={[styles.whatsappBtn, !ADMIN_WHATSAPP && styles.btnDisabled]}
                    onPress={handleRequestAccess}
                    disabled={!ADMIN_WHATSAPP}
                >
                    <Text style={styles.whatsappBtnText}>💬  Solicitar acceso por WhatsApp</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.footer}>© 2009 – 2026 Club del Gusto</Text>
        </KeyboardAvoidingView>
    );
}

function firebaseErrorMessage(code) {
    switch (code) {
        case 'auth/invalid-email': return 'El email no es válido.';
        case 'auth/user-not-found': return 'No existe una cuenta con ese email.';
        case 'auth/wrong-password': return 'Contraseña incorrecta.';
        case 'auth/invalid-credential': return 'Email o contraseña incorrectos.';
        case 'auth/too-many-requests': return 'Demasiados intentos. Intentá más tarde.';
        case 'auth/user-disabled': return 'Esta cuenta está deshabilitada.';
        default: return 'Error al ingresar. Verificá tus datos.';
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f1e',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 32,
        width: '100%',
        maxWidth: 380,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    icon: { fontSize: 52, marginBottom: 12 },
    title: { color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: 1 },
    subtitle: {
        color: '#888',
        fontSize: 13,
        marginTop: 4,
        marginBottom: 28,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: '#0f0f1e',
        color: '#fff',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        width: '100%',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#2a2a45',
    },
    error: {
        color: '#ff6b6b',
        fontSize: 13,
        marginBottom: 10,
        textAlign: 'center',
    },
    primaryBtn: {
        backgroundColor: '#c0392b',
        borderRadius: 10,
        paddingVertical: 14,
        width: '100%',
        alignItems: 'center',
        marginTop: 4,
    },
    primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    btnDisabled: { opacity: 0.4 },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginVertical: 20,
        gap: 8,
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#2a2a45' },
    dividerText: { color: '#666', fontSize: 12 },
    whatsappBtn: {
        backgroundColor: '#25d366',
        borderRadius: 10,
        paddingVertical: 14,
        width: '100%',
        alignItems: 'center',
    },
    whatsappBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    secondaryBtn: {
        marginTop: 20,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderWidth: 1,
        borderColor: '#2a2a45',
        borderRadius: 10,
    },
    secondaryBtnText: { color: '#aaa', fontSize: 14 },
    footer: {
        color: '#333',
        fontSize: 11,
        marginTop: 32,
    },
});
