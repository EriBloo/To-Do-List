import { format } from "date-fns";
import { TaskStorage, CurrentTasks } from "./tasks.js";

function createTaskElement(task) {
	const taskDiv = document.createElement("div");
	taskDiv.classList.add("task");
	if (task.getFinished()) {
		taskDiv.classList.add("done");
	}
	taskDiv.setAttribute("data", task.getId());
	taskDiv.addEventListener("click", createEventsForButtons.expandTask);

	const markSpan = document.createElement("span");
	markSpan.classList.add("mark");
	const markIcon = document.createElement("i");
	markIcon.classList.add("far");
	markIcon.classList.add(task.getFinished() ? "fa-check-circle" : "fa-circle");
	markSpan.appendChild(markIcon);
	taskDiv.appendChild(markSpan);

	const titleH3 = document.createElement("h3");
	titleH3.classList.add("title");
	titleH3.textContent = task.getTitle();
	taskDiv.appendChild(titleH3);

	const arrowUpSpan = document.createElement("span");
	arrowUpSpan.classList.add("arrow-up");
	const arrowUpIcon = document.createElement("i");
	arrowUpIcon.classList.add("fas");
	arrowUpIcon.classList.add("fa-caret-up");
	arrowUpSpan.appendChild(arrowUpIcon);
	taskDiv.appendChild(arrowUpSpan);

	const arrowDownSpan = document.createElement("span");
	arrowDownSpan.classList.add("arrow-down");
	const arrowDownIcon = document.createElement("i");
	arrowDownIcon.classList.add("fas");
	arrowDownIcon.classList.add("fa-caret-down");
	arrowDownSpan.appendChild(arrowDownIcon);
	taskDiv.appendChild(arrowDownSpan);

	const deleteSpan = document.createElement("span");
	deleteSpan.classList.add("delete");
	deleteSpan.addEventListener("click", createEventsForButtons.removeTask);
	const deleteIcon = document.createElement("i");
	deleteIcon.classList.add("fas");
	deleteIcon.classList.add("fa-plus");
	deleteSpan.appendChild(deleteIcon);
	taskDiv.appendChild(deleteSpan);

	const descH4 = document.createElement("h4");
	descH4.classList.add("description");
	descH4.textContent = task.getDescription();
	taskDiv.appendChild(descH4);

	const createH4 = document.createElement("h4");
	createH4.classList.add("created");
	createH4.textContent = `Created: ${format(task.getCreationDate(), "d MMMM yyyy")}`;
	taskDiv.appendChild(createH4);

	const dueH4 = document.createElement("h4");
	dueH4.classList.add("due");
	dueH4.textContent = `Due: ${format(task.getDueDate(), "d MMMM yyyy")}`;
	taskDiv.appendChild(dueH4);

	const editSpan = document.createElement("span");
	editSpan.classList.add("edit");
	const editIcon = document.createElement("i");
	editIcon.classList.add("fas");
	editIcon.classList.add("fa-pen");
	editSpan.appendChild(editIcon);
	taskDiv.appendChild(editSpan);

	return taskDiv;
}

function createPopUpElement() {
	const popUpContainerDiv = document.createElement("div");
	popUpContainerDiv.classList.add("pop-up-container");

	const popUpDiv = document.createElement("div");
	popUpDiv.classList.add("pop-up");
	popUpContainerDiv.appendChild(popUpDiv);

	return popUpContainerDiv;
}

