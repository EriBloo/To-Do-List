import { format } from 'date-fns';
import { Emitter, TaskStorage, CurrentTasks } from './tasks';

function createTaskElement(task) {
  const taskDiv = document.createElement('div');
  taskDiv.classList.add('task');
  if (task.getFinished()) {
    taskDiv.classList.add('done');
  }
  if (task.getExpanded()) {
    taskDiv.classList.add('expanded');
  }
  taskDiv.setAttribute('data', task.getId());
  taskDiv.setAttribute('title', 'Expand');
  taskDiv.addEventListener('click', createEventsForButtons.expandTask);

  const markSpan = document.createElement('span');
  markSpan.classList.add('mark');
  markSpan.addEventListener('click', createEventsForButtons.markDone);
  markSpan.setAttribute('title', 'Mark as done');
  const markIcon = document.createElement('i');
  markIcon.classList.add('far');
  markIcon.classList.add(task.getFinished() ? 'fa-check-circle' : 'fa-circle');
  markSpan.appendChild(markIcon);
  taskDiv.appendChild(markSpan);

  const titleH3 = document.createElement('h3');
  titleH3.classList.add('title');
  titleH3.textContent = task.getTitle();
  taskDiv.appendChild(titleH3);

  const deleteSpan = document.createElement('span');
  deleteSpan.classList.add('delete');
  deleteSpan.addEventListener('click', createEventsForButtons.removeTask);
  deleteSpan.setAttribute('title', 'Remove task');
  const deleteIcon = document.createElement('i');
  deleteIcon.classList.add('fas');
  deleteIcon.classList.add('fa-plus');
  deleteSpan.appendChild(deleteIcon);
  taskDiv.appendChild(deleteSpan);

  const importantSpan = document.createElement('span');
  importantSpan.classList.add('important');
  importantSpan.addEventListener('click', createEventsForButtons.markImportant);
  importantSpan.setAttribute('title', 'Mark as priority');
  const importantIcon = document.createElement('i');
  importantIcon.classList.add(task.getImportant() ? 'fas' : 'far');
  importantIcon.classList.add('fa-star');
  importantSpan.appendChild(importantIcon);
  taskDiv.appendChild(importantSpan);

  const descH4 = document.createElement('h4');
  descH4.classList.add('description');
  descH4.textContent = task.getDescription();
  taskDiv.appendChild(descH4);

  const categoryDiv = document.createElement('div');
  categoryDiv.classList.add('in-category');
  if (task.getCategory()) {
    const categoryIcon = document.createElement('i');
    categoryIcon.classList.add('fas');
    categoryIcon.classList.add('fa-circle');
    categoryIcon.style.color = getColorfromValue(getCharSum(task.getCategory().toLowerCase()));
    categoryDiv.appendChild(categoryIcon);
    const categoryH3 = document.createElement('h3');
    categoryH3.textContent = task.getCategory();
    categoryDiv.appendChild(categoryH3);
  }
  taskDiv.appendChild(categoryDiv);

  const createH4 = document.createElement('h4');
  createH4.classList.add('created');
  createH4.textContent = `Created: ${format(task.getCreationDate(), 'd MMMM yyyy')}`;
  taskDiv.appendChild(createH4);

  const dueH4 = document.createElement('h4');
  dueH4.classList.add('due');
  dueH4.textContent = `Due: ${format(task.getDueDate(), 'd MMMM yyyy')}`;
  taskDiv.appendChild(dueH4);

  const editSpan = document.createElement('span');
  editSpan.classList.add('edit');
  editSpan.addEventListener('click', createEventsForButtons.editTask);
  editSpan.setAttribute('title', 'Edit task');
  const editIcon = document.createElement('i');
  editIcon.classList.add('fas');
  editIcon.classList.add('fa-pen');
  editSpan.appendChild(editIcon);
  taskDiv.appendChild(editSpan);

  return taskDiv;
}

function createPopUpElement() {
  const popUpContainerDiv = document.createElement('div');
  popUpContainerDiv.classList.add('pop-up-container');

  const popUpDiv = document.createElement('div');
  popUpDiv.classList.add('pop-up');
  popUpContainerDiv.appendChild(popUpDiv);

  return popUpContainerDiv;
}

