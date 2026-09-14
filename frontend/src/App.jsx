import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [showAuth, setShowAuth] = useState(true);
  const [authMode, setAuthMode] = useState("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
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

  // Load expenses from MongoDB
  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const response = await fetch("https://expense-tracker-sw5p.onrender.com/expenses");

        if (!response.ok) {
          throw new Error("Failed to load expenses");
        }

        const data = await response.json();

        if (data.length > 0) {
          setExpenses(data);
        }
      } catch (error) {
        console.error("Error loading expenses:", error);
      }
    };

    loadExpenses();
  }, []);

  // Save expenses locally as backup
  useEffect(() => {
    localStorage.setItem(
      "expenseTrackerExpenses",
      JSON.stringify(expenses)
    );
  }, [expenses]);

  // Save income
  useEffect(() => {
    localStorage.setItem(
      "expenseTrackerIncome",
      income.toString()
    );
  }, [income]);

  // Save budget
  useEffect(() => {
    localStorage.setItem(
      "expenseTrackerBudget",
      budget.toString()
    );
  }, [budget]);

  // Total expense
  const totalExpense = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  // Balance
  const balance = income - totalExpense;

  // Budget
  const budgetRemaining = budget - totalExpense;

  const budgetPercentage =
    budget > 0
      ? Math.min((totalExpense / budget) * 100, 100)
      : 0;

  // Category totals
  const categoryTotals = expenses.reduce((acc, expense) => {
    const key = expense.category || expense.name;

    acc[key] = (acc[key] || 0) + Number(expense.amount);

    return acc;
  }, {});

  // Highest expense
  const highestExpense =
    expenses.length > 0
      ? Math.max(
          ...expenses.map((expense) => Number(expense.amount))
        )
      : 0;

  // Average expense
  const averageExpense =
    expenses.length > 0
      ? totalExpense / expenses.length
      : 0;

  // Search + filter + sort
  const filteredExpenses = [...expenses]
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

  // Add / Edit Expense
  const addExpense = async (e) => {
    e.preventDefault();

    if (!name || !amount || !date) {
      alert("Please fill all expense details");
      return;
    }

    try {
      if (editingId) {
        // UPDATE
        const response = await fetch(
          `https://expense-tracker-sw5p.onrender.com/expenses/${editingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name,
              amount: Number(amount),
              category,
              date,
              icon: categories[category],
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update expense");
        }

        const updatedExpense = await response.json();

        setExpenses((prev) =>
          prev.map((expense) =>
            expense._id === editingId ||
            expense.id === editingId
              ? updatedExpense
              : expense
          )
        );

        setEditingId(null);
      } else {
        // ADD
        const response = await fetch(
          "https://expense-tracker-sw5p.onrender.com/expenses",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name,
              amount: Number(amount),
              category,
              date,
              icon: categories[category],
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to add expense");
        }

        const newExpense = await response.json();

        setExpenses((prev) => [newExpense, ...prev]);
      }

      setName("");
      setAmount("");
      setCategory("Food");
      setDate("2026-08-15");
    } catch (error) {
      console.error("Expense error:", error);
      alert("Could not connect to backend");
    }
  };

  // Edit expense
  const editExpense = (expense) => {
    setEditingId(expense._id || expense.id);
    setName(expense.name);
    setAmount(expense.amount);
    setCategory(expense.category || "Other");
    setDate(expense.date || "2026-08-15");
  };

  // Delete expense
  const deleteExpense = async (id) => {
    try {
      const response = await fetch(
        `https://expense-tracker-sw5p.onrender.com/expenses/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete expense");
      }

      setExpenses((currentExpenses) =>
        currentExpenses.filter(
          (expense) =>
            expense._id !== id && expense.id !== id
        )
      );
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Could not delete expense");
    }
  };

  // Income
  const saveIncome = (e) => {
    e.preventDefault();

    if (!incomeInput || Number(incomeInput) <= 0) {
      alert("Enter a valid income");
      return;
    }

    setIncome(Number(incomeInput));
    setIncomeInput("");
  };

  // Budget
  const saveBudget = (e) => {
    e.preventDefault();

    if (!budgetInput || Number(budgetInput) <= 0) {
      alert("Enter a valid budget");
      return;
    }

    setBudget(Number(budgetInput));
    setBudgetInput("");
  };

    // CSV Export
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

  const handleAuth = async (e) => {
    e.preventDefault();

    if (!authEmail || !authPassword) {
      alert("Please enter email and password");
      return;
    }

    if (authMode === "register" && !authName) {
      alert("Please enter your name");
      return;
    }

    try {
      const endpoint =
        authMode === "register"
          ? "https://expense-tracker-sw5p.onrender.com/register"
          : "https://expense-tracker-sw5p.onrender.com/login";

      const body =
        authMode === "register"
          ? {
              name: authName,
              email: authEmail,
              password: authPassword,
            }
          : {
              email: authEmail,
              password: authPassword,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Authentication failed");
        return;
      }

      if (authMode === "login") {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("loggedInUser", JSON.stringify(data.user));

        setShowAuth(false);
        alert(`Welcome, ${data.user.name}!`);
      } else {
        alert("Registration successful! Please login.");

        setAuthMode("login");
        setAuthName("");
        setAuthPassword("");
      }

      setAuthEmail("");
    } catch (error) {
      console.error("Authentication error:", error);
      alert("Could not connect to server");
    }
  };
  const handleProfileUpdate = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("authToken");

  try {
    const response = await fetch(
      "https://expense-tracker-sw5p.onrender.com/profile",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileName,
          email: profileEmail,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Profile update failed");
      return;
    }

    localStorage.setItem("loggedInUser", JSON.stringify(data.user));
    setShowProfile(false);
    alert("Profile updated successfully!");
  } catch (error) {
    console.error("Profile update error:", error);
    alert("Could not connect to server");
  }
};
  const handleLogout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("loggedInUser");

  setShowAuth(true);
  setAuthMode("login");
};
if (showProfile) {
  return (
    <div className="profile-modal">
      <div className="profile-card">
        <h2>👤 My Profile</h2>

        <form onSubmit={handleProfileUpdate}>
          <input
            type="text"
            placeholder="Full Name"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            value={profileEmail}
            onChange={(e) => setProfileEmail(e.target.value)}
          />

          <button type="submit">
            Save Changes
          </button>

          <button
            type="button"
            className="profile-cancel"
            onClick={() => setShowProfile(false)}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
  if (showAuth) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>💰 Expense Tracker</h1>

          <p>
            {authMode === "login"
              ? "Welcome back! Login to continue."
              : "Create your account"}
          </p>

          <form onSubmit={handleAuth}>
            {authMode === "register" && (
              <input
                type="text"
                placeholder="Full Name"
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
            />

            <button type="submit">
              {authMode === "login" ? "Login" : "Register"}
            </button>
          </form>

          <button
            type="button"
            className="auth-switch"
            onClick={() =>
              setAuthMode(authMode === "login" ? "register" : "login")
            }
          >
            {authMode === "login"
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </button>
        </div>
      </div>
    );
  }

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
  className="profile-button"
  onClick={() => {
    const user = JSON.parse(
      localStorage.getItem("loggedInUser") || "{}"
    );
    setProfileName(user.name || "");
    setProfileEmail(user.email || "");
    setShowProfile(true);
  }}
>
  👤 Profile
</button>

<button
  className="logout-button"
  onClick={handleLogout}
>
  🚪 Logout
</button>

<button className="logout-button" onClick={handleLogout}>
  Logout
</button>
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
                filteredExpenses.map((expense) => {

                  const expenseId =
                    expense._id || expense.id;

                  return (
                    <div
                      className="expense-item"
                      key={expenseId}
                    >

                      <div className="expense-left">

                        <div className="expense-icon">
                          {expense.icon ||
                            categories[
                              expense.category
                            ] ||
                            "✨"}
                        </div>

                        <div>
                          <strong>
                            {expense.name}
                          </strong>

                          <p>
                            {expense.category ||
                              "Expense"}
                            {" • "}
                            {expense.date ||
                              "No date"}
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
                          type="button"
                          onClick={() =>
                            editExpense(expense)
                          }
                        >
                          ✎
                        </button>

                        <button
                          className="delete-button"
                          type="button"
                          onClick={() =>
                            deleteExpense(expenseId)
                          }
                        >
                          ×
                        </button>

                      </div>

                    </div>
                  );
                })
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
              ([categoryName, total]) => {

                const percentage =
                  totalExpense > 0
                    ? Math.min(
                        (total / totalExpense) * 100,
                        100
                      )
                    : 0;

                return (
                  <div
                    className="category-row"
                    key={categoryName}
                  >

                    <div>

                      <strong>
                        {categories[
                          categoryName
                        ] || "✨"}{" "}
                        {categoryName}
                      </strong>

                      <div className="category-line">

                        <div
                          className="category-progress"
                          style={{
                            width: `${percentage}%`,
                          }}
                        ></div>

                      </div>

                    </div>

                    <span>
                      ₹{total.toLocaleString()}
                    </span>

                  </div>
                );
              }
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

        {/* MONTHLY SUMMARY */}

        <section className="box monthly-box">

          <div className="monthly-header">
            <div>
              <span>MONTHLY SUMMARY</span>
              <h2>Spending Overview</h2>
            </div>

            <strong>
              {income > 0
                ? Math.round(
                    (totalExpense / income) * 100
                  )
                : 0}
              %
            </strong>
          </div>

          <div className="progress">

            <div
              className="progress-value"
              style={{
                width: `${
                  income > 0
                    ? Math.min(
                        (totalExpense / income) * 100,
                        100
                      )
                    : 0
                }%`,
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
                ₹
                {Math.round(
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
                      {categories[
                        categoryName
                      ] || "✨"}
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