function createTaskFormElement() {
	const taskForm = document.createElement("form");
	taskForm.classList.add("modify-task");

	const titleH2 = document.createElement("h2");
	titleH2.textContent = "Create new task";
	taskForm.appendChild(titleH2);

	const titleInput = document.createElement("input");
	titleInput.classList.add("form-title");
	titleInput.setAttribute("type", "text");
	titleInput.setAttribute("name", "title");
	titleInput.setAttribute("placeholder", "Title");
	titleInput.setAttribute("autocomplete", "off");
	titleInput.setAttribute("required", "true");
	taskForm.appendChild(titleInput);

	const descriptionInput = document.createElement("input");
	descriptionInput.classList.add("form-description");
	descriptionInput.setAttribute("type", "text");
	descriptionInput.setAttribute("name", "description");
	descriptionInput.setAttribute("placeholder", "Description");
	descriptionInput.setAttribute("autocomplete", "off");
	taskForm.appendChild(descriptionInput);

	const categoryInput = document.createElement("input");
	categoryInput.classList.add("form-category");
	categoryInput.setAttribute("type", "text");
	categoryInput.setAttribute("name", "category");
	categoryInput.setAttribute("placeholder", "Category");
	categoryInput.setAttribute("autocomplete", "off");
	taskForm.appendChild(categoryInput);

	const dateInput = document.createElement("input");
	dateInput.classList.add("form-date");
	dateInput.setAttribute("type", "date");
	dateInput.setAttribute("name", "date");
	dateInput.setAttribute("title", "Due Date");
	dateInput.setAttribute("required", "true");
	taskForm.appendChild(dateInput);

	const cancelButton = document.createElement("button");
	cancelButton.classList.add("form-cancel");
	cancelButton.setAttribute("type", "button");
	cancelButton.textContent = "Cancel";
	taskForm.appendChild(cancelButton);

	const submitButton = document.createElement("button");
	submitButton.classList.add("form-submit");
	submitButton.setAttribute("type", "button");
	submitButton.textContent = "Submit";
	taskForm.appendChild(submitButton);

	return taskForm;
}

function clearContent() {
	const contentElement = document.querySelector(".content");
	while (contentElement.childElementCount > 1) {
		contentElement.removeChild(contentElement.firstChild)
	}
}

function updateContent(tasks) {
	const contentElement = document.querySelector(".content");
	const addTaskElement = document.querySelector(".add-task");

	for (let task of tasks) {
		contentElement.insertBefore(createTaskElement(task), addTaskElement);
	}
}

const currentMark = ((current) => {
	let _current = current;

	const moveCurrent = (newElement) => {
		_current.classList.remove("current");
		newElement.classList.add("current");
		_current = newElement
	}

	return { moveCurrent }
})(document.querySelector(".today"));

const createEvents = (() => {
	function _updateCurrentProjectTitle(title) {
		const currentProjectTitle = document.querySelector(".current-project");
		currentProjectTitle.textContent = title;
	}
	const byDate = (element, date) => {
		element.addEventListener("click", () => {
			_updateCurrentProjectTitle(element.textContent);
			CurrentTasks.setCurrentTasks(TaskStorage.getTasksToDate(date));
			clearContent();
			updateContent(CurrentTasks.getCurrentTasks());
			currentMark.moveCurrent(element);
		});
	}

	const byCategory = (element, category) => {
		element.addEventListener("click", () => {
			_updateCurrentProjectTitle(element.textContent)
			CurrentTasks.setCurrentTasks(TaskStorage.getTasksByCategory(category));
			clearContent();
			updateContent(CurrentTasks.getCurrentTasks());
			currentMark.moveCurrent(element);
		});
	}

	const allTasks = (element) => {
		element.addEventListener("click", () => {
			_updateCurrentProjectTitle(element.textContent)
			CurrentTasks.setCurrentTasks(TaskStorage.getAllTasks());
			clearContent();
			updateContent(CurrentTasks.getCurrentTasks());
			currentMark.moveCurrent(element);
		});
	};

	return { byDate, byCategory, allTasks }
})();

const createEventsForButtons = (() => {
	const addTask = () => {
		const addTaskElement = document.querySelector(".add-task");
		addTaskElement.addEventListener("click", () => {
			const contentElement = document.querySelector(".content");
			const popUpElement = createPopUpElement();
			const taskForm = createTaskFormElement();
			popUpElement.firstChild.appendChild(taskForm);
			contentElement.appendChild(popUpElement);
		});
	}

	const removeTask = (e) => {
		const id = e.target.parentNode.parentNode.getAttribute("data");
		const taskToRemove = document.querySelector(`.task[data="${id}"]`);
		const contentElement = document.querySelector(".content");
		contentElement.removeChild(taskToRemove);
		TaskStorage.removeTask(id);
		clearContent();
		updateContent(CurrentTasks.getCurrentTasks());
	}

	const expandTask = (e) => {
		if (e.target === e.currentTarget) {
			e.target.classList.toggle("expanded");
		}
	}

	return { addTask, removeTask, expandTask }
})();

export { createEvents, createEventsForButtons }