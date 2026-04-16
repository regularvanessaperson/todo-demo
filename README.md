# Todo App

A simple Node.js application for user accounts and todo list management.

## Features

- User registration and login
- JWT-based authentication
- Create, read, update, and delete todos
- SQLite database for persistence

## Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Run the server:
   ```
   npm start
   ```

3. Open your browser to `http://localhost:3000`

## API Endpoints

- `POST /register` - Register a new user
- `POST /login` - Login and get JWT token
- `POST /logout` - Log out (requires auth)
- `GET /todos` - Get user's todos (requires auth)
- `GET /todos/:id` - Get a specific todo item (requires auth)
- `POST /todos` - Create a new todo (requires auth)
- `PUT /todos/:id` - Update a todo (title and/or completed) (requires auth)
- `DELETE /todos/:id` - Delete a todo (requires auth)

