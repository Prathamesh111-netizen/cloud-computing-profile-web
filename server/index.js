const express = require("express");
const morgan = require("morgan");
const pg = require("pg");
const cors = require("cors");
const { urlencoded } = require("express");

const app = express();

app.use(express.urlencoded({ extended: true }));
// allow 50 MB file uploads
app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use(morgan("dev"));

const pool = new pg.Pool({
  user: "postgres",
  password: "postgrespw",
  host: "",
  database: "profile",
  port: 5432,
});

// CREATE a new user
app.post("/users", async (req, res) => {
  const { name, email, password, image } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query(
      "INSERT INTO users (name, email, password, image) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, password, image]
    );
    client.release();
    res.send({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating user");
  }
});

// READ all users
app.get("/users", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM users");
    client.release();
    res.send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error getting users");
  }
});

// READ one user by ID
app.get("/users/:email", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM users WHERE email = $1", [
      req.params.email,
    ]);
    client.release();
    res.send({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error getting user");
  }
});

// UPDATE one user by ID
app.put("/users", async (req, res) => {
  const { name, email, password, image } = req.body;
  try {
    const client = await pool.connect();

    // image is optional
    if (!image) {
      const result = await client.query(
        "UPDATE users SET name = $1, email = $2, password = $3 WHERE email = $4 RETURNING *",
        [name, email, password, email]
      );
      client.release();
      res.send({ success: true, data: result.rows[0] });
      return;
    }

    const result = await client.query(
      "UPDATE users SET name = $1, email = $2, password = $3, image = $4 WHERE email = $5 RETURNING *",
      [name, email, password, image, email]
    );
    client.release();
    res.send(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating user");
  }
});

// DELETE one user by ID
app.delete("/users/:email", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("DELETE FROM users WHERE email = $1", [
      req.params.email,
    ]);
    client.release();
    res.send(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting user");
  }
});

app.listen(8080, () => console.log("Server listening on port 8080!"));
