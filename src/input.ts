import * as readline from 'readline';
import { Estado, Dificultad } from './types';

/**
 * InputService class for handling user input, validation, and readline interactions.
 * Abstracts all console I/O for reusability and testability.
 */
export class InputService {
  private rl: readline.Interface;

  constructor(input: NodeJS.ReadableStream, output: NodeJS.WritableStream) {
    this.rl = readline.createInterface({
      input,
      output
    });
  }

  close(): void {
    this.rl.close();
  }

  async pressEnterToContinue(message: string = 'Presiona Enter para continuar...'): Promise<void> {
    console.log(message);
    await this.question('');
  }

  async getValidNumber(prompt: string, min: number, max: number): Promise<number> {
    const input = await this.question(prompt);
    const num = parseInt(input);
    if (isNaN(num) || num < min || num > max) {
      console.log('Opción inválida. Intenta de nuevo.');
      return this.getValidNumber(prompt, min, max);
    }
    return num;
  }

  async getValidString(prompt: string, maxLength: number, allowEmpty: boolean = false): Promise<string> {
    const input = await this.question(prompt);
    const trimmed = input.trim();
    if (!allowEmpty && (!trimmed || trimmed.length === 0)) {
      console.log('Este campo no puede estar vacío. Intenta de nuevo.');
      return this.getValidString(prompt, maxLength, allowEmpty);
    } else if (trimmed.length > maxLength) {
      console.log(`Máximo ${maxLength} caracteres. Intenta de nuevo.`);
      return this.getValidString(prompt, maxLength, allowEmpty);
    }
    return trimmed || '';
  }

  async getValidDate(prompt: string, allowEmpty: boolean = true): Promise<string | null> {
    const input = await this.question(`${prompt} (deja en blanco para omitir): `);
    if (allowEmpty && !input.trim()) {
      return null;
    }
    const date = new Date(input);
    if (isNaN(date.getTime())) {
      console.log('Fecha inválida. Usa formato YYYY-MM-DD. Intenta de nuevo.');
      return this.getValidDate(prompt, allowEmpty);
    }
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  async getEstadoSelection(current?: Estado): Promise<Estado> {
    if (current) {
      console.log(`Estado actual: ${current}`);
      console.log('Selecciona para cambiar (o 0 para mantener actual):');
    } else {
      console.log('\nEstados disponibles:');
    }
    console.log('1. Pendiente');
    console.log('2. En Curso');
    console.log('3. Terminada');
    console.log('4. Cancelada');
    console.log('0. Mantener actual / Omitir');
    const num = await this.getValidNumber('Selecciona el estado (0-4): ', 0, 4);
    if (num === 0) return current || Estado.PENDIENTE;
    switch (num) {
      case 1: return Estado.PENDIENTE;
      case 2: return Estado.EN_CURSO;
      case 3: return Estado.TERMINADA;
      case 4: return Estado.CANCELADA;
      default: return this.getEstadoSelection(current);
    }
  }

  async getDificultadSelection(current?: Dificultad): Promise<Dificultad> {
    if (current) {
      console.log(`Dificultad actual: ${current}`);
      console.log('Selecciona para cambiar (o 0 para mantener actual):');
    } else {
      console.log('\nDificultades disponibles:');
    }
    console.log('1. Fácil');
    console.log('2. Medio');
    console.log('3. Difícil');
    console.log('0. Mantener actual / Omitir');
    const num = await this.getValidNumber('Selecciona la dificultad (0-3): ', 0, 3);
    if (num === 0) return current || Dificultad.FACIL;
    switch (num) {
      case 1: return Dificultad.FACIL;
      case 2: return Dificultad.MEDIO;
      case 3: return Dificultad.DIFIL;
      default: return this.getDificultadSelection(current);
    }
  }

  async question(query: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(query, resolve);
    });
  }
}
