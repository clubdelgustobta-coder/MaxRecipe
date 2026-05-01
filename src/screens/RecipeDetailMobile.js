import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
    View, Text, ScrollView, FlatList, StyleSheet,
    TouchableOpacity, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SALSA_COLORS, INGREDIENTE_COLORS } from '../data/recipes';
import { useRecipes } from '../context/RecipesContext';
import { getFlaggedIds, toggleFlagged } from '../services/flagService';
import DriveImage, { getDriveImageSize } from '../components/DriveImage';
import { shareRecipeOnWhatsApp } from '../utils/share';

const RecipeCard = React.memo(function RecipeCard({ recipe, width }) {
    const salsaColor = SALSA_COLORS[recipe.salsa] || '#888';
    const [imgHeight, setImgHeight] = useState(240);

    useEffect(() => {
        if (recipe.image) {
            getDriveImageSize(recipe.image, (w, h) => {
                if (w > 0) setImgHeight(Math.round((h / w) * width));
            });
        }
    }, [recipe.image, width]);

    return (
        <ScrollView
            style={{ width }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cardScroll}
        >
            <DriveImage uri={recipe.image} style={{ width, height: imgHeight }} resizeMode="contain" />

            <View style={styles.content}>
                <View style={styles.titleRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.name}>{recipe.name}</Text>
                    </View>
                </View>

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
                    <View style={[styles.metaChip, { borderColor: SALSA_COLORS[recipe.salsa] || '#888' }]}>
                        <Text style={styles.metaLabel}>Salsa</Text>
                        <Text style={[styles.metaValue, { color: salsaColor }]}>{recipe.salsa.replace(' ', '\n')}</Text>
                    </View>
                </View>

                <Text style={styles.description}>{recipe.description}</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ingredientes</Text>
                    <View style={styles.divider} />
                    {recipe.ingredientsList.map((ing, i) => (
                        <View key={i} style={styles.ingredientRow}>
                            <View style={[styles.dot, { backgroundColor: salsaColor }]} />
                            <Text style={styles.ingredientText}>{ing}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
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
                </View>
            </View>
        </ScrollView>
    );
});

export default function RecipeDetailMobile({ route, navigation }) {
    const { startIndex = 0, recipeIds, code } = route.params ?? {};
    const { width } = useWindowDimensions();
    const flatListRef = useRef(null);
    const { recipes: allRecipes } = useRecipes();
    const [flaggedIds, setFlaggedIds] = useState(new Set());

    const recipes = recipeIds
        ? recipeIds.map(id => allRecipes.find(r => r.id === id)).filter(Boolean)
        : allRecipes;

    const resolvedIndex = code
        ? Math.max(0, recipes.findIndex(r => r.code === code))
        : startIndex;

    const [currentIndex, setCurrentIndex] = useState(resolvedIndex);
    const currentRecipe = recipes[currentIndex];
    const isFlagged = currentRecipe ? flaggedIds.has(currentRecipe.id) : false;

    useEffect(() => {
        getFlaggedIds().then(setFlaggedIds);
    }, []);

    const handleToggleFlag = async () => {
        if (!currentRecipe) return;
        const updated = await toggleFlagged(currentRecipe.id);
        setFlaggedIds(new Set(updated));
    };

    const getItemLayout = useCallback((_, i) => ({
        length: width, offset: width * i, index: i,
    }), [width]);

    useEffect(() => {
        if (startIndex > 0 && flatListRef.current) {
            const timer = setTimeout(() => {
                flatListRef.current?.scrollToIndex({ index: startIndex, animated: false });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [startIndex]);

    const renderItem = useCallback(({ item }) => <RecipeCard recipe={item} width={width} />, [width]);

    const onViewableItemsChanged = useCallback(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index ?? 0);
        }
    }, []);

    const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={recipes}
                keyExtractor={item => String(item.id)}
                renderItem={renderItem}
                horizontal
                snapToInterval={width}
                snapToAlignment="center"
                showsHorizontalScrollIndicator={false}
                getItemLayout={getItemLayout}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                decelerationRate={0.92}
                onScrollToIndexFailed={() => {}}
                windowSize={3}
                maxToRenderPerBatch={2}
                initialNumToRender={1}
            />

            <TouchableOpacity
                style={styles.whatsappBtn}
                onPress={() => currentRecipe && shareRecipeOnWhatsApp(currentRecipe)}
            >
                <Text style={styles.whatsappIcon}>📲</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.flagBtn, isFlagged && styles.flagBtnActive]}
                onPress={handleToggleFlag}
            >
                <Text style={styles.flagIcon}>{isFlagged ? '★' : '☆'}</Text>
            </TouchableOpacity>

            <View style={styles.pagination}>
                <Text style={styles.paginationText}>
                    {recipes[currentIndex]?.code}  ·  {currentIndex + 1} / {recipes.length}
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0f1e' },
    flagBtn: {
        position: 'absolute', bottom: 60, right: 20, zIndex: 10,
        backgroundColor: '#1a1a2e',
        borderRadius: 24, width: 48, height: 48,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: '#3a3a50',
    },
    flagBtnActive: { backgroundColor: '#2a2000', borderColor: '#FFD700' },
    flagIcon: { fontSize: 22, color: '#FFD700' },
    whatsappBtn: {
        position: 'absolute', bottom: 116, right: 20, zIndex: 10,
        backgroundColor: '#25D366',
        borderRadius: 24, width: 48, height: 48,
        justifyContent: 'center', alignItems: 'center',
    },
    whatsappIcon: { fontSize: 22 },
    cardScroll: { paddingBottom: 40 },
    content: { padding: 20 },
    titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
    name: { color: '#fff', fontSize: 22, fontWeight: '800', lineHeight: 26 },
    metaRow: { flexDirection: 'row', marginBottom: 16, gap: 8 },
    metaChip: {
        flex: 1, backgroundColor: '#1a1a2e', borderRadius: 10,
        padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#2a2a40',
    },
    metaLabel: { color: '#666', fontSize: 10, fontWeight: '600', marginBottom: 2 },
    metaValue: { color: '#ddd', fontSize: 12, fontWeight: '600', textAlign: 'center' },
    description: { color: '#bbb', fontSize: 14, lineHeight: 20, marginBottom: 24, fontStyle: 'italic' },
    section: { marginBottom: 28 },
    sectionTitle: { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 8 },
    divider: { height: 1, backgroundColor: '#2a2a40', marginBottom: 14 },
    ingredientRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    dot: { width: 7, height: 7, borderRadius: 4, marginRight: 10 },
    ingredientText: { color: '#ccc', fontSize: 14, flex: 1 },
    stepRow: { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-start' },
    stepNumber: {
        width: 26, height: 26, borderRadius: 13,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 12, marginTop: 1, flexShrink: 0,
    },
    stepNum: { color: '#fff', fontSize: 12, fontWeight: '700' },
    stepText: { color: '#ccc', fontSize: 14, lineHeight: 20, flex: 1 },
    pagination: {
        paddingVertical: 10, alignItems: 'center',
        borderTopWidth: 1, borderTopColor: '#2a2a40',
    },
    paginationText: { color: '#666', fontSize: 12, letterSpacing: 0.5 },
});
