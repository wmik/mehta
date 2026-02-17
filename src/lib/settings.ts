import {
  encrypt as cryptoEncrypt,
  decrypt as cryptoDecrypt,
  maskApiKey,
  deriveKey
} from './crypto';

export interface UserSettings {
  aiProvider?: 'openai' | 'anthropic' | 'ollama' | 'system';
  llmUrl?: string;
  llmKey?: string;
  theme?: 'light' | 'dark' | 'system';
  compactMode?: boolean;
  notifications?: {
    email?: boolean;
    analysisComplete?: boolean;
    riskDetected?: boolean;
  };
}

export const DEFAULT_SETTINGS: UserSettings = {
  aiProvider: 'system',
  llmUrl: '',
  llmKey: '',
  theme: 'system',
  compactMode: false,
  notifications: {
    email: true,
    analysisComplete: true,
    riskDetected: true
  }
};

export function getMergedSettings(
  userSettings: UserSettings | null | undefined
): UserSettings {
  if (!userSettings) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...userSettings };
}

export function encryptLlmKey(
  key: string,
  userId: string,
  createdAt: Date
): string {
  if (!key) return '';
  const keyBuffer = deriveKey(userId, createdAt);
  return cryptoEncrypt(key, keyBuffer);
}

export function decryptLlmKey(
  encryptedKey: string,
  userId: string,
  createdAt: Date
): string {
  if (!encryptedKey) return '';
  const keyBuffer = deriveKey(userId, createdAt);
  return cryptoDecrypt(encryptedKey, keyBuffer);
}

export function getSettingsWithDecryptedKey(
  userSettings: UserSettings | null | undefined,
  userId: string,
  createdAt: Date
): UserSettings & { llmKeyDecrypted?: string } {
  const merged = getMergedSettings(userSettings);

  if (merged.llmKey) {
    return {
      ...merged,
      llmKeyDecrypted: decryptLlmKey(merged.llmKey, userId, createdAt)
    };
  }

  return merged;
}

export function getSettingsForResponse(
  userSettings: UserSettings | null | undefined,
  userId: string,
  createdAt: Date
): UserSettings & { llmKey?: string } {
  const merged = getMergedSettings(userSettings);

  if (merged.llmKey) {
    const decrypted = decryptLlmKey(merged.llmKey, userId, createdAt);
    return {
      ...merged,
      llmKey: maskApiKey(decrypted)
    };
  }

  return merged;
}

export { maskApiKey };
