import { getFirestore, doc, setDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { auth } from './firebaseService';

const db = getFirestore();

export async function saveUserLogin(user) {
    const ref = doc(db, 'users', user.uid);
    await setDoc(ref, {
        email: user.email,
        lastLogin: serverTimestamp(),
    }, { merge: true });
}

export async function getAllUsers() {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
}