function createTaskFormElement(title, submitTarget) {
  const taskForm = document.createElement('form');
  taskForm.classList.add('modify-task');
  taskForm.setAttribute('method', 'post');
  taskForm.addEventListener('submit', submitTarget);

  const titleH2 = document.createElement('h2');
  titleH2.textContent = title;
  taskForm.appendChild(titleH2);

  const titleInput = document.createElement('input');
  titleInput.classList.add('form-title');
  titleInput.setAttribute('type', 'text');
  titleInput.setAttribute('name', 'title');
  titleInput.setAttribute('placeholder', 'Title');
  titleInput.setAttribute('autocomplete', 'off');
  titleInput.setAttribute('required', 'true');
  taskForm.appendChild(titleInput);

  const descriptionInput = document.createElement('input');
  descriptionInput.classList.add('form-description');
  descriptionInput.setAttribute('type', 'text');
  descriptionInput.setAttribute('name', 'description');
  descriptionInput.setAttribute('placeholder', 'Description');
  descriptionInput.setAttribute('autocomplete', 'off');
  taskForm.appendChild(descriptionInput);

  const categoryInput = document.createElement('input');
  categoryInput.classList.add('form-category');
  categoryInput.setAttribute('type', 'text');
  categoryInput.setAttribute('name', 'category');
  categoryInput.setAttribute('placeholder', 'Category');
  categoryInput.setAttribute('autocomplete', 'off');
  taskForm.appendChild(categoryInput);

  const dateInput = document.createElement('input');
  dateInput.classList.add('form-date');
  dateInput.setAttribute('type', 'date');
  dateInput.setAttribute('name', 'date');
  dateInput.setAttribute('title', 'Due Date');
  dateInput.setAttribute('min', format(new Date(), 'yyyy-MM-dd'));
  dateInput.setAttribute('required', 'true');
  taskForm.appendChild(dateInput);

  const cancelButton = document.createElement('button');
  cancelButton.classList.add('form-cancel');
  cancelButton.setAttribute('type', 'button');
  cancelButton.textContent = 'Cancel';
  cancelButton.addEventListener('click', createEventsForButtons.formCancel);
  taskForm.appendChild(cancelButton);

  const submitButton = document.createElement('button');
  submitButton.classList.add('form-submit');
  submitButton.setAttribute('type', 'submit');
  submitButton.textContent = 'Submit';
  taskForm.appendChild(submitButton);

  return taskForm;
}

function clearContent() {
  const contentElement = document.querySelector('.content');
  while (contentElement.childElementCount > 1) {
    contentElement.removeChild(contentElement.firstChild);
  }
}

function updateContent(tasks) {
  const contentElement = document.querySelector('.content');
  const addTaskElement = document.querySelector('.add-task');

  tasks.forEach((task) => {
    const taskElement = createTaskElement(task);
    if (task.getImportant()) {
      contentElement.insertBefore(taskElement, contentElement.firstChild);
    } else {
      contentElement.insertBefore(taskElement, addTaskElement);
    }
  });
}

function createCategoryElement(category) {
  const categoryDiv = document.createElement('div');
  categoryDiv.classList.add('category-wrapper');
  createEvents.byCategory(categoryDiv, category);

  const categoryIcon = document.createElement('i');
  categoryIcon.classList.add('fas');
  categoryIcon.classList.add('fa-circle');
  categoryIcon.style.color = getColorfromValue(getCharSum(category));
  categoryDiv.appendChild(categoryIcon);

  const categoryH2 = document.createElement('h2');
  categoryH2.classList.add('other');
  categoryH2.textContent = category;
  categoryDiv.appendChild(categoryH2);

  const removeSpan = document.createElement('span');
  removeSpan.classList.add('remove-category');
  removeSpan.addEventListener('click', createEventsForButtons.removeCategory);
  removeSpan.setAttribute('title', 'Remove category');
  const removeIcon = document.createElement('i');
  removeIcon.classList.add('fas');
  removeIcon.classList.add('fa-minus');
  removeSpan.appendChild(removeIcon);
  categoryDiv.appendChild(removeSpan);

  return categoryDiv;
}

