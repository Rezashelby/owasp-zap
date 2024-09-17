// app.js
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World!sss");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "password123") {
    res.send("Login successful! Welcome, admin.");
  } else {
    res.status(401).send("Invalid username or password.");
  }
});

app.get("/debug", (req, res) => {
  res.send("Debug info: This is sensitive information!");
});

app.get("/form", (req, res) => {
  const html = `
    <h1>Feedback Form</h1>
    <form action="/submit" method="post">
      <input type="text" name="feedback" placeholder="Enter your feedback" />
      <button type="submit">Submit</button>
    </form>
  `;
  res.send(html);
});

app.post("/submit", (req, res) => {
  const { feedback } = req.body;
  res.send(`Your feedback: ${feedback}`);
});

app.get("/setcookie", (req, res) => {
  res.cookie("sessionId", "123456", { maxAge: 900000 });
  res.send("Cookie has been set!");
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
