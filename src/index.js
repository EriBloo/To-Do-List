import { endOfToday, endOfWeek, endOfMonth } from 'date-fns';
import {
  clearContent,
  updateContent,
  clearCategories,
  updateCategories,
  createEvents,
  createEventsForButtons,
} from './dom';
import { CurrentTasks, TaskStorage } from './tasks';

createEvents.byDate(document.querySelector('.today'), endOfToday());
createEvents.byDate(document.querySelector('.week'), endOfWeek(endOfToday()));
createEvents.byDate(document.querySelector('.month'), endOfMonth(endOfToday()));
createEvents.allTasks(document.querySelector('.all'));

createEventsForButtons.addTask();
document
  .querySelector('.add-category-wrapper .fa-plus')
  .addEventListener('click', createEventsForButtons.addCategory);
document.addEventListener('keydown', createEventsForButtons.addCategory);

CurrentTasks.setCurrentTasks(TaskStorage.getTasksToDate(endOfToday()));
clearContent();
updateContent(CurrentTasks.getCurrentTasks());

clearCategories();
updateCategories(TaskStorage.getCategories());
