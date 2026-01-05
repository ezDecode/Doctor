const express = require("express");
const cors = require("cors");
require("dotenv").config();

const doctorsRouter = require("./routes/doctors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/doctors", doctorsRouter);

app.get("/", (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend running on ${PORT}`);
});
