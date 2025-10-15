import { Dificultad } from './types';

export const EMOJIS_DIFICULTAD: Record<Dificultad, string> = {
  'Fácil': '😊',
  'Medio': '😐',
  'Difícil': '😰',
};

/**
 * Utility functions for dates and other helpers.
 */
export function getCurrentDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getEmojiForDificultad(dificultad: Dificultad): string {
  return EMOJIS_DIFICULTAD[dificultad] || '';
}

