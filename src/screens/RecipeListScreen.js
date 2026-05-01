import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
    View, Text, FlatList, TextInput, TouchableOpacity,
    Image, StyleSheet, ScrollView, Modal, BackHandler, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { SALSA_COLORS, INGREDIENTE_COLORS } from '../data/recipes';
import { useRecipes } from '../context/RecipesContext';
import { getFlaggedIds } from '../services/flagService';
import DriveImage from '../components/DriveImage';
import { logout, auth } from '../services/firebaseService';
import { ADMIN_UID } from '../config/appConfig';

// Familias fijas — incluye las futuras aunque aún no tengan recetas
const CATEGORY_OPTIONS = ['Todas', 'Pasta', 'Pasta Rellena', 'Cannelloni', 'Lasagna', 'Risotto'];
const INGREDIENTE_OPTIONS = ['Todos', 'Veggie', 'Tierra', 'Mar', 'Mixta', 'Pollo'];
// SALSA_FILTERS se construye dinámicamente desde los datos del context

function Dropdown({ label, value, options, onSelect, accentColor }) {
    const [open, setOpen] = useState(false);
    const isFiltered = value !== options[0];

    return (
        <>
            <TouchableOpacity
                style={[styles.dropdownBtn, isFiltered && { borderColor: accentColor }]}
                onPress={() => setOpen(true)}
                activeOpacity={0.8}
            >
                <Text style={[styles.dropdownLabel, isFiltered && { color: accentColor }]}>
                    {label}
                </Text>
                <Text style={[styles.dropdownValue, isFiltered && { color: '#fff' }]} numberOfLines={1}>
                    {value} ▾
                </Text>
            </TouchableOpacity>

            <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>{label}</Text>
                        {options.map(opt => (
                            <TouchableOpacity
                                key={opt}
                                style={[styles.modalOption, value === opt && { backgroundColor: '#1e1e40' }]}
                                onPress={() => { onSelect(opt); setOpen(false); }}
                            >
                                <Text style={[styles.modalOptionText, value === opt && { color: accentColor, fontWeight: '700' }]}>
                                    {opt}
                                </Text>
                                {value === opt && <Text style={{ color: accentColor }}>✓</Text>}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

export default function RecipeListScreen({ navigation }) {
    const { recipes } = useRecipes();
    const [flagCount, setFlagCount] = useState(0);

    useFocusEffect(useCallback(() => {
        getFlaggedIds().then(ids => setFlagCount(ids.size));
    }, []));
    const SALSA_FILTERS = useMemo(() => ['Todas', ...new Set(recipes.map(r => r.salsa))], [recipes]);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('Todas');
    const [activeIngrediente, setActiveIngrediente] = useState('Todos');
    const [activeSalsa, setActiveSalsa] = useState('Todas');
    const flatListRef = useRef(null);

    useEffect(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, [search, activeCategory, activeIngrediente, activeSalsa]);

    const filtered = useMemo(() => {
        return recipes.filter(r => {
            const matchSearch =
                r.name.toLowerCase().includes(search.toLowerCase()) ||
                r.description.toLowerCase().includes(search.toLowerCase());
            const matchCategory = activeCategory === 'Todas' || r.category === activeCategory;
            const matchIngrediente = activeIngrediente === 'Todos' || r.ingrediente === activeIngrediente;
            const matchSalsa = activeSalsa === 'Todas' || r.salsa === activeSalsa;
            return matchSearch && matchCategory && matchIngrediente && matchSalsa;
        });
    }, [recipes, search, activeCategory, activeIngrediente, activeSalsa]);

    const hasActiveFilters = activeCategory !== 'Todas' || activeIngrediente !== 'Todos' || activeSalsa !== 'Todas';

    const clearFilters = () => {
        setActiveCategory('Todas');
        setActiveIngrediente('Todos');
        setActiveSalsa('Todas');
    };

    const renderRecipe = useCallback(({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('RecipeDetail', {
                startIndex: filtered.findIndex(r => r.id === item.id),
                recipeIds: filtered.map(r => r.id),
            })}
            activeOpacity={0.8}
        >
            <DriveImage uri={item.image} style={styles.cardImage} />
            <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardCode}>{item.code} - {item.date}</Text>
                    <View style={styles.cardBadges}>
                        <View style={[styles.salsaBadge, { backgroundColor: SALSA_COLORS[item.salsa] || '#888' }]}>
                            <Text style={styles.badgeText}>{item.salsa}</Text>
                        </View>
                        <View style={[styles.salsaBadge, { backgroundColor: INGREDIENTE_COLORS[item.ingrediente] || '#555' }]}>
                            <Text style={styles.badgeText}>{item.ingrediente}</Text>
                        </View>
                    </View>
                </View>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
            </View>
        </TouchableOpacity>
    ), [filtered, navigation]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.headerTitle}>Club del Gusto</Text>
                        <Text style={styles.headerSub}>Recetario Personal · {filtered.length} recetas</Text>
                    </View>
                    <View style={styles.headerButtons}>
                        {auth.currentUser?.uid === ADMIN_UID && (
                            <TouchableOpacity style={styles.exitBtn} onPress={() => navigation.navigate('Admin')}>
                                <Text style={styles.exitText}>⚙️</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.exitBtn} onPress={() => navigation.navigate('Chef')}>
                            <Text style={styles.chefBtnText}>👨‍🍳</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.flagBtn} onPress={() => navigation.navigate('Review')}>
                            <Text style={styles.flagBtnIcon}>★</Text>
                            {flagCount > 0 && (
                                <View style={styles.flagBadge}>
                                    <Text style={styles.flagBadgeText}>{flagCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.exitBtn} onPress={() => logout()}>
                            <Text style={styles.exitText}>⏻</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.searchRow}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar receta..."
                    placeholderTextColor="#999"
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {/* Dropdowns — Categoría e Ingrediente en la misma línea */}
            <View style={styles.dropdownRow}>
                <View style={{ flex: 1 }}>
                    <Dropdown
                        label="Categoría"
                        value={activeCategory}
                        options={CATEGORY_OPTIONS}
                        onSelect={setActiveCategory}
                        accentColor="#c8102e"
                    />
                </View>
                <View style={{ width: 10 }} />
                <View style={{ flex: 1 }}>
                    <Dropdown
                        label="Tipo"
                        value={activeIngrediente}
                        options={INGREDIENTE_OPTIONS}
                        onSelect={setActiveIngrediente}
                        accentColor="#0277BD"
                    />
                </View>
            </View>

            {/* Chips — Salsa */}
            <View style={styles.salsaRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    {SALSA_FILTERS.map(opt => {
                        const isActive = activeSalsa === opt;
                        const color = SALSA_COLORS[opt] || '#c8102e';
                        return (
                            <TouchableOpacity
                                key={opt}
                                style={[styles.chip, isActive && { backgroundColor: color, borderColor: color }]}
                                onPress={() => setActiveSalsa(opt)}
                            >
                                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{opt}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {hasActiveFilters && (
                <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
                    <Text style={styles.clearText}>✕ Limpiar filtros</Text>
                </TouchableOpacity>
            )}

            <FlatList
                ref={flatListRef}
                data={filtered}
                keyExtractor={item => String(item.id)}
                renderItem={renderRecipe}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true}
                maxToRenderPerBatch={8}
                windowSize={5}
                initialNumToRender={10}
                ListEmptyComponent={
                    <Text style={styles.empty}>Proximamente..</Text>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0f1e' },
    header: {
        backgroundColor: '#1a1a2e',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
    },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { color: '#fff', fontSize: 24, fontWeight: '700', letterSpacing: 1 },
    headerSub: { color: '#aaa', fontSize: 13, marginTop: 2 },
    headerButtons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    flagBtn: {
        backgroundColor: '#2a2a40',
        borderRadius: 20, width: 36, height: 36,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: '#3a3a50',
    },
    flagBtnIcon: { color: '#FFD700', fontSize: 18, textAlign: 'center', textAlignVertical: 'center', lineHeight: 36 },
    flagBadge: {
        position: 'absolute', top: -4, right: -4,
        backgroundColor: '#c8102e', borderRadius: 8,
        minWidth: 16, height: 16,
        justifyContent: 'center', alignItems: 'center',
        paddingHorizontal: 3,
    },
    flagBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
    exitBtn: {
        backgroundColor: '#2a2a40',
        borderRadius: 20, width: 36, height: 36,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: '#3a3a50',
    },
    exitText: { color: '#888', fontSize: 16, fontWeight: '700' },
    chefBtnText: { fontSize: 18 },
    searchRow: { paddingHorizontal: 16, paddingVertical: 10 },
    searchInput: {
        backgroundColor: '#1e1e30',
        color: '#fff',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#333',
    },

    // Dropdowns
    dropdownRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    dropdownBtn: {
        backgroundColor: '#1e1e30',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#333',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    dropdownLabel: {
        color: '#666',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    dropdownValue: { color: '#aaa', fontSize: 13, fontWeight: '500' },

    // Modal dropdown
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        backgroundColor: '#1a1a2e',
        borderRadius: 14,
        width: 260,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#2a2a40',
    },
    modalTitle: {
        color: '#666',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a40',
    },
    modalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 13,
    },
    modalOptionText: { color: '#ccc', fontSize: 15 },

    // Salsa chips
    salsaRow: { marginBottom: 4 },
    filterLabel: {
        color: '#666',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
        paddingHorizontal: 16,
        paddingBottom: 6,
    },
    filterScroll: { paddingHorizontal: 16 },
    chip: {
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 5,
        backgroundColor: '#1e1e30',
        marginRight: 7,
        borderWidth: 1,
        borderColor: '#333',
    },
    chipText: { color: '#aaa', fontSize: 12, fontWeight: '500' },
    chipTextActive: { color: '#fff' },

    clearBtn: {
        alignSelf: 'flex-end',
        marginRight: 16,
        marginBottom: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    clearText: { color: '#c8102e', fontSize: 12, fontWeight: '600' },

    // Cards
    list: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 24 },
    card: {
        flexDirection: 'row',
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#2a2a40',
    },
    cardImage: { width: 90, height: 90 },
    cardBody: { flex: 1, padding: 10, justifyContent: 'space-between' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
    cardCode: { color: '#888', fontSize: 11, fontWeight: '600' },
    cardBadges: { flexDirection: 'row', gap: 4 },
    salsaBadge: { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: '600' },
    cardName: { color: '#fff', fontSize: 15, fontWeight: '700', marginTop: 2 },
    cardDesc: { color: '#aaa', fontSize: 12, marginTop: 2, lineHeight: 16 },
    empty: { color: '#666', textAlign: 'center', marginTop: 40, fontSize: 15 },
});
