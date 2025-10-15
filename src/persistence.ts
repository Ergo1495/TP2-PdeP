import type { Task } from './types';
import * as fs from 'fs';

/**
 * Persistence module for loading/saving tasks to JSON.
 */
export function saveTasks(tasks: Task[], filePath: string): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2));
  } catch (error) {
    console.error('Error al guardar tareas:', (error as Error).message);
  }
}

export function loadTasks(filePath: string): Task[] {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const loadedTasks: Task[] = JSON.parse(data);
      // Reassign IDs for sequentiality
      loadedTasks.forEach((task, index) => {
        task.id = index + 1;
      });
      console.log(`Cargadas ${loadedTasks.length} tareas desde ${filePath}.`);
      return loadedTasks;
    } else {
      console.log('Archivo de tareas no encontrado. Iniciando con lista vacía.');
      return [];
    }
  } catch (error) {
    console.error('Error al cargar tareas. Iniciando con lista vacía:', (error as Error).message);
    return [];
  }
}
