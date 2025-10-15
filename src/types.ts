export interface Task {
  id: number;
  titulo: string;
  descripcion: string | null;
  estado: Estado;
  dificultad: Dificultad;
  creacion: string;
  ultimaEdicion: string;
  vencimiento: string | null;
}

export enum Estado {
  PENDIENTE = 'Pendiente',
  EN_CURSO = 'En Curso',
  TERMINADA = 'Terminada',
  CANCELADA = 'Cancelada'
}

export enum Dificultad {
  FACIL = 'Fácil',
  MEDIO = 'Medio',
  DIFIL = 'Difícil'
}

export const EMOJIS_DIFICULTAD: Record<Dificultad, string> = {
  [Dificultad.FACIL]: '⭐',
  [Dificultad.MEDIO]: '⭐⭐',
  [Dificultad.DIFIL]: '⭐⭐⭐'
};

export type TaskFilter = 'ALL' | 'PENDIENTE' | 'EN_CURSO' | 'TERMINADA';
