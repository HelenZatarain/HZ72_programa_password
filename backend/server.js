import express from "express";
import cors from "cors";

import {
  evaluatePassword,
  buildPasswordVariants,
} from "./passwordService.js";

const app = express();

const PORT = 3001;

app.use(cors());

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "Cifra backend funcionando",
  });
});

app.post(
  "/api/password/validate",
  (req, res) => {

    const { password = "" } = req.body;

    const result =
      evaluatePassword(password);

    res.json(result);
  }
);

app.post(
  "/api/password/generate",
  (req, res) => {

    const { phrase = "" } = req.body;

    const variants =
      buildPasswordVariants(phrase);

    res.json({
      variants,
    });
  }
);

app.listen(PORT, () => {

  console.log(
    `Cifra backend running on http://localhost:${PORT}`
  );

});