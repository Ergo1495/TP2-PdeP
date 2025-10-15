import type { Task, TaskFilter } from './types';
import { Estado, Dificultad } from './types';
import { InputService } from './input';
import { getCurrentDate, getEmojiForDificultad } from './utils';
import { saveTasks, loadTasks } from './persistence';

/**
 * TaskManager class: Abstracts task CRUD operations, state management, and persistence.
 * Encapsulates the tasks array and provides a clean API for operations.
 */
export class TaskManager {
  private tasks: Task[] = [];
  private filePath: string;

  constructor(filePath: string = 'tasks.json') {
    this.filePath = filePath;
  }

  load(): void {
    this.tasks = loadTasks(this.filePath);
  }

  save(): void {
    saveTasks(this.tasks, this.filePath);
  }

  getTasks(): Task[] {
    return [...this.tasks]; // Return copy for immutability
  }

  async addTask(inputService: InputService): Promise<void> {
    console.log('\n=== AGREGAR NUEVA TAREA ===');
    const titulo = await inputService.getValidString('Título: ', 100, false);
    const descripcion = await inputService.getValidString('Descripción: ', 500, true) || null;
    const estado = await inputService.getEstadoSelection();
    const dificultad = await inputService.getDificultadSelection();
    const vencimiento = await inputService.getValidDate('Fecha de Vencimiento (YYYY-MM-DD)');
    const creacion = getCurrentDate();
    const ultimaEdicion = creacion;

    const newTask: Task = {
      id: this.tasks.length + 1,
      titulo,
      descripcion,
      estado,
      dificultad,
      creacion,
      ultimaEdicion,
      vencimiento
    };

    this.tasks.push(newTask);
    this.save();
    console.log('\n¡Tarea agregada y guardada exitosamente!');
    await inputService.pressEnterToContinue();
  }

  async editTask(taskId: number, inputService: InputService): Promise<boolean> {
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      console.log('Tarea no encontrada.');
      await inputService.pressEnterToContinue();
      return false;
    }

    const task = this.tasks[taskIndex];
    console.log('\n=== EDITAR TAREA ===');
    console.log('Deja en blanco para no cambiar un campo.');

    const tituloInput = await inputService.getValidString(
      `Título actual: ${task.titulo}\nNuevo título: `,
      100,
      true
    );
    const newTitulo = tituloInput || task.titulo;

    const descripcionInput = await inputService.getValidString(
      `Descripción actual: ${task.descripcion || 'Sin datos'}\nNueva descripción: `,
      500,
      true
    );
    const newDescripcion = descripcionInput || task.descripcion;

    const estado = await inputService.getEstadoSelection();

    const dificultad = await inputService.getDificultadSelection();

    const vencimientoInput = await inputService.getValidDate(
      `Vencimiento actual: ${task.vencimiento || 'Sin datos'}\nNuevo vencimiento: `,
      true
    );
    const newVencimiento = vencimientoInput || task.vencimiento;

    // Update
    this.tasks[taskIndex] = {
      ...this.tasks[taskIndex],
      titulo: newTitulo,
      descripcion: newDescripcion,
      estado,
      dificultad,
      vencimiento: newVencimiento,
      ultimaEdicion: getCurrentDate()
    };

    this.save();
    console.log('\n¡Tarea editada y guardada exitosamente!');
    await inputService.pressEnterToContinue();
    return true;
  }

  async showTaskDetails(taskId: number, inputService: InputService): Promise<void> {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) {
      console.log('Tarea no encontrada.');
      await inputService.pressEnterToContinue();
      return;
    }

    console.log('\n=== DETALLES DE LA TAREA ===');
    console.log(`ID: ${task.id}`);
    console.log(`Título: ${task.titulo}`);
    console.log(`Descripción: ${task.descripcion || 'Sin datos'}`);
    console.log(`Estado: ${task.estado}`);
    console.log(`Dificultad: ${task.dificultad} ${getEmojiForDificultad(task.dificultad)}`);
    console.log(`Creación: ${task.creacion}`);
    console.log(`Última Edición: ${task.ultimaEdicion}`);
    console.log(`Vencimiento: ${task.vencimiento || 'Sin datos'}`);

    console.log('\nOpciones:');
    console.log('E - Editar tarea');
    console.log('0 - Volver al menú anterior');

    const input = await inputService.question('Selecciona una opción: ');
    if (input.toUpperCase() === 'E') {
      await this.editTask(task.id, inputService);
      await this.showTaskDetails(task.id, inputService); // Refresh details
    } else if (input !== '0') {
      console.log('Opción inválida.');
      await this.showTaskDetails(task.id, inputService); // Retry
    }
  }

  getFilteredTasks(filter: TaskFilter): Task[] {
    let filtered = this.tasks;
    switch (filter) {
      case 'PENDIENTE':
        filtered = filtered.filter(t => t.estado === Estado.PENDIENTE);
        break;
      case 'EN_CURSO':
        filtered = filtered.filter(t => t.estado === Estado.EN_CURSO);
        break;
      case 'TERMINADA':
        filtered = filtered.filter(t => t.estado === Estado.TERMINADA);
        break;
      case 'ALL':
      default:
        break;
    }
    // Sort alphabetically by title (bonus)
    return filtered.sort((a, b) => a.titulo.localeCompare(b.titulo));
  }

  async listTasks(filteredTasks: Task[], inputService: InputService, fromSearch: boolean = false): Promise<void> {
    if (filteredTasks.length === 0) {
      console.log('\nNo hay tareas que cumplan con los criterios.');
      await inputService.pressEnterToContinue();
      return; // Caller handles navigation
    }

    console.log('\n=== LISTADO DE TAREAS ===');
    filteredTasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task.titulo} - ${task.estado} (${task.dificultad} ${getEmojiForDificultad(task.dificultad)})`);
    });

    console.log('\nOpciones:');
    console.log('Selecciona un número para ver detalles.');
    console.log('0 - Volver al menú anterior');

    const input = await inputService.question('Selecciona una opción: ');
    const num = parseInt(input);
    if (num === 0) {
      // Navigation handled by caller
      return;
    } else if (num > 0 && num <= filteredTasks.length) {
      const selectedTask = filteredTasks[num - 1];
      await this.showTaskDetails(selectedTask.id, inputService);
      await this.listTasks(filteredTasks, inputService, fromSearch); // Refresh list
    } else {
      console.log('Opción inválida.');
      await this.listTasks(filteredTasks, inputService, fromSearch); // Retry
    }
  }

  async searchTasks(query: string, inputService: InputService): Promise<Task[]> {
    const searchQuery = query.toLowerCase().trim();
    if (!searchQuery) {
      console.log('Búsqueda vacía.');
      await inputService.pressEnterToContinue();
      return [];
    }

    const filtered = this.tasks.filter(task =>
      task.titulo.toLowerCase().includes(searchQuery)
    );

    if (filtered.length === 0) {
      console.log('No se encontraron tareas que coincidan con la búsqueda.');
      await inputService.pressEnterToContinue();
      return [];
    }

    return filtered;
  }
}
