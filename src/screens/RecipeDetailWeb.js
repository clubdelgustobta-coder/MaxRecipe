import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SALSA_COLORS } from '../data/recipes';
import { useRecipes } from '../context/RecipesContext';
import { getFlaggedIds, toggleFlagged } from '../services/flagService';
import DriveImage, { getDriveImageSize } from '../components/DriveImage';

const INGR_LINE_H = 28; // altura por línea de ingrediente (fontSize 14 + marginBottom 8)
const MAX_INGR_LINES = 9;
const INGR_AREA_H = INGR_LINE_H * MAX_INGR_LINES; // 252px — altura fija del bloque

export default function RecipeDetailWeb({ route, navigation }) {
    const { startIndex = 0, recipeIds } = route.params;
    const { recipes: allRecipes } = useRecipes();
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    const [flaggedIds, setFlaggedIds] = useState(new Set());
    const [imgRatio, setImgRatio] = useState(4 / 3);

    const recipes = recipeIds
        ? recipeIds.map(id => allRecipes.find(r => r.id === id)).filter(Boolean)
        : allRecipes;

    const recipe = recipes[currentIndex];
    const isFlagged = recipe ? flaggedIds.has(recipe.id) : false;
    const salsaColor = recipe ? (SALSA_COLORS[recipe.salsa] || '#888') : '#888';

    useEffect(() => {
        getFlaggedIds().then(setFlaggedIds);
    }, []);

    useEffect(() => {
        setCurrentIndex(startIndex);
    }, [startIndex]);

    useEffect(() => {
        if (recipe?.image) {
            getDriveImageSize(recipe.image, (w, h) => {
                if (h > 0) setImgRatio(w / h);
            });
        }
    }, [recipe?.image]);

    const handleToggleFlag = async () => {
        if (!recipe) return;
        const updated = await toggleFlagged(recipe.id);
        setFlaggedIds(new Set(updated));
    };

    const goPrev = () => setCurrentIndex(i => Math.max(0, i - 1));
    const goNext = () => setCurrentIndex(i => Math.min(recipes.length - 1, i + 1));

    if (!recipe) return null;

    // Dividir ingredientes: primeras 9 en col1, resto en col2
    const col1 = recipe.ingredientsList.slice(0, MAX_INGR_LINES);
    const col2 = recipe.ingredientsList.slice(MAX_INGR_LINES);
    const twoCol = col2.length > 0;

    return (
        <SafeAreaView style={styles.container}>

            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.headerBtnText}>← Volver</Text>
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>{recipe.name}</Text>
                    <Text style={styles.headerSub}>{recipe.code} · {currentIndex + 1} / {recipes.length}</Text>
                </View>

                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={[styles.headerBtn, currentIndex === 0 && styles.headerBtnDisabled]}
                        onPress={goPrev}
                        disabled={currentIndex === 0}
                    >
                        <Text style={styles.headerBtnText}>← Anterior</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.flagBtn, isFlagged && styles.flagBtnActive]}
                        onPress={handleToggleFlag}
                    >
                        <Text style={styles.flagIcon}>{isFlagged ? '★' : '☆'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.headerBtn, currentIndex === recipes.length - 1 && styles.headerBtnDisabled]}
                        onPress={goNext}
                        disabled={currentIndex === recipes.length - 1}
                    >
                        <Text style={styles.headerBtnText}>Siguiente →</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── Dos columnas ── */}
            <View style={styles.body}>

                {/* Columna izquierda: foto + datos básicos */}
                <ScrollView style={styles.leftCol} showsVerticalScrollIndicator={false} contentContainerStyle={styles.colContent}>
                    <DriveImage
                        uri={recipe.image}
                        style={[styles.image, { aspectRatio: imgRatio }]}
                        resizeMode="cover"
                    />

                    <View style={styles.metaRow}>
                        <View style={styles.metaChip}>
                            <Text style={styles.metaLabel}>Fecha</Text>
                            <Text style={styles.metaValue}>{recipe.date}</Text>
                            <Text style={styles.metaValue}>{recipe.code}</Text>
                        </View>
                        <View style={styles.metaChip}>
                            <Text style={styles.metaLabel}>Tipo</Text>
                            <Text style={styles.metaValue}>{recipe.ingrediente}</Text>
                        </View>
                        <View style={styles.metaChip}>
                            <Text style={styles.metaLabel}>Categoría</Text>
                            <Text style={styles.metaValue}>{recipe.category}</Text>
                        </View>
                        <View style={[styles.metaChip, { borderColor: salsaColor }]}>
                            <Text style={styles.metaLabel}>Salsa</Text>
                            <Text style={[styles.metaValue, { color: salsaColor }]}>{recipe.salsa.replace(' ', '\n')}</Text>
                        </View>
                    </View>

                    <Text style={styles.description}>{recipe.description}</Text>
                </ScrollView>

                <View style={styles.colDivider} />

                {/* Columna derecha: ingredientes (área fija) + preparación */}
                <ScrollView style={styles.rightCol} showsVerticalScrollIndicator={false} contentContainerStyle={styles.colContent}>

                    <Text style={styles.sectionTitle}>Ingredientes</Text>
                    <View style={styles.divider} />

                    {/* Área fija de 9 líneas, 2 columnas si hay más de 9 */}
                    <View style={[styles.ingredientsArea, { height: INGR_AREA_H }]}>
                        <View style={styles.ingredientCol}>
                            {col1.map((ing, i) => (
                                <View key={i} style={styles.ingredientRow}>
                                    <View style={[styles.dot, { backgroundColor: salsaColor }]} />
                                    <Text style={styles.ingredientText}>{ing}</Text>
                                </View>
                            ))}
                        </View>
                        {twoCol && (
                            <View style={styles.ingredientCol}>
                                {col2.map((ing, i) => (
                                    <View key={i} style={styles.ingredientRow}>
                                        <View style={[styles.dot, { backgroundColor: salsaColor }]} />
                                        <Text style={styles.ingredientText}>{ing}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    <Text style={styles.sectionTitle}>Preparación</Text>
                    <View style={styles.divider} />
                    {recipe.steps.map((step, i) => (
                        <View key={i} style={styles.stepRow}>
                            <View style={[styles.stepNumber, { backgroundColor: salsaColor }]}>
                                <Text style={styles.stepNum}>{i + 1}</Text>
                            </View>
                            <Text style={styles.stepText}>{step}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0f1e' },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a40',
        gap: 16,
    },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
    headerSub: { color: '#666', fontSize: 12, marginTop: 2 },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    headerBtn: {
        backgroundColor: '#2a2a40',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#3a3a50',
    },
    headerBtnDisabled: { opacity: 0.3 },
    headerBtnText: { color: '#ccc', fontSize: 13 },
    flagBtn: {
        backgroundColor: '#1a1a2e',
        borderRadius: 20,
        width: 36, height: 36,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: '#3a3a50',
    },
    flagBtnActive: { backgroundColor: '#2a2000', borderColor: '#FFD700' },
    flagIcon: { fontSize: 20, color: '#FFD700' },

    // Layout
    body: { flex: 1, flexDirection: 'row' },
    leftCol: { flex: 4 },
    rightCol: { flex: 6 },
    colContent: { padding: 28, paddingBottom: 48 },
    colDivider: { width: 1, backgroundColor: '#2a2a40' },

    // Imagen proporcional (sin height fijo — lo da aspectRatio)
    image: {
        width: '100%',
        borderRadius: 12,
        marginBottom: 20,
        backgroundColor: '#1a1a2e',
    },

    // Meta chips
    metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    metaChip: {
        flex: 1, minWidth: 70,
        backgroundColor: '#1a1a2e', borderRadius: 10,
        padding: 10, alignItems: 'center',
        borderWidth: 1, borderColor: '#2a2a40',
    },
    metaLabel: { color: '#666', fontSize: 10, fontWeight: '600', marginBottom: 2 },
    metaValue: { color: '#ddd', fontSize: 12, fontWeight: '600', textAlign: 'center' },
    description: { color: '#bbb', fontSize: 14, lineHeight: 22, fontStyle: 'italic' },

    // Secciones
    sectionTitle: { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 8 },
    divider: { height: 1, backgroundColor: '#2a2a40', marginBottom: 14 },

    // Ingredientes — área fija con soporte de 2 columnas
    ingredientsArea: {
        flexDirection: 'row',
        marginBottom: 24,
        overflow: 'hidden',
    },
    ingredientCol: { flex: 1 },
    ingredientRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    dot: { width: 7, height: 7, borderRadius: 4, marginRight: 10, flexShrink: 0 },
    ingredientText: { color: '#ccc', fontSize: 14, flex: 1 },

    // Preparación
    stepRow: { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-start' },
    stepNumber: {
        width: 26, height: 26, borderRadius: 13,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 12, marginTop: 1, flexShrink: 0,
    },
    stepNum: { color: '#fff', fontSize: 12, fontWeight: '700' },
    stepText: { color: '#ccc', fontSize: 14, lineHeight: 20, flex: 1 },
});
