import { isBefore } from "date-fns";

const Task = (title, dueDate, id, description = "", category = "") => {
	const getTitle = () => title;
	const setTitle = (newTitle) => title = newTitle;
	const getDesctiption = () => description;
	const setDescription = (newDescription) => description = newDescription;
	const getCategory = () => category;
	const setCategory = (newCategory) => category = newCategory;
	const getDueDate = () => dueDate;
	const setDueDate = (newDate) => dueDate = newDate;
	const getId = () => id;
	const setId = (newId) => id = newId;
	
	const creationDate = new Date();
	const getCreationDate = () => creationDate;

	let finished = false;
	const toggleFinished = () => finished = !finished;
	const getFinished = () => finished;

	return { getTitle, setTitle, getDesctiption, setDescription, getCategory, setCategory, getDueDate, setDueDate, getId, setId, getCreationDate, toggleFinished, getFinished }
}

/* NOT USED AT THE MOMENT, BUT LEFT IF NEEDED
const Emitter = (() => {
	const _events = [];

	const on = (name, listener) => {
		_events[name] = _events[name] || [];
		_events[name].push(listener);
	}
	const remove = (name, listenerToRemove) => {
		if (!_events[name]) {
			throw new Error(`Can't remove listener. Event ${name} doesn't exist.`)
		}

		let index = _events[name].indexOf(listenerToRemove);
		if (index >= 0) {
			_events[name].splice(index, 1);
		}
	}
	const emit = (name, ...data) => {
		if (!_events[name]) {
			throw new Error(`Can't emit listener. Event ${name} doesn't exist.`);
		}

		_events[name].forEach((listener) => {
			listener(data);
		});
	}

	return { on, remove, emit }
})();
*/

const TaskStorage = (() => {
	let _taskStore = [];
	let _currentId = 0;
	let _lastCall = null;
	let _lastData = null;

	const _saveLast = (call, data = null) => {
		_lastCall = call;
		_lastData = data;
	}
	const _callLast = () => {
		if (_lastCall) {
			_lastCall(_lastData)
		}
	}

	const addNewTask = (title, dueDate, description = "", category = "") => {
		const task = Task(title, new Date(dueDate), _currentId, description, category.toLowerCase());
		_taskStore.push(task);
		_currentId += 1;
		_callLast();
	}
	const removeTask = (id) => {
		_taskStore = _taskStore.filter((task) => task.getId() !== id );
		_callLast();
	}
	const getAllTasks = () => {
		_saveLast(getAllTasks);
		return _taskStore;
	}
	const getTasksToDate = (date) => {
		date = typeof date === 'string' ? new Date(date) : date;
		const tasksToReturn = [];
		for (let task of _taskStore) {
			if (isBefore(task.getDueDate(), date)) {
				tasksToReturn.push(task);
			}
		}
		_saveLast(getTasksToDate, date);
		return tasksToReturn;
	}
	const getTaskById = (id) => {
		for (let task of _taskStore) {
			if (task.getId() === id) {
				return task;
			}
		}
		return null;
	}
	const getTasksByCategory = (category) => {
		category = category.toLowerCase();
		const tasksToReturn = [];
		for (let task of _taskStore) {
			if (task.getCategory() === category) {
				tasksToReturn.push(task);
			}
		}
		_saveLast(getTasksByCategory, category);
		return tasksToReturn;
	}

	return { addNewTask, removeTask, getAllTasks, getTasksToDate, getTaskById, getTasksByCategory }
})();

const currentTasks = (() => {
	const _currentTasks = [];
	
	const getCurrentTasks = () => _currentTasks;
	const setCurrentTasks = (tasks) => _currentTasks = tasks;

	return { getCurrentTasks, setCurrentTasks }
	
})();

export { TaskStorage };