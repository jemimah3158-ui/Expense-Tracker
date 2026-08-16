import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const defaultExpenses = [
    {
      id: 1,
      name: "Food",
      amount: 500,
      icon: "🍜",
      category: "Food",
      date: "2026-08-15",
    },
    {
      id: 2,
      name: "Travel",
      amount: 300,
      icon: "✈️",
      category: "Travel",
      date: "2026-08-14",
    },
    {
      id: 3,
      name: "Shopping",
      amount: 700,
      icon: "🛍️",
      category: "Shopping",
      date: "2026-08-13",
    },
    {
      id: 4,
      name: "Bills",
      amount: 400,
      icon: "🧾",
      category: "Bills",
      date: "2026-08-12",
    },
  ];

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem("expenseTrackerExpenses");
    return saved ? JSON.parse(saved) : defaultExpenses;
  });

  const [income, setIncome] = useState(() => {
    return Number(localStorage.getItem("expenseTrackerIncome")) || 15000;
  });

  const [budget, setBudget] = useState(() => {
    return Number(localStorage.getItem("expenseTrackerBudget")) || 5000;
  });

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState("2026-08-15");

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortBy, setSortBy] = useState("latest");

  const [incomeInput, setIncomeInput] = useState("");
  const [budgetInput, setBudgetInput] = useState("");

  const [editingId, setEditingId] = useState(null);

  const categories = {
    Food: "🍜",
    Travel: "✈️",
    Shopping: "🛍️",
    Bills: "🧾",
    Other: "✨",
  };

  /* Save expenses */
  useEffect(() => {
    localStorage.setItem(
      "expenseTrackerExpenses",
      JSON.stringify(expenses)
    );
  }, [expenses]);

  /* Save income */
  useEffect(() => {
    localStorage.setItem(
      "expenseTrackerIncome",
      income.toString()
    );
  }, [income]);

  /* Save budget */
  useEffect(() => {
    localStorage.setItem(
      "expenseTrackerBudget",
      budget.toString()
    );
  }, [budget]);

  /* Total expense */
  const totalExpense = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  /* Balance */
  const balance = income - totalExpense;

  /* Budget */
  const budgetRemaining = budget - totalExpense;

  const budgetPercentage =
    budget > 0
      ? Math.min((totalExpense / budget) * 100, 100)
      : 0;

  /* Category totals */
  const categoryTotals = expenses.reduce((acc, expense) => {
    const key = expense.category || expense.name;

    acc[key] = (acc[key] || 0) + Number(expense.amount);

    return acc;
  }, {});

  /* Highest expense */
  const highestExpense =
    expenses.length > 0
      ? Math.max(...expenses.map((expense) => Number(expense.amount)))
      : 0;

  /* Average expense */
  const averageExpense =
    expenses.length > 0
      ? totalExpense / expenses.length
      : 0;

  /* Search + filter + sort */
  const filteredExpenses = expenses
    .filter((expense) =>
      expense.name
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .filter(
      (expense) =>
        filterCategory === "All" ||
        expense.category === filterCategory
    )
    .sort((a, b) => {
      if (sortBy === "latest") {
        return new Date(b.date) - new Date(a.date);
      }

      if (sortBy === "oldest") {
        return new Date(a.date) - new Date(b.date);
      }

      if (sortBy === "highest") {
        return Number(b.amount) - Number(a.amount);
      }

      if (sortBy === "lowest") {
        return Number(a.amount) - Number(b.amount);
      }

      return 0;
    });

  /* Add / Edit Expense */
  const addExpense = async (e) => {
    e.preventDefault();

    if (!name || !amount || !date) {
      alert("Please fill all expense details");
      return;
    }

    if (editingId) {
      setExpenses(
        expenses.map((expense) =>
          expense.id === editingId
            ? {
                ...expense,
                name,
                amount: Number(amount),
                category,
                date,
                icon: categories[category],
              }
            : expense
        )
      );

      setEditingId(null);
    } else {
      const newExpense = {
        id: Date.now(),
        name,
        amount: Number(amount),
        category,
        date,
        icon: categories[category],
      };

      setExpenses([...expenses, newExpense]);
    }

    setName("");
    setAmount("");
    setCategory("Food");
    setDate("2026-08-15");
  };

  /* Delete */
  const deleteExpense = (id) => {
    setExpenses(
      expenses.filter((expense) => expense.id !== id)
    );
  };

  /* Edit */
  const editExpense = (expense) => {
    setEditingId(expense.id);
    setName(expense.name);
    setAmount(expense.amount);
    setCategory(expense.category || "Other");
    setDate(expense.date || "2026-08-15");
  };

  /* Income */
  const saveIncome = (e) => {
    e.preventDefault();

    if (!incomeInput || Number(incomeInput) <= 0) {
      alert("Enter a valid income");
      return;
    }

    setIncome(Number(incomeInput));
    setIncomeInput("");
  };

  /* Budget */
  const saveBudget = (e) => {
    e.preventDefault();

    if (!budgetInput || Number(budgetInput) <= 0) {
      alert("Enter a valid budget");
      return;
    }

    setBudget(Number(budgetInput));
    setBudgetInput("");
  };

  /* CSV Export */
  const exportCSV = () => {
    const headers = [
      "Name",
      "Category",
      "Amount",
      "Date",
    ];

    const rows = expenses.map((expense) => [
      expense.name,
      expense.category,
      expense.amount,
      expense.date,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "expense-tracker.csv";

    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <div className="container">

        {/* HEADER */}

        <header className="header">
          <div>
            <p className="small-title">MY FINANCES</p>

            <h1>Expense Tracker</h1>

            <p className="subtitle">
              A simple way to stay on top of your spending.
            </p>
          </div>

          <button
            className="theme-button"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </header>

        {/* SUMMARY CARDS */}

        <section className="cards">

          <div className="card income-card">
            <div className="card-top">
              <span>Total Income</span>
              <div className="card-icon">↗</div>
            </div>

            <h2>₹{income.toLocaleString()}</h2>

            <p>Monthly income</p>
          </div>

          <div className="card expense-card">
            <div className="card-top">
              <span>Total Expenses</span>
              <div className="card-icon">↘</div>
            </div>

            <h2>₹{totalExpense.toLocaleString()}</h2>

            <p>This month's spending</p>
          </div>

          <div className="card balance-card">
            <div className="card-top">
              <span>Balance</span>
              <div className="card-icon">◈</div>
            </div>

            <h2>₹{balance.toLocaleString()}</h2>

            <p>Available balance</p>
          </div>

        </section>

        {/* MAIN CONTENT */}

        <section className="main-content">

          {/* ADD / EDIT EXPENSE */}

          <div className="box add-box">

            <div className="section-heading">
              <div>
                <span>
                  {editingId
                    ? "EDIT TRANSACTION"
                    : "NEW TRANSACTION"}
                </span>

                <h2>
                  {editingId
                    ? "Edit Expense"
                    : "Add Expense"}
                </h2>
              </div>
            </div>

            <form onSubmit={addExpense}>

              <label>Expense name</label>

              <input
                type="text"
                placeholder="e.g. Lunch"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />

              <label>Category</label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
              >
                <option>Food</option>
                <option>Travel</option>
                <option>Shopping</option>
                <option>Bills</option>
                <option>Other</option>
              </select>

              <label>Date</label>

              <input
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(e.target.value)
                }
              />

              <label>Amount</label>

              <input
                type="number"
                placeholder="₹ 0"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
              />

              <button
                className="add-button"
                type="submit"
              >
                {editingId
                  ? "✓ Update Expense"
                  : "+ Add Expense"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setEditingId(null);
                    setName("");
                    setAmount("");
                    setCategory("Food");
                    setDate("2026-08-15");
                  }}
                >
                  Cancel Edit
                </button>
              )}

            </form>
          </div>

          {/* RECENT EXPENSES */}

          <div className="box expenses-box">

            <div className="section-heading">

              <div>
                <span>TRANSACTIONS</span>

                <h2>Recent Expenses</h2>
              </div>

              <div className="expense-count">
                {filteredExpenses.length}
              </div>

            </div>

            {/* SEARCH */}

            <input
              className="search-input"
              type="text"
              placeholder="🔎 Search expenses..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {/* FILTER + SORT */}

            <div className="filter-row">

              <select
                value={filterCategory}
                onChange={(e) =>
                  setFilterCategory(e.target.value)
                }
              >
                <option>All</option>
                <option>Food</option>
                <option>Travel</option>
                <option>Shopping</option>
                <option>Bills</option>
                <option>Other</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
              >
                <option value="latest">
                  Latest
                </option>

                <option value="oldest">
                  Oldest
                </option>

                <option value="highest">
                  Highest Amount
                </option>

                <option value="lowest">
                  Lowest Amount
                </option>
              </select>

            </div>

            {/* EXPENSE LIST */}

            <div className="expense-list">

              {filteredExpenses.length === 0 ? (
                <p className="no-expenses">
                  No expenses found.
                </p>
              ) : (
                filteredExpenses.map((expense) => (

                  <div
                    className="expense-item"
                    key={expense.id}
                  >

                    <div className="expense-left">

                      <div className="expense-icon">
                        {expense.icon}
                      </div>

                      <div>
                        <strong>
                          {expense.name}
                        </strong>

                        <p>
                          {expense.category || "Expense"}
                          {" • "}
                          {expense.date || "No date"}
                        </p>
                      </div>

                    </div>

                    <div className="expense-right">

                      <strong>
                        ₹
                        {Number(
                          expense.amount
                        ).toLocaleString()}
                      </strong>

                      <button
                        className="edit-button"
                        onClick={() =>
                          editExpense(expense)
                        }
                      >
                        ✎
                      </button>

                      <button
                        className="delete-button"
                        onClick={() =>
                          deleteExpense(expense.id)
                        }
                      >
                        ×
                      </button>

                    </div>

                  </div>

                ))
              )}

            </div>
          </div>

        </section>

        {/* CATEGORY BREAKDOWN */}

        <section className="box category-box">

          <div className="section-heading">

            <div>
              <span>EXPENSE BREAKDOWN</span>

              <h2>Where Your Money Goes</h2>
            </div>

          </div>

          <div className="category-list">

            {Object.entries(categoryTotals).map(
              ([categoryName, total]) => (

                <div
                  className="category-row"
                  key={categoryName}
                >

                  <div>

                    <strong>
                      {categories[categoryName] ||
                        "✨"}{" "}
                      {categoryName}
                    </strong>

                    <div className="category-line">

                      <div
                        className="category-progress"
                        style={{
                          width: `${Math.min(
                            (total / totalExpense) * 100,
                            100
                          )}%`,
                        }}
                      ></div>

                    </div>

                  </div>

                  <span>
                    ₹{total.toLocaleString()}
                  </span>

                </div>

              )
            )}

          </div>

        </section>

        {/* MONTHLY BUDGET */}

        <section className="box budget-box">

          <div className="monthly-header">

            <div>
              <span>MONTHLY BUDGET</span>

              <h2>Budget Goal</h2>
            </div>

            <strong>
              ₹{budget.toLocaleString()}
            </strong>

          </div>

          <form
            className="budget-form"
            onSubmit={saveBudget}
          >

            <input
              type="number"
              placeholder="Set monthly budget"
              value={budgetInput}
              onChange={(e) =>
                setBudgetInput(e.target.value)
              }
            />

            <button type="submit">
              Set Budget
            </button>

          </form>

          <div className="budget-info">

            <span>
              Spent: ₹
              {totalExpense.toLocaleString()}
            </span>

            <span>
              {budgetRemaining >= 0
                ? `Remaining: ₹${budgetRemaining.toLocaleString()}`
                : `Over budget: ₹${Math.abs(
                    budgetRemaining
                  ).toLocaleString()}`}
            </span>

          </div>

          <div className="progress">

            <div
              className={
                budgetRemaining < 0
                  ? "progress-value danger"
                  : "progress-value"
              }
              style={{
                width: `${budgetPercentage}%`,
              }}
            ></div>

          </div>

          {/* BUDGET WARNING */}

          {budgetRemaining < 0 && (
            <div className="budget-warning">
              ⚠️ You have exceeded your monthly budget.
            </div>
          )}

          {budgetRemaining >= 0 &&
            budget > 0 &&
            budgetPercentage >= 80 && (
              <div className="budget-warning">
                🔔 You are close to your budget limit.
              </div>
            )}

        </section>

        {/* MONTHLY SUMMARY — KEPT SAME */}

        <section className="box monthly-box">

          <div className="monthly-header">
            <div>
              <span>MONTHLY SUMMARY</span>
              <h2>Spending Overview</h2>
            </div>

            <strong>
              {Math.round(
                (totalExpense / income) * 100
              )}
              %
            </strong>
          </div>

          <div className="progress">
            <div
              className="progress-value"
              style={{
                width: `${Math.min(
                  (totalExpense / income) * 100,
                  100
                )}%`,
              }}
            ></div>
          </div>

          <p>
            You've spent ₹
            {totalExpense.toLocaleString()} of your ₹
            {income.toLocaleString()} income this month.
          </p>

        </section>

        {/* INCOME MANAGEMENT */}

        <section className="box extra-box">

          <div className="section-heading">
            <div>
              <span>INCOME</span>
              <h2>Update Monthly Income</h2>
            </div>
          </div>

          <form
            className="budget-form"
            onSubmit={saveIncome}
          >

            <input
              type="number"
              placeholder="Enter income"
              value={incomeInput}
              onChange={(e) =>
                setIncomeInput(e.target.value)
              }
            />

            <button type="submit">
              Update Income
            </button>

          </form>

        </section>

        {/* STATISTICS */}

        <section className="box statistics-box">

          <div className="section-heading">

            <div>
              <span>INSIGHTS</span>
              <h2>Expense Statistics</h2>
            </div>

          </div>

          <div className="stats-grid">

            <div className="stat-item">
              <span>Total Transactions</span>
              <strong>
                {expenses.length}
              </strong>
            </div>

            <div className="stat-item">
              <span>Highest Expense</span>
              <strong>
                ₹{highestExpense.toLocaleString()}
              </strong>
            </div>

            <div className="stat-item">
              <span>Average Expense</span>
              <strong>
                ₹{Math.round(
                  averageExpense
                ).toLocaleString()}
              </strong>
            </div>

            <div className="stat-item">
              <span>Remaining Balance</span>
              <strong>
                ₹{balance.toLocaleString()}
              </strong>
            </div>

          </div>

        </section>

        {/* MONTHLY CHART */}

        <section className="box chart-box">

          <div className="section-heading">

            <div>
              <span>MONTHLY ANALYSIS</span>
              <h2>Spending Chart</h2>
            </div>

          </div>

          <div className="chart">

            {Object.entries(categoryTotals).map(
              ([categoryName, total]) => {

                const maxAmount = Math.max(
                  ...Object.values(categoryTotals),
                  1
                );

                const height =
                  (total / maxAmount) * 100;

                return (
                  <div
                    className="chart-column"
                    key={categoryName}
                  >

                    <div className="chart-value">
                      ₹{total}
                    </div>

                    <div className="chart-bar-area">

                      <div
                        className="chart-bar"
                        style={{
                          height: `${height}%`,
                        }}
                      ></div>

                    </div>

                    <span>
                      {categories[categoryName] ||
                        "✨"}
                    </span>

                    <small>
                      {categoryName}
                    </small>

                  </div>
                );
              }
            )}

          </div>

        </section>

        {/* EXPORT */}

        <section className="box export-box">

          <div>
            <span>YOUR DATA</span>

            <h2>Export Expenses</h2>

            <p>
              Download your expense history as CSV.
            </p>
          </div>

          <button
            className="export-button"
            onClick={exportCSV}
          >
            📥 Export CSV
          </button>

        </section>

        <footer>
          Expense Tracker • Manage your money with confidence.
        </footer>

      </div>
    </div>
  );
}

export default App;