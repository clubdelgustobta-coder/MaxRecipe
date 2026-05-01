import AsyncStorage from '@react-native-async-storage/async-storage';

const key = code => `note_${code}`;

export async function getNote(code) {
    try { return (await AsyncStorage.getItem(key(code))) ?? ''; }
    catch { return ''; }
}

export async function saveNote(code, text) {
    try {
        if (text?.trim()) await AsyncStorage.setItem(key(code), text);
        else await AsyncStorage.removeItem(key(code));
    } catch {}
}
