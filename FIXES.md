# RecetarioApp — Fix Log

**Fecha:** 18 Abril 2026  
**Plataforma:** Expo Go / Android / Web

---

## FIX 01 — SafeAreaView deprecado
**Error:** `SafeAreaView has been deprecated and will be removed in a future release`  
**Causa:** Se usaba `SafeAreaView` de `react-native` en lugar de la librería recomendada.  
**Solución:**
```js
// ❌ Antes
import { SafeAreaView } from 'react-native';

// ✅ Después
import { SafeAreaView } from 'react-native-safe-area-context';
```
Además se envolvió `App.js` con `<SafeAreaProvider>` de `react-native-safe-area-context`.

---

## FIX 02 — java.lang.String cannot be cast to java.lang.Boolean
**Error:** `java.lang.String cannot be cast to java.lang.Boolean` en Android  
**Causa:** `edgeToEdgeEnabled: true` en `app.json` causaba que props booleanas llegaran como strings al puente nativo de Android.  
**Solución:** Cambiar en `app.json`:
```json
// ❌ Antes
"edgeToEdgeEnabled": true

// ✅ Después
"edgeToEdgeEnabled": false
```

---

## FIX 03 — StatusBar conflicto con New Architecture
**Error:** Relacionado con FIX 02 — `StatusBar` de `react-native` incompatible con edge-to-edge.  
**Solución:** Eliminar `StatusBar` de las pantallas individuales y usar `expo-status-bar` una sola vez en `App.js`:
```js
import { StatusBar } from 'expo-status-bar';

<SafeAreaProvider>
    <StatusBar style="light" />
    <NavigationContainer>...</NavigationContainer>
</SafeAreaProvider>
```

---

## FIX 04 — Warning newArchEnabled
**Warning:** `New Architecture is always enabled in Expo Go, but explicitly disabled in app.json`  
**Causa:** Se había puesto `newArchEnabled: false` como intento de fix del FIX 02, pero Expo Go ignora ese valor.  
**Solución:** Revertir a `newArchEnabled: true` — el fix real era `edgeToEdgeEnabled: false`.

---

## FIX 05 — Versiones incompatibles de dependencias
**Warning:** 
```
react-native-safe-area-context@5.7.0 - expected ~5.6.0
react-native-screens@4.24.0 - expected ~4.16.0
```
**Solución:** Reinstalar con las versiones exactas del SDK:
```bash
npx expo install react-native-screens react-native-safe-area-context
```

---

## FIX 06 — TypeError: Cannot convert undefined value to object
**Error:** `[TypeError: Cannot convert undefined value to object]` en RecipeDetailScreen  
**Causa (1):** Se pasaba el array completo de recetas como parámetro de navegación — React Navigation serializa los params y arrays grandes pueden corromperse.  
**Causa (2):** `initialScrollIndex` en FlatList es conocido por ser inestable en React Native New Architecture.  
**Solución:**
```js
// ❌ Antes — pasaba el array completo
navigation.navigate('RecipeDetail', { recipes: filtered, index })

// ✅ Después — solo IDs + índice (liviano)
navigation.navigate('RecipeDetail', { recipeIds: filtered.map(r => r.id), startIndex: index })

// ✅ En DetailScreen — reconstruye localmente desde RECIPES_DATA
const recipes = recipeIds.map(id => RECIPES_DATA.find(r => r.id === id)).filter(Boolean)

// ✅ scrollToIndex con delay en lugar de initialScrollIndex
useEffect(() => {
    if (startIndex > 0) {
        setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: startIndex, animated: false });
        }, 100);
    }
}, [startIndex]);

// ✅ Manejar fallo silenciosamente
onScrollToIndexFailed={() => {}}
```

---

---

---

# Sesión 19 Abril 2026

---

## FIX 07 — UX: filtro no volvía al inicio de la lista
**Síntoma:** Al activar un filtro, la lista quedaba en la posición de scroll anterior en lugar de mostrar desde la primera receta.  
**Solución:** Agregar `ref` a la FlatList y un `useEffect` que ejecuta `scrollToOffset(0)` cada vez que cambia cualquier filtro o búsqueda.
```js
const flatListRef = useRef(null);
useEffect(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
}, [search, activeCategory, activeIngrediente, activeSalsa]);
<FlatList ref={flatListRef} ... />
```

---

