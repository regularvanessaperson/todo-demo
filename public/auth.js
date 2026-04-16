import { request } from './api.js';

export function registerUser(username, password) {
  return request('/register', {
    method: 'POST',
    body: { username, password },
  });
}

export function loginUser(username, password) {
  return request('/login', {
    method: 'POST',
    body: { username, password },
  });
}

export function logoutUser(token) {
  return request('/logout', {
    method: 'POST',
    token,
  });
}
