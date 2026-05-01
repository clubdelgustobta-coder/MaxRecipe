const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRyYuzsRJMYXG887szchRPI3NG04HDtM_0GxeEXv98AoThyBOiDqQfHheIuEU5Sf7rWe9Tm3nmcWYEG/pub?gid=1716930433&single=true&output=csv';

function toDriveImageUrl(url) {
    if (!url) return url;
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (!match) return url;
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
}
const CSV_CHEF_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRyYuzsRJMYXG887szchRPI3NG04HDtM_0GxeEXv98AoThyBOiDqQfHheIuEU5Sf7rWe9Tm3nmcWYEG/pub?gid=1762987022&single=true&output=csv';

// Parser CSV robusto — maneja celdas con saltos de línea (RFC 4180)
function parseCSV(text) {
    const rows = [];
    let row = [];
    let cell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        const next = text[i + 1];

        if (inQuotes) {
            if (ch === '"' && next === '"') {
                cell += '"';
                i++;
            } else if (ch === '"') {
                inQuotes = false;
            } else {
                cell += ch;
            }
        } else {
            if (ch === '"') {
                inQuotes = true;
            } else if (ch === ',') {
                row.push(cell);
                cell = '';
            } else if (ch === '\r' && next === '\n') {
                row.push(cell);
                cell = '';
                rows.push(row);
                row = [];
                i++;
            } else if (ch === '\n') {
                row.push(cell);
                cell = '';
                rows.push(row);
                row = [];
            } else {
                cell += ch;
            }
        }
    }
    if (cell || row.length > 0) {
        row.push(cell);
        rows.push(row);
    }
    return rows;
}

function mapRowToRecipe(row, index) {
    const [code, name, date, description, category, ingrediente, salsa, ingredientesRaw, pasosRaw] = row;
    const image = row[row.length - 1];

    const splitLines = str => {
        if (!str) return [];
        // Intenta primero por saltos de línea reales o literales \n
        let parts = str.split(/\r?\n|\r|\\n/).map(s => s.trim()).filter(Boolean);
        // Si llegó como un bloque único, divide por patrón numérico "1. 2. 3. ..."
        if (parts.length === 1) {
            parts = str.split(/\s+(?=\d+\.\s)/).map(s => s.trim()).filter(Boolean);
        }
        return parts;
    };

    return {
        id: index + 1,
        code: (code || '').trim(),
        name: (name || '').trim(),
        date: (date || '').trim(),
        description: (description || '').trim(),
        ingrediente: (ingrediente || '').trim(),
        category: (category || '').trim(),
        salsa: (salsa || '').trim(),
        ingredientsList: splitLines(ingredientesRaw),
        steps: splitLines(pasosRaw),
        image: toDriveImageUrl((image || '').trim()),
    };
}

export async function fetchRecipesFromSheet() {
    const response = await fetch(`${CSV_URL}&t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    const rows = parseCSV(text);
    // Fila 0 = encabezados, saltamos
    return rows.slice(1).filter(r => r[0]).map(mapRowToRecipe);
}

export async function loadRecipes() {
    return await fetchRecipesFromSheet();
}

// ── Chef ──────────────────────────────────────────────────────────────────────
// Estructura del Sheet: col A = tipo (titulo_madre|titulo_paraf|texto|foto_url), col B = valor

function parseChefRows(rows) {
    const items = rows
        .filter(r => r[0] && r[1])
        .map(r => {
            const tipo = r[0].trim().toLowerCase();
            const valor = tipo.startsWith('foto_url') ? toDriveImageUrl(r[1].trim()) : r[1].trim();
            return { tipo, valor };
        });
    return { items };
}

export async function loadChef() {
    try {
        const response = await fetch(`${CSV_CHEF_URL}&t=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const text = await response.text();
        const rows = parseCSV(text);
        return parseChefRows(rows);
    } catch {
        return { items: [] };
    }
}