## FIX 08 — UX: armonizar label "Tipo" en todas las pantallas
**Síntoma:** El dropdown de ingrediente en RecipeListScreen decía "Ingrediente" mientras que en RecipeDetailScreen el chip decía "Tipo".  
**Solución:** Cambiar el `label` del Dropdown de `"Ingrediente"` a `"Tipo"` en RecipeListScreen.

---

## FIX 09 — UX: badges duplicados en pantalla detalle
**Síntoma:** En RecipeDetailScreen aparecían badges de Tipo y Salsa junto al título, y también los mismos datos en los chips de Fecha/Tipo/Categoría → información repetida.  
**Solución:** Eliminar el bloque `<View style={styles.badges}>` del `titleRow`. Los chips de meta información son suficientes.

---

## FIX 10 — UX: label "SALSA" innecesario sobre los chips de filtro
**Síntoma:** Encima de los chips de salsa aparecía el texto "SALSA" redundante dado que los chips son autoexplicativos.  
**Solución:** Eliminar `<Text style={styles.filterLabel}>Salsa</Text>` de la fila de chips.

---

## FIX 11 — Nueva feature: botón de salida de la app
**Motivo:** No había forma de cerrar la app desde la UI.  
**Solución:** Agregar botón `✕` en el header de RecipeListScreen usando `BackHandler.exitApp()` de React Native (funciona en Android).
```js
import { BackHandler } from 'react-native';
<TouchableOpacity onPress={() => BackHandler.exitApp()}>
    <Text>✕</Text>
</TouchableOpacity>
```

---

## FIX 12 — Nueva feature: Splash Screen animada
**Motivo:** La app arrancaba directamente en la lista sin pantalla de bienvenida.  
**Solución:** Componente `SplashScreen` en `App.js` con `Animated.timing` (fade out a los 2 segundos). La splash espera tanto el timer como la carga de datos antes de desaparecer.

---

## FIX 13 — Nueva feature: Google Sheets como base de datos
**Motivo:** Las recetas estaban hardcodeadas en `recipes.js`. El usuario quiere editarlas directamente desde Google Sheets sin tocar código.  
**Arquitectura:**
- `src/services/sheetsService.js` — fetch CSV del Sheet publicado, parser RFC 4180, caché en AsyncStorage
- `src/context/RecipesContext.js` — React Context que provee `{ recipes, loading, error, refresh }` a toda la app
- Fallback chain: Sheet → AsyncStorage cache → `RECIPES_DATA` estático

**Mapeo de columnas Sheet → app:**
| Sheet | App |
|-------|-----|
| id | code |
| titulo | name |
| fecha | date |
| descripcion | description |
| tipo | ingrediente |
| familia | category |
| salsa | salsa |
| ingredientes | ingredientsList |
| preparacion | steps |
| foto_url | image |

**Separador de listas** (ingredientes y pasos): salto de línea dentro de la celda.

---

## FIX 14 — Google Sheets CSV: URL incorrecta (export vs pub)
**Síntoma:** El fetch del Sheet devolvía HTML de login en lugar de CSV.  
**Causa:** La URL `export?format=csv` requiere autenticación Google aunque el Sheet esté compartido con "cualquiera con el enlace". Solo funciona en browser con sesión activa.  
**Solución:** Usar la URL de **Publicar en la web** (`pub?...output=csv`) que sí es accesible sin login:
```
// ❌ Antes
https://docs.google.com/spreadsheets/d/{ID}/export?format=csv&gid={GID}

// ✅ Después
https://docs.google.com/spreadsheets/d/{ID}/pub?gid={GID}&single=true&output=csv
```
**Requisito:** En Google Sheets ir a Archivo → Compartir → Publicar en la web → elegir pestaña → CSV → Publicar.

---

## FIX 15 — Google Sheets CSV: pasos y ingredientes llegaban como texto único
**Síntoma:** En la pantalla de detalle los pasos aparecían todos juntos como un bloque de texto en lugar de mostrarse separados con íconos numerados.  
**Causa:** El parser `splitLines` solo manejaba `\n` y `\r\n`, pero Google Sheets a veces exporta saltos de línea como el literal `\\n` (dos caracteres: barra + n).  
**Solución:** Ampliar el regex de split:
```js
// ❌ Antes
str.split(/\r?\n/)

// ✅ Después
str.split(/\r?\n|\\n/)
```

---

## Dependencias instaladas hoy
| Paquete | Versión | Motivo |
|---|---|---|
| `@react-native-async-storage/async-storage` | 2.2.0 | Caché local para datos del Sheet |

