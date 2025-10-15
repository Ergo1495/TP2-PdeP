import { InputService } from "./input";
import { TaskManager } from "./taskManager";
import { showMainMenu } from "./menus";

async function main() {
  console.log("Bienvenido a la Lista de Tareas");

  // Crear instancias de las clases principales
  const inputService = new InputService(process.stdin, process.stdout);
  const taskManager = new TaskManager();

  // Cargar tareas guardadas si corresponde
  taskManager.load();

  try {
    // Mostrar el menú principal
    await showMainMenu(taskManager, inputService);
  } finally {
    // Cerrar InputService al salir
    inputService.close();
  }
}

// Ejecutar la app
main().catch((err) => {
  console.error("❌ Error al ejecutar la app:", err);
  process.exit(1);
});
