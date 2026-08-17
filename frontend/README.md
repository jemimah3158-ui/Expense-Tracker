# Expense Tracker

A full-stack expense management application built with React, Vite, Node.js, Express, and MongoDB.

## Features

* Add expenses
* Edit expenses
* Delete expenses
* Categorize expenses
* Search expenses
* Filter expenses by category
* Sort expenses by date and amount
* Track monthly income
* Track monthly budget
* View remaining balance
* View spending statistics
* View category-wise expense breakdown
* View spending chart
* Dark and light mode
* Export expenses as CSV
* Store expenses using MongoDB

## Technologies Used

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* Node.js
* Express.js
* CORS

### Database

* MongoDB

## Project Structure

```text
Expense Tracker/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   └── package.json
│
└── backend/
    ├── server.js
    ├── package.json
    └── .env
```

## How to Run

### 1. Start the Backend

Open a terminal and run:

```bash
cd "Expense Tracker/backend"
npm install
node server.js
```

The backend runs on:

```text
http://localhost:5000
```

### 2. Start the Frontend

Open another terminal and run:

```bash
cd "Expense Tracker/frontend"
npm install
npm run dev
```

Then open the Local URL shown by Vite in your browser.

## Database

The application uses MongoDB to store expense data.

Make sure your MongoDB connection string is configured in the backend `.env` file.

## Future Improvements

* User login and signup
* User authentication
* User-specific expense management
* Online deployment
* Additional reports and analytics

## Author

Expense Tracker Project
