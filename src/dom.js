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
	markSpan.addEventListener("click", createEventsForButtons.markDone)
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
	editSpan.addEventListener("click", createEventsForButtons.editTask);
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

function createTaskFormElement(title, submitTarget) {
	const taskForm = document.createElement("form");
	taskForm.classList.add("modify-task");
	taskForm.setAttribute("method", "post");
	taskForm.addEventListener("submit", submitTarget);

	const titleH2 = document.createElement("h2");
	titleH2.textContent = title;
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
	dateInput.setAttribute("min", format(new Date(), "yyyy-MM-dd"));
	dateInput.setAttribute("required", "true");
	taskForm.appendChild(dateInput);

	const cancelButton = document.createElement("button");
	cancelButton.classList.add("form-cancel");
	cancelButton.setAttribute("type", "button");
	cancelButton.textContent = "Cancel";
	cancelButton.addEventListener("click", createEventsForButtons.formCancel);
	taskForm.appendChild(cancelButton);

	const submitButton = document.createElement("button");
	submitButton.classList.add("form-submit");
	submitButton.setAttribute("type", "submit");
	submitButton.textContent = "Submit";
	taskForm.appendChild(submitButton);

	return taskForm;
}

function clearContent() {
	const contentElement = document.querySelector(".content");
	while (contentElement.childElementCount > 1) {
		contentElement.removeChild(contentElement.firstChild);
	}
}

function updateContent(tasks) {
	const contentElement = document.querySelector(".content");
	const addTaskElement = document.querySelector(".add-task");

	for (let task of tasks) {
		contentElement.insertBefore(createTaskElement(task), addTaskElement);
	}
}

function createCategoryElement(category) {
	const categoryH2 = document.createElement("h2");
	categoryH2.classList.add("category");
	categoryH2.classList.add("other");
	categoryH2.textContent = category;
	createEvents.byCategory(categoryH2, category);

	return categoryH2;
}

function clearCategories() {
	const projectElement = document.querySelector(".by-project");
	while (projectElement.childElementCount > 1) {
		projectElement.removeChild(projectElement.firstChild);
	}
}

function updateCategories(categories) {
	const projectElement = document.querySelector(".by-project");
	const addCategoryElement = document.querySelector(".add-category-wrapper");

	for (let category of categories) {
		projectElement.insertBefore(createCategoryElement(category), addCategoryElement);
	}
}

const currentMark = ((current) => {
	let _current = current;

	const moveCurrent = (newElement) => {
		_current.classList.remove("current");
		newElement.classList.add("current");
		_current = newElement;
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
			const containerElement = document.querySelector(".container");
			const popUpElement = createPopUpElement();
			const taskFormElement = createTaskFormElement("Create new task", formAddTask);
			popUpElement.firstChild.appendChild(taskFormElement);
			containerElement.appendChild(popUpElement);
		});
	}

	const removeTask = (e) => {
		const id = e.target.parentNode.getAttribute("data");
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

	const editTask = (e) => {
		const id = e.target.parentNode.getAttribute("data");
		const task = TaskStorage.getTaskById(id);
		const containerElement = document.querySelector(".container");
		const popUpElement = createPopUpElement();
		const taskFormElement = createTaskFormElement("Edit task", formEditTask.bind(null, id));

		taskFormElement.querySelector(".form-title").value = task.getTitle();
		taskFormElement.querySelector(".form-description").value = task.getDescription();
		taskFormElement.querySelector(".form-category").value = task.getCategory();
		taskFormElement.querySelector(".form-date").value = format(task.getDueDate(), "yyyy-MM-dd");

		popUpElement.firstChild.appendChild(taskFormElement);
		containerElement.appendChild(popUpElement);
	}

	const markDone = (e) => {
		e.target.parentNode.classList.toggle("done");
		if (e.target.parentNode.classList.contains("done")) {
			e.target.firstChild.classList.remove("fa-circle");
			e.target.firstChild.classList.add("fa-check-circle");
		}
		else {
			e.target.firstChild.classList.remove("fa-check-circle");
			e.target.firstChild.classList.add("fa-circle");
		}
		const id = e.target.parentNode.getAttribute("data");
		TaskStorage.getTaskById(id).toggleFinished();
	}

	const formCancel = () => {
		const containerElement = document.querySelector(".container");
		const popUpElement = document.querySelector(".pop-up-container");
		containerElement.removeChild(popUpElement);
	}

	const formAddTask = (e) => {
		e.preventDefault();
		const inputTitle = e.target.querySelector(".form-title");
		const inputDate = e.target.querySelector(".form-date");
		const inputDescription = e.target.querySelector(".form-description");
		const inputCategory = e.target.querySelector(".form-category");

		TaskStorage.addNewTask(inputTitle.value, inputDate.value, inputDescription.value, inputCategory.value);

		clearContent();
		updateContent(CurrentTasks.getCurrentTasks());

		clearCategories();
		updateCategories(TaskStorage.getCategories());

		formCancel();
	}

	const formEditTask = (id, e) => {
		e.preventDefault();
		const inputTitle = e.target.querySelector(".form-title");
		const inputDate = e.target.querySelector(".form-date");
		const inputDescription = e.target.querySelector(".form-description");
		const inputCategory = e.target.querySelector(".form-category");

		TaskStorage.editTask(id, inputTitle.value, inputDate.value, inputDescription.value, inputCategory.value);

		clearContent();
		updateContent(CurrentTasks.getCurrentTasks());

		clearCategories();
		updateCategories(TaskStorage.getCategories());

		formCancel();
	}

	const addCategory = () => {
		const categoryButton = document.querySelector(".add-category-wrapper .fa-plus");
		const categoryInput = document.querySelector(".add-category-wrapper input");
		categoryButton.addEventListener("click", () => {
			categoryInput.classList.toggle("active");
			if (categoryInput.classList.contains("active")) {
				categoryInput.style["opacity"] = 1;
				categoryInput.style["pointer-events"] = "all";
				categoryInput.focus();
			}
			else {
				categoryInput.style["opacity"] = 0;
				categoryInput.style["pointer-events"] = "none";
				categoryInput.blur();
				if (categoryInput.value) {
					TaskStorage.addCategory(categoryInput.value);
					categoryInput.value = "";
					clearCategories();
					updateCategories(TaskStorage.getCategories());
				}
			}
		});
	}

	return { addTask, removeTask, expandTask, editTask, markDone, formCancel, addCategory }
})();

export { createEvents, createEventsForButtons }
