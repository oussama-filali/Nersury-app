/**
 * Utilitaire de hashing sécurisé
 * Utilisation de bcrypt pour les mots de passe
 */

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12; // Niveau de sécurité élevé

/**
 * Hasher un mot de passe
 * @param password - Mot de passe en clair
 * @returns Hash bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Vérifier un mot de passe contre son hash
 * @param password - Mot de passe en clair
 * @param hash - Hash stocké en base
 * @returns true si le mot de passe correspond
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

/**
 * Vérifier la force d'un mot de passe
 * Règles : min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
 * @param password - Mot de passe à vérifier
 * @returns true si le mot de passe est suffisamment fort
 */
export const isPasswordStrong = (password: string): boolean => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber &&
    hasSpecialChar
  );
};

/**
 * Générer un token aléatoire sécurisé (pour reset password, etc.)
 * @param length - Longueur du token
 * @returns Token aléatoire
 */
export const generateSecureToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    token += chars[randomValues[i] % chars.length];
  }
  
  return token;
};
