const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// 1. SQL Injection Vulnerability
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  // Simulated SQL injection vulnerability (no real database)
  if (username === "admin" && password === "admin") {
    res.send("Login successful!");
  } else if (username.includes("' OR '") || password.includes("' OR '")) {
    res.send(`SQL Injection success! Query: ${query}`);
  } else {
    res.send("Invalid username or password.");
  }
});

// 2. Insecure Cookies (No HttpOnly, No Secure, No SameSite)
app.get("/set-cookie", (req, res) => {
  res.cookie("sessionId", "123456789", {
    httpOnly: false,
    secure: false,
    sameSite: "none",
  });
  res.send("Cookie set without security flags.");
});

// 3. Cross-Site Scripting (XSS)
app.get("/search", (req, res) => {
  const query = req.query.q;
  const responseHTML = `<h1>Search results for: ${query}</h1>`;
  res.send(responseHTML); // Vulnerable to XSS
});

// 4. Command Injection
app.get("/ping", (req, res) => {
  const host = req.query.host;
  require("child_process").exec(
    `ping -c 1 ${host}`,
    (error, stdout, stderr) => {
      if (error) {
        return res.send(`Error: ${stderr}`);
      }
      res.send(`Ping results: ${stdout}`);
    }
  );
});

// 5. Insecure HTTP Headers
app.get("/headers", (req, res) => {
  // Remove important security headers to trigger vulnerabilities
  res.removeHeader("X-Content-Type-Options");
  res.removeHeader("X-Frame-Options");
  res.removeHeader("Content-Security-Policy");
  res.removeHeader("Strict-Transport-Security");

  res.send("Headers removed for testing purposes.");
});

// 6. No Rate Limiting on Sensitive Action (Login Brute Force Simulation)
app.post("/brute-login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin") {
    res.send("Login successful!");
  } else {
    res.send("Invalid login attempt.");
  }
});

// 7. Weak Cryptography
app.get("/weak-encryption", (req, res) => {
  const algorithm = "aes-128-cbc"; // Weak encryption algorithm
  const key = crypto.randomBytes(16);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update("Sensitive data", "utf8", "hex");
  encrypted += cipher.final("hex");

  res.send(`Weak encryption result: ${encrypted}`);
});

// Start server
app.listen(port, () => {
  console.log(`Vulnerable app listening at http://localhost:${port}`);
});
