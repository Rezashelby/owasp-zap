// app.js
const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const crypto = require("crypto"); // For generating CSP nonces
const app = express();
const port = 3000;

// Function to generate a nonce
const generateNonce = () => {
  return crypto.randomBytes(16).toString("base64");
};

// Use Helmet with custom CSP
app.use((req, res, next) => {
  // Generate a nonce for each request
  const nonce = generateNonce();
  res.locals.nonce = nonce; // Store nonce in response locals

  // Set CSP header with nonce
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"], // Only allow content from the same origin
      scriptSrc: ["'self'", `'nonce-${nonce}'`], // Only allow scripts from the same origin or with this nonce
      styleSrc: ["'self'"], // Allow styles only from the same origin
      objectSrc: ["'none'"], // Disallow <object>, <embed>, or <applet> tags
      upgradeInsecureRequests: [], // Automatically upgrade http: URLs to https:
    },
  })(req, res, next);
});

// Use body-parser to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Use cookie-parser to manage cookies
app.use(cookieParser());

// Custom Headers
app.use((req, res, next) => {
  // Set Anti-clickjacking Header
  res.setHeader("X-Frame-Options", "DENY");

  // Set Permissions Policy Header
  res.setHeader("Permissions-Policy", "geolocation=(self)"); // Adjust as needed

  // Set X-Content-Type-Options Header
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Remove X-Powered-By Header
  res.removeHeader("X-Powered-By");

  next();
});

// No-Cache Middleware for Sensitive Routes
const noCache = (req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
};

// Basic Home Route
app.get("/", noCache, (req, res) => {
  res.send("Hello World!");
});

// User Login Route (Insecure)
app.post("/login", noCache, (req, res) => {
  const { username, password } = req.body;

  // Simulate insecure login logic (e.g., storing passwords in plain text)
  if (username === "admin" && password === "password123") {
    res.send("Login successful! Welcome, admin.");
  } else {
    res.status(401).send("Invalid username or password.");
  }
});

// Information Disclosure Route
app.get("/debug", noCache, (req, res) => {
  res.send("Debug info: This is sensitive information!");
});

// Simple Form (XSS Protected)
app.get("/form", (req, res) => {
  // Use nonce in inline script
  const nonce = res.locals.nonce;
  const html = `
    <h1>Feedback Form</h1>
    <form action="/submit" method="post">
      <input type="text" name="feedback" placeholder="Enter your feedback" />
      <button type="submit">Submit</button>
    </form>
  `;
  res.send(html);
});

// Form Submission (Sanitized to prevent XSS)
app.post("/submit", noCache, (req, res) => {
  const { feedback } = req.body;
  // Sanitize user input to prevent XSS
  const sanitizedFeedback = feedback
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  res.send(`Your feedback: ${sanitizedFeedback}`);
});

// Secure Cookie Route
app.get("/setcookie", noCache, (req, res) => {
  // Setting a secure cookie with 'HttpOnly' and 'Secure' flags
  res.cookie("sessionId", "123456", {
    maxAge: 900000,
    httpOnly: true, // Prevents client-side access to the cookie
    secure: true, // Ensures the cookie is sent over HTTPS only
    sameSite: "Strict", // Prevents CSRF attacks
  });
  res.send("Secure cookie has been set!");
});

// Start the server
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
