import { InputService } from './input';
import { TaskManager } from './taskManager';
import type { TaskFilter } from './types';
import { Estado } from './types';

/**
 * Menú para ver tareas (con filtro por estado).
 */
export async function showViewTasksMenu(taskManager: TaskManager, inputService: InputService): Promise<void> {
  console.log('\n=== VER TAREAS ===');
  console.log('Selecciona filtro:');
  console.log('1. Todas');
  console.log('2. Pendientes');
  console.log('3. En Curso');
  console.log('4. Terminadas');
  const filterNum = await inputService.getValidNumber('Selecciona filtro (1-4): ', 1, 4);

  let filter: TaskFilter = 'ALL';
  switch (filterNum) {
    case 1: filter = 'ALL'; break;
    case 2: filter = 'PENDIENTE'; break;
    case 3: filter = 'EN_CURSO'; break;
    case 4: filter = 'TERMINADA'; break;
  }

  const filteredTasks = taskManager.getFilteredTasks(filter);
  await taskManager.listTasks(filteredTasks, inputService);
}

/**
 * Menú para buscar tareas por título.
 */
export async function searchTaskMenu(taskManager: TaskManager, inputService: InputService): Promise<void> {
  console.log('\n=== BUSCAR TAREA ===');
  const query = await inputService.getValidString('Ingresa término de búsqueda: ', 100, false);
  const searchResults = await taskManager.searchTasks(query, inputService);
  if (searchResults.length > 0) {
    await taskManager.listTasks(searchResults, inputService, true);
  }
}

/**
 * Menú principal
 */
export async function showMainMenu(taskManager: TaskManager, inputService: InputService): Promise<void> {
  while (true) {
    console.log('\n=== MENÚ PRINCIPAL ===');
    console.log('1. Ver mis tareas');
    console.log('2. Buscar una tarea');
    console.log('3. Agregar una tarea');
    console.log('0. Salir');

    const option = await inputService.getValidNumber('Selecciona una opción: ', 0, 3);

    switch (option) {
      case 1:
        await showViewTasksMenu(taskManager, inputService);
        break;
      case 2:
        await searchTaskMenu(taskManager, inputService);
        break;
      case 3:
        await taskManager.addTask(inputService);
        break;
      case 0:
        taskManager.save(); 
        console.log('¡Hasta luego! Tareas guardadas.');
        return; 
    }
  }
}
