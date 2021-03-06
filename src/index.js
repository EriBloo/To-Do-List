import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import {
  format, endOfToday, endOfWeek, endOfMonth,
} from 'date-fns';
import {
  clearContent,
  updateContent,
  clearCategories,
  updateCategories,
  createEvents,
  createEventsForButtons,
} from './dom';
import { Emitter, CurrentTasks, TaskStorage } from './tasks';
import { firebaseConfig } from './firebase-config/config';

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

function updatePage() {
  CurrentTasks.setCurrentTasks(TaskStorage.getTasksToDate(endOfToday()));
  clearContent();
  updateContent(CurrentTasks.getCurrentTasks());

  clearCategories();
  updateCategories(TaskStorage.getCategories());
}

function signOut() {
  auth.signOut();
  updatePage();
}

function createWelcomeText(name) {
  const welcomeDiv = document.createElement('div');
  welcomeDiv.classList.add('welcome');

  const welcomeH2 = document.createElement('h2');
  welcomeH2.classList.add('welcome-text');
  welcomeH2.textContent = `Welcome, ${name}!`;
  welcomeDiv.appendChild(welcomeH2);

  const logOutButton = document.createElement('button');
  logOutButton.setAttribute('type', 'button');
  logOutButton.textContent = 'Log out';
  logOutButton.addEventListener('click', signOut);
  welcomeDiv.appendChild(logOutButton);

  return welcomeDiv;
}

function logIn(e) {
  e.preventDefault();

  const email = e.target.querySelector('.email');
  const password = e.target.querySelector('.password');

  email.classList.remove('error');
  email.setAttribute('title', '');
  password.setAttribute('title', '');
  password.classList.remove('error');

  auth.signInWithEmailAndPassword(email.value, password.value).catch((error) => {
    const errorCode = error.code;
    if (errorCode === 'auth/invalid-email') {
      email.classList.add('error');
      email.setAttribute('title', 'Invalid e-mail');
    } else if (errorCode === 'auth/wrong-password') {
      password.classList.add('error');
      password.setAttribute('title', 'Invalid password');
    } else if (errorCode === 'auth/user-not-found') {
      email.classList.add('error');
      password.classList.add('error');
      email.setAttribute('title', 'User not found');
    }
  });
}

function clearContainer() {
  const logInContainer = document.querySelector('.log-in-container');
  while (logInContainer.firstChild) {
    logInContainer.removeChild(logInContainer.lastChild);
  }
}

function signIn(e) {
  e.preventDefault();

  const name = e.target.querySelector('.name');
  const email = e.target.querySelector('.email');
  const password = e.target.querySelector('.password');

  email.classList.remove('error');
  email.setAttribute('title', '');
  password.setAttribute('title', '');
  password.classList.remove('error');

  auth
    .createUserWithEmailAndPassword(email.value, password.value)
    .catch((error) => {
      const errorCode = error.code;
      if (errorCode === 'auth/invalid-email') {
        email.classList.add('error');
        email.setAttribute('title', 'Invalid e-mail');
      } else if (errorCode === 'auth/email-already-in-use') {
        email.classList.add('error');
        email.setAttribute('title', 'E-mail already in use');
      } else if (errorCode === 'auth/weak-password') {
        password.classList.add('error');
        password.setAttribute('title', 'Password too weak');
      }
    })
    .then(() => {
      const user = auth.currentUser;
      const logInContainer = document.querySelector('.log-in-container');
      if (user) {
        user
          .updateProfile({
            displayName: name.value,
          })
          .then(() => {
            clearContainer();
            logInContainer.appendChild(createWelcomeText(user.displayName));
          });
      }
      e.target.parentNode.classList.remove('visible');
    });
}

function createSignIn() {
  const signInContainer = document.querySelector('.sign-in-container');
  signInContainer.classList.toggle('visible');
}

function createLogInFormElement() {
  const logForm = document.createElement('form');
  logForm.classList.add('log-in');
  logForm.setAttribute('method', 'POST');
  logForm.addEventListener('submit', logIn);

  const mailInput = document.createElement('input');
  mailInput.classList.add('email');
  mailInput.setAttribute('type', 'email');
  mailInput.setAttribute('name', 'email');
  mailInput.setAttribute('placeholder', 'E-mail');
  logForm.appendChild(mailInput);

  const passInput = document.createElement('input');
  passInput.classList.add('password');
  passInput.setAttribute('type', 'password');
  passInput.setAttribute('name', 'password');
  passInput.setAttribute('placeholder', 'Password');
  logForm.appendChild(passInput);

  const logInButton = document.createElement('button');
  logInButton.classList.add('log-in-btn');
  logInButton.setAttribute('type', 'submit');
  logInButton.innerHTML = 'Log In';
  logForm.appendChild(logInButton);

  const signInButton = document.createElement('button');
  signInButton.setAttribute('type', 'button');
  signInButton.innerHTML = 'Sign up';
  signInButton.addEventListener('click', createSignIn);
  logForm.appendChild(signInButton);

  return logForm;
}

