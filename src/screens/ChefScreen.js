import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, StyleSheet,
    TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loadChef } from '../services/sheetsService';
import DriveImage, { getDriveImageSize } from '../components/DriveImage';

function ProportionalImage({ uri, defaultRatio = 4 / 3, style }) {
    const [aspectRatio, setAspectRatio] = useState(defaultRatio);

    useEffect(() => {
        if (uri) getDriveImageSize(uri, (w, h) => { if (h > 0) setAspectRatio(w / h); });
    }, [uri]);

    return <DriveImage uri={uri} style={[style, { aspectRatio }]} resizeMode="cover" />;
}

export default function ChefScreen({ navigation }) {
    const [data, setData] = useState({ items: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadChef().then(d => {
            setData(d);
            setLoading(false);
        });
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>El Chef</Text>
                    <Text style={styles.headerSub}>Club del Gusto</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator color="#c8102e" size="large" />
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                    {data.items.map((item, i) => {
                        if (item.tipo === 'titulo_madre') {
                            return <Text key={i} style={styles.tituloPrincipal}>{item.valor}</Text>;
                        }
                        if (item.tipo === 'titulo_paraf') {
                            return <Text key={i} style={styles.sectionTitle}>{item.valor}</Text>;
                        }
                        if (item.tipo === 'texto') {
                            return <Text key={i} style={styles.sectionText}>{item.valor}</Text>;
                        }
                        if (item.tipo === 'foto_url') {
                            return (
                                <ProportionalImage
                                    key={i}
                                    uri={item.valor}
                                    defaultRatio={4 / 3}
                                    style={styles.sectionImage}
                                />
                            );
                        }
                        if (item.tipo === 'foto_url_vertical') {
                            return (
                                <ProportionalImage
                                    key={i}
                                    uri={item.valor}
                                    defaultRatio={3 / 5}
                                    style={styles.sectionImage}
                                />
                            );
                        }
                        return null;
                    })}

                    {data.items.length === 0 && !loading && (
                        <Text style={styles.empty}>Contenido próximamente...</Text>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0f1e' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 14,
    },
    backBtn: {
        backgroundColor: '#2a2a40',
        borderRadius: 20, width: 36, height: 36,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: '#3a3a50',
    },
    backText: { color: '#fff', fontSize: 18 },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
    headerSub: { color: '#aaa', fontSize: 12, marginTop: 2 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scroll: { padding: 20, paddingBottom: 40 },
    tituloPrincipal: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: 0.5,
        marginBottom: 28,
        textAlign: 'center',
    },
    sectionImage: {
        width: '100%',
        borderRadius: 14,
        marginBottom: 20,
        backgroundColor: '#1a1a2e',
    },
    sectionTitle: {
        color: '#c8a610',
        fontSize: 16,
        fontWeight: '700',
        marginTop: 12,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    sectionText: {
        color: '#bbb',
        fontSize: 15,
        lineHeight: 21,
        textAlign: 'justify',
        marginBottom: 16,
    },
    empty: { color: '#555', textAlign: 'center', marginTop: 60, fontSize: 15 },
});
