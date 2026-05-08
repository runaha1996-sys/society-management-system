const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Validate input
    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required"
      });
    }

    // 2. Find user in DB
    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    const user = rows[0];

    // 3. Check user exists
    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    // 4. Check password (bcrypt)
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    // 5. Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    // 6. Success response
    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Server error"
    });
  }
};