---

## Dependencias instaladas hoy
| Paquete | Versión | Motivo |
|---|---|---|
| `@react-navigation/native` | latest | Navegación entre pantallas |
| `@react-navigation/native-stack` | latest | Stack navigator |
| `react-native-screens` | ~4.16.0 | Requerido por navigation |
| `react-native-safe-area-context` | ~5.6.0 | SafeAreaView correcto |
| `react-dom` | 19.1.0 | Soporte web |
| `react-native-web` | ^0.21.0 | Soporte web |

---

# Sesión 19 Abril 2026 (tarde)

---

## FIX 16 — Optimización de rendimiento (memoria y re-renders)
**Motivo:** La app recalculaba filtros y recreaba funciones en cada render, y leía AsyncStorage en cada swipe.  
**Soluciones aplicadas:**
- `SALSA_FILTERS` → `useMemo` (no recalcula si las recetas no cambian)
- `renderRecipe` → `useCallback` (no recrea si `filtered` no cambió)
- `RecipeCard` → `React.memo` (no re-renderiza cards que no cambiaron al swipear)
- `renderItem` del detalle → `useCallback`
- `getFlaggedIds()` solo al montar la pantalla, no en cada swipe
- FlatList lista: `removeClippedSubviews`, `maxToRenderPerBatch=8`, `windowSize=5`, `initialNumToRender=10`
- FlatList detalle: `windowSize=3`, `maxToRenderPerBatch=2`, `initialNumToRender=1`

**⚠️ Nota:** `removeClippedSubviews={true}` en la FlatList HORIZONTAL del detalle causa bug de proporciones de imagen (ScrollViews anidadas). No usarlo en FlatList horizontal.

---

## FIX 17 — Recetas PT/PM/PX no aparecían en la app (multi-tipo)
**Síntoma:** La app solo mostraba recetas PV aunque el Google Sheet contenía también PT, PM, etc.  
**Causa:** La app usaba `recipes.js` estático como fallback, y ese archivo solo tenía recetas PV. El fetch del Sheet fallaba silenciosamente por dos razones:
1. `CSV_URL` usaba el formato `/d/{SHEET_ID}/pub?...` (requiere que el propietario publique con ese ID) en lugar del formato `/e/2PACX-.../pub?...` generado por Google al publicar.
2. `loadRecipes()` llamaba a `setCachedRecipes()` que ya había sido eliminada → error silencioso → caía al fallback estático.

**Solución:**
```js
// ❌ Antes
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/pub?gid=${GID}&single=true&output=csv`;

// ✅ Después — usar la URL exacta generada por "Publicar en la web"
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?gid=1716930433&single=true&output=csv';
```
Y simplificar `loadRecipes()` sin caché ni fallback:
```js
export async function loadRecipes() {
    return await fetchRecipesFromSheet();
}
```
**Tip:** Si no hay WiFi la app muestra lista vacía — comportamiento correcto e intencional.

---

## FIX 18 — Filtro "Tipo" no filtraba (columnas invertidas)
**Síntoma:** El dropdown "Tipo" (Veggie/Tierra/Mar) no filtraba nada. Tampoco "Categoría" (Pasta/Risotto).  
**Causa:** Las columnas 4 y 5 del CSV estaban mapeadas al revés en `mapRowToRecipe`:
- Col 4 del Sheet = `tipo` (Pasta, Risotto…) → la app lo leía como `ingrediente`
- Col 5 del Sheet = `familia` (Veggie, Tierra…) → la app lo leía como `category`

**Solución:** Swap en la destructuración:
```js
// ❌ Antes
const [code, name, date, description, ingrediente, category, salsa, ...] = row;

// ✅ Después
const [code, name, date, description, category, ingrediente, salsa, ...] = row;
```

---

## FIX 19 — Imágenes PT no se cargaban (Drive no público)
**Síntoma:** Todas las recetas PT mostraban la imagen genérica en lugar de su foto individual.  
**Causa:** Las imágenes PT en Google Drive no estaban compartidas públicamente. Las PV fueron compartidas una por una cuando se construyó la app, pero las PT son nuevas y quedaron privadas.  
**Solución:** En Google Drive, para cada imagen PT: botón derecho → **Compartir** → "Cualquier persona con el enlace puede ver".  
**Tip:** Cada vez que se agregue una receta nueva con foto, verificar que la imagen en Drive esté compartida públicamente antes de publicar la URL en el Sheet.

---

## FIX 20 — Pasos de preparación aparecían como un único bloque
**Síntoma:** En la pantalla de detalle se mostraba solo el punto "1" con todo el texto de preparación junto, en lugar de 10 pasos numerados separados.  
**Causa:** Google Sheets exporta los pasos en una sola cadena continua `"1. Paso uno 2. Paso dos..."` sin separador de línea entre ellos. El `splitLines` anterior asumía `\n` o `\\n` como separador, pero el CSV no los tenía.  
**Solución:** Si el split por salto de línea devuelve un único elemento, dividir por el patrón numérico `1. 2. 3.`:
```js
const splitLines = str => {
    if (!str) return [];
    let parts = str.split(/\r?\n|\r|\\n/).map(s => s.trim()).filter(Boolean);
    if (parts.length === 1) {
        parts = str.split(/(?=\b\d+\.\s)/).map(s => s.trim()).filter(Boolean);
    }
    return parts;
};
```
**Aplica a:** ingredientes y pasos (ambos usan `splitLines`).

---

## Mapeo correcto de columnas Sheet → app (actualizado)
| Col # | Sheet | App field |
|-------|-------|-----------|
| 0 | id | code |
| 1 | titulo | name |
| 2 | fecha | date |
| 3 | descripcion | description |
| 4 | tipo | category |
| 5 | familia | ingrediente |
| 6 | salsa | salsa |
| 7 | ingredientes | ingredientsList |
| 8 | preparacion | steps |
| 9 | foto_url | image |

---

# Sesión 20 Abril 2026

---

## FIX 21 — Pasos PV04 no se separaban (regex \b inestable en Hermes)
**Síntoma:** La receta PV04 mostraba todos sus pasos como un único bloque de texto en lugar de numerados.  
**Causa:** El regex `(?=\b\d+\.\s)` usaba `\b` (word boundary) dentro de un lookahead. Este patrón puede comportarse de forma inconsistente en **Hermes** (motor JS de React Native), fallando para algunas recetas.  
**Solución:** Reemplazar por un regex sin `\b` que consume el espacio previo al número:
```js
// ❌ Antes
parts = str.split(/(?=\b\d+\.\s)/).map(s => s.trim()).filter(Boolean);

// ✅ Después
parts = str.split(/\s+(?=\d+\.\s)/).map(s => s.trim()).filter(Boolean);
```
**Ventaja extra:** El split consume el espacio separador, evitando espacios residuales antes de cada paso. No afecta valores como `0.5 cm` ni `1 minuto` (no tienen punto después del número).

---

## FIX 22 — Badges de salsa desactualizados tras editar Google Sheets
**Síntoma:** Al actualizar el valor de "salsa" en Google Sheets (ej. "Salsa Blanca/Verde" → "Salsa Verde"), la app seguía mostrando los datos viejos.  
**Causa (1):** Google Sheets publica el CSV con un delay de 5–30 minutos tras guardar cambios.  
**Causa (2):** El `fetch` de React Native/Hermes cacheaba la respuesta HTTP del CSV.  
**Solución:** Forzar request sin caché añadiendo timestamp y header `cache: 'no-store'`:
```js
// ❌ Antes
const response = await fetch(CSV_URL);

// ✅ Después
const response = await fetch(`${CSV_URL}&t=${Date.now()}`, { cache: 'no-store' });
```
**Nota:** Esperar 5–10 minutos tras guardar en Sheets antes de recargar la app, ya que el delay de publicación de Google es inevitable.

---

# Sesión 01 Mayo 2026

---

## FIX 23 — Ícono de la app (favicon/splash)
**Motivo:** El ícono de la app mostraba fondo blanco (placeholder de Expo).  
**Solución:** Reemplazar todos los assets de ícono con la imagen del chef (`chef_max.png`) y actualizar `app.json`:
```json
"icon": "./assets/chef_max.png",
"splash": { "image": "./assets/chef_max.png", "backgroundColor": "#0f0f1e" },
"android": { "adaptiveIcon": { "foregroundImage": "./assets/chef_max.png", "backgroundColor": "#0f0f1e" } },
"web": { "favicon": "./assets/chef_max.png" }
```
**Nota:** El archivo fue renombrado de `Muñeco_Max.png` → `chef_max.png` para evitar problemas con caracteres especiales en bundlers web.

---

## FIX 24 — Compatibilidad web: BackHandler y useNativeDriver
**Síntoma:** Errores en la versión web de la app.  
**Causa 1:** `BackHandler.exitApp()` no existe en navegadores web.  
**Causa 2:** `useNativeDriver: true` en la animación del splash genera advertencia en web.  
**Solución:**
```js
// BackHandler — solo ejecutar en móvil
import { Platform } from 'react-native';
onPress={() => { if (Platform.OS !== 'web') BackHandler.exitApp(); }}

