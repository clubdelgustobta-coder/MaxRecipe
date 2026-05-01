import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet,
    TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllUsers } from '../services/firestoreService';

function formatDate(ts) {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export default function AdminScreen({ navigation }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        try {
            const data = await getAllUsers();
            data.sort((a, b) => {
                const ta = a.lastLogin?.toMillis?.() ?? 0;
                const tb = b.lastLogin?.toMillis?.() ?? 0;
                return tb - ta;
            });
            setUsers(data);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const onRefresh = () => { setRefreshing(true); load(); };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <View>
                    <Text style={styles.title}>Panel Admin</Text>
                    <Text style={styles.sub}>{users.length} usuarios registrados</Text>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator color="#c0392b" size="large" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={u => u.uid}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#c0392b" />}
                    renderItem={({ item, index }) => (
                        <View style={styles.row}>
                            <View style={styles.rowIndex}>
                                <Text style={styles.indexText}>{index + 1}</Text>
                            </View>
                            <View style={styles.rowBody}>
                                <Text style={styles.email}>{item.email}</Text>
                                <Text style={styles.date}>Último ingreso: {formatDate(item.lastLogin)}</Text>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text style={styles.empty}>Aún no hay usuarios registrados.</Text>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0f1e' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#1a1a2e',
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a45',
    },
    backBtn: { padding: 8 },
    backText: { color: '#fff', fontSize: 22 },
    title: { color: '#fff', fontSize: 20, fontWeight: '800' },
    sub: { color: '#888', fontSize: 12, marginTop: 2 },
    list: { padding: 16, gap: 10 },
    row: {
        flexDirection: 'row',
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        overflow: 'hidden',
    },
    rowIndex: {
        width: 44,
        backgroundColor: '#c0392b',
        justifyContent: 'center',
        alignItems: 'center',
    },
    indexText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    rowBody: { flex: 1, padding: 14 },
    email: { color: '#fff', fontSize: 14, fontWeight: '600' },
    date: { color: '#888', fontSize: 12, marginTop: 4 },
    empty: { color: '#555', textAlign: 'center', marginTop: 40 },
});
