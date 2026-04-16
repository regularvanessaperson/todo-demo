import { request } from './api.js';

export function fetchTodos(token) {
  return request('/todos', { token });
}

export function fetchTodo(token, id) {
  return request(`/todos/${id}`, { token });
}

export function createTodo(token, title) {
  return request('/todos', {
    method: 'POST',
    token,
    body: { title },
  });
}

export function updateTodo(token, id, data) {
  return request(`/todos/${id}`, {
    method: 'PUT',
    token,
    body: data,
  });
}

export function deleteTodo(token, id) {
  return request(`/todos/${id}`, {
    method: 'DELETE',
    token,
  });
}
