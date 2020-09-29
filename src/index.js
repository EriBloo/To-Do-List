import { endOfToday, endOfWeek, endOfMonth } from "date-fns";
import { createEvents, createEventsForButtons } from "./dom.js";

createEvents.byDate(document.querySelector(".today"), endOfToday());
createEvents.byDate(document.querySelector(".week"), endOfWeek(endOfToday()));
createEvents.byDate(document.querySelector(".month"), endOfMonth(endOfToday()));
createEvents.allTasks(document.querySelector(".all"));

document.querySelector(".today").click();

createEventsForButtons.addTask();