// useNativeDriver — condicional por plataforma
useNativeDriver: Platform.OS !== 'web'
```

---

## FIX 25 — Imágenes de Google Drive no visibles en web (CORS)
**Síntoma:** Todas las imágenes se veían en móvil pero no en web.  
**Causa:** Las URLs `drive.google.com/thumbnail` están bloqueadas por CORS en el navegador.  
**Solución:** Convertir todas las URLs a formato `lh3.googleusercontent.com/d/FILE_ID` que tiene CORS abierto:
```js
function toDriveImageUrl(url) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (!match) return url;
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
}
```
Aplicado en `sheetsService.js` al mapear recetas y al parsear fotos del Chef.

---

## FIX 26 — Algunas imágenes no cargaban en web con lh3 (fallback automático)
**Síntoma:** La mayoría de imágenes funcionaban en web con `lh3`, pero recetas PV20–PV27, PV34, PT01, PT03–PT07 y otras no cargaban.  
**Causa:** `lh3.googleusercontent.com/d/FILE_ID` no funciona para todos los archivos de Drive — depende de si Google ha indexado el archivo en su CDN. Las mismas imágenes sí funcionan en móvil con la URL `thumbnail`.  
**Solución:** Componente `DriveImage` con fallback automático:
```js
// src/components/DriveImage.js
export default function DriveImage({ uri, style, resizeMode = 'cover' }) {
    const [useFallback, setUseFallback] = useState(false);
    const id = getFileId(uri);
    const src = id
        ? (useFallback ? thumbnailUrl(id) : lh3Url(id))
        : uri;
    return (
        <Image source={{ uri: src }} style={style} resizeMode={resizeMode}
            onError={() => { if (!useFallback) setUseFallback(true); }} />
    );
}
```
- Intento 1: `https://lh3.googleusercontent.com/d/FILE_ID` (CDN, CORS ok)
- Intento 2 (onError): `https://drive.google.com/thumbnail?id=FILE_ID&sz=w1000`

Reemplaza todos los `<Image>` de recetas y chef. También `getDriveImageSize()` para `Image.getSize` con fallback en `RecipeDetailMobile` y `ChefScreen`.

---

## FIX 27 — Layout web RecipeDetail: dos columnas + navegación por botones
**Motivo:** En web el scroll horizontal no es ergonómico y el layout de una columna desperdicia espacio.  
**Solución:** Separar en dos componentes según plataforma:
- `RecipeDetailMobile.js` — layout original con FlatList horizontal + swipe
- `RecipeDetailWeb.js` — layout dos columnas (40% foto+datos / 60% ingredientes+preparación) con botones `← Anterior` / `Siguiente →`
- `RecipeDetailScreen.js` — selector: `Platform.OS === 'web' ? RecipeDetailWeb : RecipeDetailMobile`

**Feature web:**
- Ingredientes en área fija de 9 líneas (252px); si hay más de 9 se dividen en 2 columnas automáticamente
- "Preparación" siempre empieza en la misma posición vertical
- Imagen proporcional con `aspectRatio` calculado por `getDriveImageSize`

---

## FIX 28 — Imágenes Chef sin proporciones reales
**Síntoma:** Las fotos del apartado Chef tenían altura fija (220px / 600px) ignorando la proporción real de la imagen.  
**Solución:** Componente `ProportionalImage` en `ChefScreen` que usa `getDriveImageSize` para calcular el `aspectRatio` real y lo aplica con `width: '100%'`. Funciona en web y móvil.

---

## FIX 29 — ReviewScreen sin foto en las tarjetas
**Síntoma:** Las tarjetas de "Mis Preferencias" no mostraban la foto de la receta.  
**Solución:** Agregar `<DriveImage>` de 90×90px al inicio de cada card, igual que en `RecipeListScreen`.

---

## Configuración final app.json relevante
```json
{
  "expo": {
    "newArchEnabled": true,
    "android": {
      "edgeToEdgeEnabled": false
    }
  }
}
```
