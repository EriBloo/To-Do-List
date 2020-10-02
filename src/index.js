import { endOfToday, endOfWeek, endOfMonth, fromUnixTime } from 'date-fns';
import {
  clearContent,
  updateContent,
  clearCategories,
  updateCategories,
  createEvents,
  createEventsForButtons,
} from './dom.js';
import { CurrentTasks, TaskStorage } from './tasks.js';

createEvents.byDate(document.querySelector('.today'), endOfToday());
createEvents.byDate(document.querySelector('.week'), endOfWeek(endOfToday()));
createEvents.byDate(document.querySelector('.month'), endOfMonth(endOfToday()));
createEvents.allTasks(document.querySelector('.all'));

createEventsForButtons.addTask();
createEventsForButtons.addCategory();

CurrentTasks.setCurrentTasks(TaskStorage.getTasksToDate(endOfToday()));
clearContent();
updateContent(CurrentTasks.getCurrentTasks());

clearCategories();
updateCategories(TaskStorage.getCategories());