function clearCategories() {
  const projectElement = document.querySelector('.by-project');
  while (projectElement.childElementCount > 1) {
    projectElement.removeChild(projectElement.firstChild);
  }
}

function updateCategories(categories) {
  const projectElement = document.querySelector('.by-project');
  const addCategoryElement = document.querySelector('.add-category-wrapper');

  categories.forEach((category) => {
    projectElement.insertBefore(createCategoryElement(category), addCategoryElement);
  });
}

function removeCategoryFromTasks(category) {
  const tasks = TaskStorage.getTasksByCategory(category);

  tasks.forEach((task) => {
    task.setCategory('');
  });
}

function getCharSum(word) {
  let wordSum = 0;
  for (let i = 0; i < word.length; i += 1) {
    wordSum += word.charCodeAt(i);
  }
  return wordSum;
}

function getColorfromValue(value) {
  return `hsl(${value % 360}, ${(value % 70) + 25}%, ${(value % 10) + 75}%)`;
}

const currentMark = (() => {
  let current = document.querySelector('.today');

  const moveCurrent = (newElement) => {
    current.classList.remove('current');
    newElement.classList.add('current');
    current = newElement;
  };

  return { moveCurrent };
})();

const createEvents = (() => {
  function updateCurrentProjectTitle(title) {
    const currentProjectTitle = document.querySelector('.current-project');
    currentProjectTitle.textContent = title;
  }
  const byDate = (element, date) => {
    element.addEventListener('click', () => {
      updateCurrentProjectTitle(element.textContent);
      CurrentTasks.setCurrentTasks(TaskStorage.getTasksToDate(date));
      clearContent();
      updateContent(CurrentTasks.getCurrentTasks());
      currentMark.moveCurrent(element);
    });
  };

  const byCategory = (element, category) => {
    element.addEventListener('click', (e) => {
      updateCurrentProjectTitle(element.textContent);
      CurrentTasks.setCurrentTasks(TaskStorage.getTasksByCategory(category));
      clearContent();
      updateContent(CurrentTasks.getCurrentTasks());
      currentMark.moveCurrent(element);
    });
  };

  const allTasks = (element) => {
    element.addEventListener('click', () => {
      updateCurrentProjectTitle(element.textContent);
      CurrentTasks.setCurrentTasks(TaskStorage.getAllTasks());
      clearContent();
      updateContent(CurrentTasks.getCurrentTasks());
      currentMark.moveCurrent(element);
    });
  };

  return { byDate, byCategory, allTasks };
})();

