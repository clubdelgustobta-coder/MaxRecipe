import AsyncStorage from '@react-native-async-storage/async-storage';

const FLAG_KEY = 'flagged_recipes';

export async function getFlaggedIds() {
    try {
        const json = await AsyncStorage.getItem(FLAG_KEY);
        return new Set(json ? JSON.parse(json) : []);
    } catch {
        return new Set();
    }
}

export async function toggleFlagged(id) {
    try {
        const ids = await getFlaggedIds();
        if (ids.has(id)) {
            ids.delete(id);
        } else {
            ids.add(id);
        }
        await AsyncStorage.setItem(FLAG_KEY, JSON.stringify([...ids]));
        return ids;
    } catch {
        return new Set();
    }
}
