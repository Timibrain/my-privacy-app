import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';

// 1. The KeyChain will hold ONLY the encryption key (small)
const KEY_STORE_ALIAS = 'my-encryption-key';

// 2. AsyncStorage will hold the encrypted data (large)
const DATA_STORE_ALIAS = 'my-encrypted-notes';

// Helper: Get or Create a robust AES Key
async function getEncryptionKey() {
    let key = await SecureStore.getItemAsync(KEY_STORE_ALIAS);

    if (!key) {
        // Generate a random 256-bit key if one doesn't exist
        key = CryptoJS.lib.WordArray.random(256 / 8).toString();
        await SecureStore.setItemAsync(KEY_STORE_ALIAS, key);
    }

    return key;
}

// --- PUBLIC FUNCTIONS ---

export async function saveSecret(text: string) {
    const key = await getEncryptionKey();

    // Encrypt the text using AES
    const encrypted = CryptoJS.AES.encrypt(text, key).toString();

    console.log("🔒 ENCRYPTED DATA:", encrypted);

    // Save the encrypted string to unlimited storage
    await AsyncStorage.setItem(DATA_STORE_ALIAS, encrypted);
}

export async function getSecret() {
    const key = await getEncryptionKey();
    const encrypted = await AsyncStorage.getItem(DATA_STORE_ALIAS);

    if (!encrypted) return '';

    // Decrypt the text
    const bytes = CryptoJS.AES.decrypt(encrypted, key);
    return bytes.toString(CryptoJS.enc.Utf8);
}

export async function deleteSecret() {
    await AsyncStorage.removeItem(DATA_STORE_ALIAS);
    // Optional: We usually KEEP the key so we don't lose access to other future data,
    // but you could delete the key too if you want a full wipe.
}