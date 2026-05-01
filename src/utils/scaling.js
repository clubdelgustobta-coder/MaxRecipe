export const BASE_PORTIONS = 4;

export function scaleIngredient(text, portions) {
    if (portions === BASE_PORTIONS) return text;
    const factor = portions / BASE_PORTIONS;
    return text.replace(/^(\d+(?:[.,]\d+)?)/, (_, num) => {
        const n = parseFloat(num.replace(',', '.'));
        const scaled = n * factor;
        if (Number.isInteger(scaled)) return String(scaled);
        const rounded = Math.round(scaled * 10) / 10;
        return String(rounded).replace('.', ',');
    });
}