const createEventsForButtons = (() => {
  const addTask = () => {
    const addTaskElement = document.querySelector('.add-task');
    addTaskElement.addEventListener('click', () => {
      const containerElement = document.querySelector('.container');
      const popUpElement = createPopUpElement();
      const taskFormElement = createTaskFormElement('Create new task', formAddTask);
      popUpElement.firstChild.appendChild(taskFormElement);
      containerElement.appendChild(popUpElement);
    });
  };

  const removeTask = (e) => {
    const id = e.target.parentNode.getAttribute('data');
    const taskToRemove = document.querySelector(`.task[data="${id}"]`);
    const contentElement = document.querySelector('.content');
    contentElement.removeChild(taskToRemove);
    TaskStorage.removeTask(id);
    clearContent();
    updateContent(CurrentTasks.getCurrentTasks());
  };

  const expandTask = (e) => {
    if (e.target === e.currentTarget) {
      const id = e.target.getAttribute('data');
      e.target.classList.toggle('expanded');
      TaskStorage.getTaskById(id).toggleExpanded();
      Emitter.emit('changeTasks');
    }
  };

  const editTask = (e) => {
    const id = e.target.parentNode.getAttribute('data');
    const task = TaskStorage.getTaskById(id);
    const containerElement = document.querySelector('.container');
    const popUpElement = createPopUpElement();
    const taskFormElement = createTaskFormElement('Edit task', formEditTask.bind(null, id));

    taskFormElement.querySelector('.form-title').value = task.getTitle();
    taskFormElement.querySelector('.form-description').value = task.getDescription();
    taskFormElement.querySelector('.form-category').value = task.getCategory();
    taskFormElement.querySelector('.form-date').value = format(task.getDueDate(), 'yyyy-MM-dd');

    popUpElement.firstChild.appendChild(taskFormElement);
    containerElement.appendChild(popUpElement);
  };

  const markDone = (e) => {
    const id = e.target.parentNode.getAttribute('data');
    const task = TaskStorage.getTaskById(id);
    TaskStorage.getTaskById(id).toggleFinished();
    Emitter.emit('changeTasks');

    if (task.getFinished()) {
      e.target.firstChild.classList.remove('fa-circle');
      e.target.firstChild.classList.add('fa-check-circle');
    } else {
      e.target.firstChild.classList.remove('fa-check-circle');
      e.target.firstChild.classList.add('fa-circle');
    }
    e.target.parentNode.classList.toggle('done');
  };

  const markImportant = (e) => {
    const id = e.target.parentNode.getAttribute('data');
    const task = TaskStorage.getTaskById(id);
    task.toggleImportant();
    Emitter.emit('changeTasks');

    if (task.getImportant()) {
      e.target.firstChild.classList.remove('far');
      e.target.firstChild.classList.add('fas');
    } else {
      e.target.firstChild.classList.remove('fas');
      e.target.firstChild.classList.add('far');
    }

    clearContent();
    updateContent(CurrentTasks.getCurrentTasks());
  };

  const formCancel = () => {
    const containerElement = document.querySelector('.container');
    const popUpElement = document.querySelector('.pop-up-container');
    containerElement.removeChild(popUpElement);
  };

  const formAddTask = (e) => {
    e.preventDefault();
    const inputTitle = e.target.querySelector('.form-title');
    const inputDate = e.target.querySelector('.form-date');
    const inputDescription = e.target.querySelector('.form-description');
    const inputCategory = e.target.querySelector('.form-category');

    TaskStorage.addNewTask(
      inputTitle.value,
      inputDate.value,
      inputDescription.value,
      inputCategory.value,
    );

    clearContent();
    updateContent(CurrentTasks.getCurrentTasks());

    clearCategories();
    updateCategories(TaskStorage.getCategories());

    formCancel();
  };

  const formEditTask = (id, e) => {
    e.preventDefault();
    const inputTitle = e.target.querySelector('.form-title');
    const inputDate = e.target.querySelector('.form-date');
    const inputDescription = e.target.querySelector('.form-description');
    const inputCategory = e.target.querySelector('.form-category');

    TaskStorage.editTask(
      id,
      inputTitle.value,
      inputDate.value,
      inputDescription.value,
      inputCategory.value,
    );

    clearContent();
    updateContent(CurrentTasks.getCurrentTasks());

    clearCategories();
    updateCategories(TaskStorage.getCategories());

    formCancel();
  };

  const addCategory = (e) => {
    const categoryInput = document.querySelector('.add-category-wrapper input');
    if (
      (e.keyCode === 13 && document.activeElement !== categoryInput)
      || (e.keyCode !== 13 && e.type !== 'click')
    ) {
      return;
    }
    categoryInput.classList.toggle('active');
    if (categoryInput.classList.contains('active')) {
      categoryInput.focus();
    } else {
      categoryInput.blur();

      if (categoryInput.value) {
        TaskStorage.addCategory(categoryInput.value);
        categoryInput.value = '';
        clearCategories();
        updateCategories(TaskStorage.getCategories());
      }
    }
  };

  const removeCategory = (e) => {
    e.stopPropagation();
    const category = e.target.parentNode.querySelector('.other').textContent;
    const current = document.querySelector('.current-project').textContent;
    const today = document.querySelector('.today');

    TaskStorage.removeCategory(category);
    removeCategoryFromTasks(category);

    if (current === category) {
      today.click();
    } else {
      clearContent();
      updateContent(CurrentTasks.getCurrentTasks());
    }

    clearCategories();
    updateCategories(TaskStorage.getCategories());
  };

  return {
    addTask,
    removeTask,
    expandTask,
    editTask,
    markDone,
    markImportant,
    formCancel,
    addCategory,
    removeCategory,
  };
})();

export {
  clearContent,
  updateContent,
  clearCategories,
  updateCategories,
  createEvents,
  createEventsForButtons,
};
