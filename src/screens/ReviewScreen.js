import React, { useState, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet,
} from 'react-native';
import DriveImage from '../components/DriveImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useRecipes } from '../context/RecipesContext';
import { getFlaggedIds } from '../services/flagService';
import { SALSA_COLORS, INGREDIENTE_COLORS } from '../data/recipes';

export default function ReviewScreen({ navigation }) {
    const { recipes } = useRecipes();
    const [flaggedIds, setFlaggedIds] = useState(new Set());

    useFocusEffect(useCallback(() => {
        getFlaggedIds().then(setFlaggedIds);
    }, []));

    const flagged = recipes.filter(r => flaggedIds.has(r.id));

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Mis Preferencias</Text>
                    <Text style={styles.headerSub}>{flagged.length} receta{flagged.length !== 1 ? 's' : ''} preferida{flagged.length !== 1 ? 's' : ''}</Text>
                </View>
            </View>

            <FlatList
                data={flagged}
                keyExtractor={item => String(item.id)}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <Text style={styles.empty}>No hay recetas en tus preferencias</Text>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('RecipeDetail', {
                            startIndex: flagged.findIndex(r => r.id === item.id),
                            recipeIds: flagged.map(r => r.id),
                        })}
                    >
                        <DriveImage uri={item.image} style={styles.cardImage} />
                        <View style={styles.cardLeft}>
                            <Text style={styles.cardCode}>{item.code} · {item.date}</Text>
                            <Text style={styles.cardName}>{item.name}</Text>
                            <View style={styles.badges}>
                                <View style={[styles.badge, { backgroundColor: SALSA_COLORS[item.salsa] || '#888' }]}>
                                    <Text style={styles.badgeText}>{item.salsa}</Text>
                                </View>
                                <View style={[styles.badge, { backgroundColor: INGREDIENTE_COLORS[item.ingrediente] || '#555' }]}>
                                    <Text style={styles.badgeText}>{item.ingrediente}</Text>
                                </View>
                            </View>
                            {item.description ? (
                                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                            ) : null}
                        </View>
                    </TouchableOpacity>
                )}
            />
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
    list: { padding: 16, paddingBottom: 32, paddingTop: 12 },
    empty: { color: '#555', textAlign: 'center', marginTop: 60, fontSize: 15 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        marginBottom: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#2a2a40',
    },
    cardImage: { width: 90, height: 90 },
    cardLeft: { flex: 1, padding: 12 },
    cardCode: { color: '#888', fontSize: 11, fontWeight: '600', marginBottom: 3 },
    cardName: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 8 },
    badges: { flexDirection: 'row', gap: 6 },
    badge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: '600' },
    cardDesc: { color: '#999', fontSize: 12, lineHeight: 17, marginTop: 8, fontStyle: 'italic' },
});
