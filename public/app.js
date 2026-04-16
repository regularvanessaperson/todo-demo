import { registerUser, loginUser, logoutUser } from './auth.js';
import { fetchTodos, createTodo, updateTodo, deleteTodo as removeTodo } from './todos.js';
import { getTokenPayload } from './api.js';

let token = localStorage.getItem('token');

const authSection = document.getElementById('auth');
const appSection = document.getElementById('app');
const currentUserElement = document.getElementById('currentUser');
const todoList = document.getElementById('todoList');

function setCurrentUser() {
  const payload = getTokenPayload(token);
  currentUserElement.textContent = payload?.username || '';
}

function showAuth() {
  authSection.style.display = 'block';
  appSection.style.display = 'none';
}

function showApp() {
  authSection.style.display = 'none';
  appSection.style.display = 'block';
}

async function refreshTodos() {
  const todos = await fetchTodos(token);
  renderTodos(todos);
}

function renderTodos(todos) {
  todoList.innerHTML = '';
  todos.forEach(todo => {
    const li = document.createElement('li');
    li.className = todo.completed ? 'completed' : '';
    li.innerHTML = `
      <span>${todo.title}</span>
      <button onclick="toggleTodo(${todo.id}, ${!todo.completed})">${todo.completed ? 'Undo' : 'Complete'}</button>
      <button onclick="deleteTodo(${todo.id})">Delete</button>
    `;
    todoList.appendChild(li);
  });
}

async function register() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    await registerUser(username, password);
    alert('Registration successful. You can now log in.');
  } catch (err) {
    alert(err.message);
  }
}

async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const data = await loginUser(username, password);
    token = data.token;
    localStorage.setItem('token', token);
    setCurrentUser();
    showApp();
    await refreshTodos();
  } catch (err) {
    alert(err.message);
  }
}

async function addTodo() {
  const title = document.getElementById('todoTitle').value;
  if (!title) return;

  try {
    await createTodo(token, title);
    document.getElementById('todoTitle').value = '';
    await refreshTodos();
  } catch (err) {
    alert(err.message);
  }
}

async function toggleTodo(id, completed) {
  try {
    await updateTodo(token, id, { completed });
    await refreshTodos();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteTodo(id) {
  try {
    await removeTodo(token, id);
    await refreshTodos();
  } catch (err) {
    alert(err.message);
  }
}

async function logout() {
  try {
    await logoutUser(token);
  } catch (err) {
    console.warn('Logout failed:', err.message);
  }
  localStorage.removeItem('token');
  token = null;
  showAuth();
}

window.login = login;
window.register = register;
window.logout = logout;
window.addTodo = addTodo;
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;

if (token) {
  setCurrentUser();
  showApp();
  refreshTodos();
} else {
  showAuth();
}