(function addSignInEvent() {
  const SignInForm = document.querySelector('.sign-in');
  SignInForm.addEventListener('submit', signIn);
}());

function taskToJSON(task) {
  const taskToReturn = {
    title: task.getTitle(),
    description: task.getDescription(),
    category: task.getCategory(),
    dueDate: format(task.getDueDate(), 'yyyy-MM-dd'),
    creationDate: format(task.getCreationDate(), 'yyyy-MM-dd'),
    finished: task.getFinished(),
    important: task.getImportant(),
    expanded: task.getExpanded(),
  };
  return taskToReturn;
}

function JSONToTask(json) {
  const taskArray = [
    json.title,
    json.dueDate,
    json.description,
    json.category,
    json.creationDate,
    json.finished,
    json.important,
    json.expanded,
  ];

  return taskArray;
}

function useLocalStorage() {
  let initialized = true;

  function storeTasks() {
    const tasksToStore = [];
    TaskStorage.getAllTasks().forEach((task) => {
      tasksToStore.push(JSON.stringify(taskToJSON(task)));
    });
    localStorage.setItem('taskStorage', JSON.stringify(tasksToStore));
  }

  function loadTasks() {
    JSON.parse(localStorage.getItem('taskStorage')).forEach((task) => {
      TaskStorage.addNewTask(...JSONToTask(JSON.parse(task)));
    });
    localStorage.removeItem('localStorage');
  }

  function clear() {
    localStorage.removeItem('taskStorage');
    Emitter.remove('changeTasks', storeTasks);
    initialized = false;
  }

  if (localStorage.getItem('taskStorage')) {
    loadTasks();
  }
  updatePage();

  Emitter.on('changeTasks', storeTasks);

  useLocalStorage.clear = clear;
  useLocalStorage.initialized = initialized;
}

function useDatabase() {
  const userId = auth.currentUser.uid;
  let initialized = true;

  function storeTasks() {
    const taskArray = [];
    const databaseTasksRef = database.ref(`users/${userId}/tasks`);
    TaskStorage.getAllTasks().forEach((task) => {
      taskArray.push(taskToJSON(task));
    });
    databaseTasksRef.set(taskArray);
  }

  function loadTasks() {
    const userTasks = database.ref(`users/${userId}/tasks`);

    userTasks.once('value').then((snapshot) => {
      Emitter.emit('changeTasks');
      snapshot.forEach((task) => {
        TaskStorage.addNewTask(...JSONToTask(task.val()));
      });
      updatePage();
    });
  }

  function clear() {
    Emitter.remove('changeTasks', storeTasks);
    TaskStorage.removeAllTasks();
    TaskStorage.removeAllCategories();
    initialized = false;
  }

  loadTasks();

  Emitter.on('changeTasks', storeTasks);

  useDatabase.clear = clear;
  useDatabase.initialized = initialized;
}

function chooseAction() {
  const user = auth.currentUser;
  const logInContainer = document.querySelector('.log-in-container');

  if (user) {
    if (useLocalStorage.initialized) {
      useLocalStorage.clear();
    }
    clearContainer();
    logInContainer.appendChild(createWelcomeText(user.displayName));
    useDatabase();
  } else {
    if (useDatabase.initialized) {
      useDatabase.clear();
    }
    clearContainer();
    logInContainer.appendChild(createLogInFormElement());
    useLocalStorage();
  }
}

auth.onAuthStateChanged(chooseAction);

createEvents.byDate(document.querySelector('.today'), endOfToday());
createEvents.byDate(document.querySelector('.week'), endOfWeek(endOfToday()));
createEvents.byDate(document.querySelector('.month'), endOfMonth(endOfToday()));
createEvents.allTasks(document.querySelector('.all'));

createEventsForButtons.addTask();
document
  .querySelector('.add-category-wrapper .fa-plus')
  .addEventListener('click', createEventsForButtons.addCategory);
document.addEventListener('keydown', createEventsForButtons.addCategory);
