const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Login attempt for:", username);

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // 1. Find user
    let [users] = await db.query("SELECT * FROM users WHERE username = ?", [username]);

    // 2. Fallback for phone numbers
    if (users.length === 0) {
      const cleanPhone = username.replace(/\D/g, '').slice(-10);
      if (cleanPhone.length === 10) {
        console.log("Trying flexible match for:", cleanPhone);
        [users] = await db.query("SELECT * FROM users WHERE username LIKE ?", [`%${cleanPhone}`]);
      }
    }

    if (users.length === 0) {
      console.log("User not found:", username);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];

    // 3. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for:", username);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 4. Get member name if applicable
    let displayName = user.username;
    if (user.member_id) {
      try {
        const [members] = await db.query("SELECT name FROM members WHERE id = ?", [user.member_id]);
        if (members && members.length > 0) {
          displayName = members[0].name;
        }
      } catch (mErr) {
        console.log("Error fetching member name:", mErr.message);
      }
    }

    // 5. Generate token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role, 
        member_id: user.member_id,
        name: displayName 
      },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    console.log("Login successful:", username);
    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        member_id: user.member_id,
        name: displayName
      }
    });

  } catch (err) {
    console.error("CRITICAL LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
