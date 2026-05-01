import { Linking } from 'react-native';
import { APP_URL } from '../config/appConfig';

export function shareRecipeOnWhatsApp(recipe) {
    const recipeUrl = `${APP_URL}/recipe/${recipe.code}`;

    const text = [
        `🍝 *${recipe.name}* — Club del Gusto`,
        `📅 ${recipe.date} · ${recipe.code} | ${recipe.category} | ${recipe.ingrediente}`,
        ``,
        `_${recipe.description}_`,
        ``,
        `🔗 ${recipeUrl}`,
    ].join('\n');

    Linking.openURL(`https://wa.me/?text=${encodeURIComponent(text)}`);
}
