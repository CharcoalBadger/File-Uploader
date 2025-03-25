const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient(); // ⬅️ This is what you're missing

// Protect route
function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

// Dashboard route
router.get("/dashboard", ensureAuth, async (req, res) => {
  const files = await prisma.file.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });

  res.render("dashboard", { user: req.user, files });
});

// Upload page
router.get("/upload", ensureAuth, (req, res) => {
  res.render("upload");
});

router.get("/", (req, res) => {
  res.redirect("/dashboard");
});

router.get("/download/:id", ensureAuth, async (req, res) => {
  const file = await prisma.file.findUnique({
    where: { id: parseInt(req.params.id) },
  });

  if (!file || file.userId !== req.user.id) {
    return res.status(403).send("Access denied");
  }

  res.download(file.url); // Sends file as a download
});

module.exports = router;
