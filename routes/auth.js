const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const router = express.Router();

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return res.send("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { email, password: hashedPassword },
  });

  res.redirect("/login");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  })
);

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/login");
  });
});

module.exports = router;
