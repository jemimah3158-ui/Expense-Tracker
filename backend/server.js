const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let expenses = [];

app.get("/", (req, res) => {
  res.send("Expense Tracker Backend is running!");
});

app.get("/expenses", (req, res) => {
  res.json(expenses);
});

app.post("/expenses", (req, res) => {
  const { name, amount, category, date, icon } = req.body;

  const newExpense = {
    id: Date.now(),
    name,
    amount: Number(amount),
    category,
    date,
    icon,
  };

  expenses.push(newExpense);

  res.status(201).json(newExpense);
});

app.delete("/expenses/:id", (req, res) => {
  const id = Number(req.params.id);

  expenses = expenses.filter((expense) => expense.id !== id);

  res.json({ message: "Expense deleted successfully" });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});