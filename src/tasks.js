import { isBefore } from 'date-fns';

const Task = (title, dueDate, id, description = '', category = '') => {
  const getTitle = () => title;
  const setTitle = (newTitle) => (title = newTitle);
  const getDescription = () => description;
  const setDescription = (newDescription) => (description = newDescription);
  const getCategory = () => category;
  const setCategory = (newCategory) => (category = newCategory);
  const getDueDate = () => dueDate;
  const setDueDate = (newDate) => (dueDate = newDate);
  const getId = () => id;
  const setId = (newId) => (id = newId);

  const creationDate = new Date();
  const getCreationDate = () => creationDate;

  let _finished = false;
  const toggleFinished = () => (_finished = !_finished);
  const getFinished = () => _finished;

  let _important = false;
  const toggleImportant = () => (_important = !_important);
	const getImportant = () => _important;
	
	let _expanded = false;
  const toggleExpanded = () => (_expanded = !_expanded);
	const getExpanded = () => _expanded;

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
    toggleFinished,
    getFinished,
    toggleImportant,
		getImportant,
		toggleExpanded,
		getExpanded,
  };
};

const Emitter = (() => {
  const _events = [];

  const on = (name, listener) => {
    _events[name] = _events[name] || [];
    _events[name].push(listener);
  };
  const remove = (name, listenerToRemove) => {
    if (!_events[name]) {
      throw new Error(`Can't remove listener. Event ${name} doesn't exist.`);
    }

    let index = _events[name].indexOf(listenerToRemove);
    if (index >= 0) {
      _events[name].splice(index, 1);
    }
  };
  const emit = (name, ...data) => {
    if (!_events[name]) {
      throw new Error(`Can't emit listener. Event ${name} doesn't exist.`);
    }

    _events[name].forEach((listener) => {
      listener(...data);
    });
  };

  return { on, remove, emit };
})();

const TaskStorage = (() => {
  let _taskStore = [];
  let _categories = new Set();
  let _currentId = 0;

  const addCategory = (category) => {
    _categories.add(category.trim().toLowerCase());
  };

  const getCategories = () => _categories;

  const removeCategory = (category) => {
    _categories.delete(category);
  };

  const addNewTask = (title, dueDate, description = '', category = '') => {
    const task = Task(
      title,
      new Date(dueDate),
      _currentId,
      description,
      category.trim().toLowerCase()
    );
    if (category) {
      addCategory(category);
    }
    _taskStore.push(task);
    _currentId += 1;
    Emitter.emit('changeTasks');
  };
  const removeTask = (id) => {
    id = parseInt(id);
    _taskStore = _taskStore.filter((task) => task.getId() !== id);
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
  };
  const getAllTasks = () => {
    Emitter.emit('getTasks', getAllTasks);
    return _taskStore;
  };
  const getTasksToDate = (date) => {
    date = typeof date === 'string' ? new Date(date) : date;
    const tasksToReturn = [];
    for (let task of _taskStore) {
      if (isBefore(task.getDueDate(), date)) {
        tasksToReturn.push(task);
      }
    }
    Emitter.emit('getTasks', getTasksToDate, date);
    return tasksToReturn;
  };
  const getTaskById = (id) => {
    id = parseInt(id);
    for (let task of _taskStore) {
      if (task.getId() === id) {
        return task;
      }
    }
    return null;
  };
  const getTasksByCategory = (category) => {
    category = category.toLowerCase();
    const tasksToReturn = [];
    for (let task of _taskStore) {
      if (task.getCategory() === category) {
        tasksToReturn.push(task);
      }
    }
    Emitter.emit('getTasks', getTasksByCategory, category);
    return tasksToReturn;
  };

  return {
    addCategory,
    getCategories,
    removeCategory,
    editTask,
    addNewTask,
    removeTask,
    getAllTasks,
    getTasksToDate,
    getTaskById,
    getTasksByCategory,
  };
})();

const CurrentTasks = (() => {
  let _currentTasks = [];
  let _lastFunction = null;
  let _lastData = null;

  const _saveLast = (f, d) => {
    _lastFunction = f;
    _lastData = d;
  };
  const _updateCurrent = () => {
    setCurrentTasks(_lastFunction(_lastData));
  };
  const getCurrentTasks = () => _currentTasks;
  const setCurrentTasks = (tasks) => (_currentTasks = tasks);

  Emitter.on('getTasks', _saveLast);
  Emitter.on('changeTasks', _updateCurrent);

  return { getCurrentTasks, setCurrentTasks };
})();

export { TaskStorage, CurrentTasks };
