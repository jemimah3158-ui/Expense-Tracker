require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Expense = require("./models/Expense");
const User = require("./models/User");
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide name, email and password",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({
      message: "Registration successful",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Registration failed",
    });
  }
});
// Home
app.get("/", (req, res) => {
  res.send("Expense Tracker Backend is running!");
});
  
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "expense_tracker_secret",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Login failed",
       });
      }
    });
    app.put("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization token required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "expense_tracker_secret"
    );

    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const existingUser = await User.findOne({
      email,
      _id: { $ne: decoded.userId },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { name, email },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    res.status(500).json({
      message: "Profile update failed",
    });
  }
});
  
// Get all expenses
app.get("/expenses", async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    console.error("GET expenses error:", error);
    res.status(500).json({
      message: "Failed to fetch expenses",
    });
  }
});

// Add expense
app.post("/expenses", async (req, res) => {
  try {
    const { name, amount, category, date, icon } = req.body;

    if (!name || !amount || !category || !date) {
      return res.status(400).json({
        message: "Please provide all expense details",
      });
    }

    const expense = new Expense({
      name,
      amount: Number(amount),
      category,
      date,
      icon: icon || "✨",
    });

    const savedExpense = await expense.save();

    res.status(201).json(savedExpense);
  } catch (error) {
    console.error("POST expense error:", error);
    res.status(500).json({
      message: "Failed to add expense",
    });
  }
});

// Update expense
app.put("/expenses/:id", async (req, res) => {
  try {
    const { name, amount, category, date, icon } = req.body;

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        name,
        amount: Number(amount),
        category,
        date,
        icon: icon || "✨",
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedExpense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.json(updatedExpense);
  } catch (error) {
    console.error("PUT expense error:", error);
    res.status(500).json({
      message: "Failed to update expense",
    });
  }
});

// Delete expense
app.delete("/expenses/:id", async (req, res) => {
  try {
    const deletedExpense = await Expense.findByIdAndDelete(
      req.params.id
    );

    if (!deletedExpense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.json({
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("DELETE expense error:", error);
    res.status(500).json({
      message: "Failed to delete expense",
    });
  }
});

// Total expense
app.get("/expense/total", async (req, res) => {
  try {
    const result = await Expense.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    res.json({
      total: result.length ? result[0].total : 0,
    });
  } catch (error) {
    console.error("TOTAL expense error:", error);
    res.status(500).json({
      message: "Failed to calculate total",
    });
  }
});

// Monthly expenses
app.get("/expense/monthly", async (req, res) => {
  try {
    const result = await Expense.aggregate([
      {
        $group: {
          _id: {
            $substr: ["$date", 0, 7],
          },
          total: {
            $sum: "$amount",
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    res.json(result);
  } catch (error) {
    console.error("MONTHLY expense error:", error);
    res.status(500).json({
      message: "Failed to calculate monthly expenses",
    });
  }
});

// Category expenses
app.get("/expense/category", async (req, res) => {
  try {
    const result = await Expense.aggregate([
      {
        $group: {
          _id: "$category",
          total: {
            $sum: "$amount",
          },
        },
      },
      {
        $sort: {
          total: -1,
        },
      },
    ]);

    res.json(result);
  } catch (error) {
    console.error("CATEGORY expense error:", error);
    res.status(500).json({
      message: "Failed to calculate category expenses",
    });
  }
});

// Connect MongoDB first, then start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });