import { isBefore } from 'date-fns';

const Task = (
  taskTitle,
  taskDueDate,
  taskId,
  taskDescription = '',
  taskCategory = '',
  taskCreationDate = new Date(),
  taskFinished = false,
  taskImportant = false,
  taskExpanded = false,
) => {
  let title = taskTitle;
  let dueDate = taskDueDate;
  let id = taskId;
  let description = taskDescription;
  let category = taskCategory;
  let creationDate = taskCreationDate;
  let finished = taskFinished;
  let important = taskImportant;
  let expanded = taskExpanded;

  const getTitle = () => title;
  const setTitle = (newTitle) => {
    title = newTitle;
  };
  const getDescription = () => description;
  const setDescription = (newDescription) => {
    description = newDescription;
  };
  const getCategory = () => category;
  const setCategory = (newCategory) => {
    category = newCategory;
  };
  const getDueDate = () => dueDate;
  const setDueDate = (newDate) => {
    dueDate = newDate;
  };
  const getId = () => id;
  const setId = (newId) => {
    id = newId;
  };

  const getCreationDate = () => creationDate;
  const setCreationDate = (newCreationDate) => {
    creationDate = newCreationDate;
  };

  const toggleFinished = () => {
    finished = !finished;
  };
  const getFinished = () => finished;
  const setFinished = (bool) => {
    finished = bool;
  };

  const toggleImportant = () => {
    important = !important;
  };
  const getImportant = () => important;
  const setImportant = (bool) => {
    important = bool;
  };

  const toggleExpanded = () => {
    expanded = !expanded;
  };
  const getExpanded = () => expanded;
  const setExpanded = (bool) => {
    expanded = bool;
  };

  return {
    getTitle,
    setTitle,
    getDescription,
    setDescription,
    getCategory,
    setCategory,
    getDueDate,
    setDueDate,
    getId,
    setId,
    getCreationDate,
    setCreationDate,
    toggleFinished,
    getFinished,
    setFinished,
    toggleImportant,
    getImportant,
    setImportant,
    toggleExpanded,
    getExpanded,
    setExpanded,
  };
};

const Emitter = (() => {
  const events = [];

  const on = (name, listener) => {
    events[name] = events[name] || [];
    events[name].push(listener);
  };
  const remove = (name, listenerToRemove) => {
    if (!events[name]) {
      throw new Error(`Can't remove listener. Event ${name} doesn't exist.`);
    }

    const index = events[name].indexOf(listenerToRemove);
    if (index >= 0) {
      events[name].splice(index, 1);
    }
  };
  const emit = (name, ...data) => {
    if (!events[name]) {
      throw new Error(`Can't emit listener. Event ${name} doesn't exist.`);
    }

    events[name].forEach((listener) => {
      listener(...data);
    });
  };

  return { on, remove, emit };
})();

const TaskStorage = (() => {
  let taskStore = [];
  const categories = new Set();
  let currentId = 0;

  const addCategory = (category) => {
    categories.add(category.trim().toLowerCase());
  };

  const getCategories = () => categories;

  const removeCategory = (category) => {
    categories.delete(category);
  };

  const getTaskById = (id) => {
    let taskToReturn = null;
    taskStore.forEach((task) => {
      if (task.getId() === parseInt(id, 10)) {
        taskToReturn = task;
      }
    });
    return taskToReturn;
  };
  const addNewTask = (
    title,
    dueDate,
    description = '',
    category = '',
    creationDate = new Date(),
    finished = false,
    important = false,
    expanded = false,
  ) => {
    const task = Task(
      title,
      new Date(dueDate),
      currentId,
      description,
      category.trim().toLowerCase(),
      new Date(creationDate),
      finished,
      important,
      expanded,
    );
    if (category) {
      addCategory(category);
    }
    taskStore.push(task);
    currentId += 1;
    Emitter.emit('changeTasks');
  };
  const removeTask = (id) => {
    taskStore = taskStore.filter((task) => task.getId() !== parseInt(id, 10));
    Emitter.emit('changeTasks');
  };
  const editTask = (id, newTitle, newDueDate, newDescription, newCategory) => {
    const task = getTaskById(id);
    task.setTitle(newTitle);
    task.setDueDate(new Date(newDueDate));
    task.setDescription(newDescription);
    task.setCategory(newCategory);
    if (newCategory) {
      addCategory(newCategory);
    }
    Emitter.emit('changeTasks');
  };
  const getAllTasks = () => {
    Emitter.emit('getTasks', getAllTasks);
    return taskStore;
  };
  const getTasksToDate = (date) => {
    const tasksToReturn = [];

    taskStore.forEach((task) => {
      if (isBefore(task.getDueDate(), date)) {
        tasksToReturn.push(task);
      }
    });
    Emitter.emit('getTasks', getTasksToDate, date);
    return tasksToReturn;
  };
  const getTasksByCategory = (category) => {
    const tasksToReturn = [];

    taskStore.forEach((task) => {
      if (task.getCategory() === category.toLowerCase()) {
        tasksToReturn.push(task);
      }
    });
    Emitter.emit('getTasks', getTasksByCategory, category.toLowerCase());
    return tasksToReturn;
  };

  return {
    addCategory,
    getCategories,
    removeCategory,
    addNewTask,
    removeTask,
    editTask,
    getAllTasks,
    getTasksToDate,
    getTaskById,
    getTasksByCategory,
  };
})();

const CurrentTasks = (() => {
  let currentTasks = [];
  let lastFunction = null;
  let lastData = null;

  const getCurrentTasks = () => currentTasks;
  const setCurrentTasks = (tasks) => (currentTasks = tasks);
  const saveLast = (f, d) => {
    lastFunction = f;
    lastData = d;
  };
  const updateCurrent = () => {
    if (lastFunction) {
      setCurrentTasks(lastFunction(lastData));
    }
  };

  Emitter.on('getTasks', saveLast);
  Emitter.on('changeTasks', updateCurrent);

  return { getCurrentTasks, setCurrentTasks };
})();

export {
  Task, Emitter, TaskStorage, CurrentTasks,
};
