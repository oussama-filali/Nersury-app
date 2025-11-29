/**
 * Utilitaire d'encryption AES-256
 * Pour protéger les données sensibles (noms enfants, infos médicales...)
 * Conforme RGPD pour données de mineurs
 */

import CryptoJS from 'crypto-js';
import config from '../config/env';
import logger from './logger';

/**
 * Encrypter une chaîne de caractères en AES-256
 * @param plaintext - Texte en clair
 * @returns Texte encrypté (base64)
 */
export const encrypt = (plaintext: string): string => {
  try {
    if (!plaintext) return plaintext;
    
    const encrypted = CryptoJS.AES.encrypt(plaintext, config.encryptionKey).toString();
    return encrypted;
  } catch (error) {
    logger.error('Erreur lors de l\'encryption', error);
    throw new Error('Encryption failed');
  }
};

/**
 * Décrypter une chaîne encryptée
 * @param ciphertext - Texte encrypté (base64)
 * @returns Texte en clair
 */
export const decrypt = (ciphertext: string): string => {
  try {
    if (!ciphertext) return ciphertext;
    
    const bytes = CryptoJS.AES.decrypt(ciphertext, config.encryptionKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      throw new Error('Decryption returned empty string');
    }
    
    return decrypted;
  } catch (error) {
    logger.error('Erreur lors du décryptage', error);
    throw new Error('Decryption failed');
  }
};

/**
 * Encrypter un objet JSON entier
 * @param obj - Objet à encrypter
 * @returns JSON encrypté
 */
export const encryptObject = (obj: Record<string, any>): string => {
  try {
    const jsonString = JSON.stringify(obj);
    return encrypt(jsonString);
  } catch (error) {
    logger.error('Erreur lors de l\'encryption de l\'objet', error);
    throw new Error('Object encryption failed');
  }
};

/**
 * Décrypter un JSON encrypté
 * @param ciphertext - JSON encrypté
 * @returns Objet décrypté
 */
export const decryptObject = <T = Record<string, any>>(ciphertext: string): T => {
  try {
    const decrypted = decrypt(ciphertext);
    return JSON.parse(decrypted) as T;
  } catch (error) {
    logger.error('Erreur lors du décryptage de l\'objet', error);
    throw new Error('Object decryption failed');
  }
};

/**
 * Hasher une chaîne (one-way, pour comparaisons)
 * Utilisé pour anonymisation définitive
 * @param data - Données à hasher
 * @returns Hash SHA-256
 */
export const hash = (data: string): string => {
  return CryptoJS.SHA256(data).toString();
};

/**
 * Générer un identifiant anonyme pour un enfant
 * Utilisé dans les logs et analytics (sans données identifiantes)
 * @param childId - ID de l'enfant
 * @returns Identifiant anonyme
 */
export const generateAnonymousId = (childId: string): string => {
  return hash(`child_${childId}_${config.encryptionKey}`).substring(0, 16);
};
