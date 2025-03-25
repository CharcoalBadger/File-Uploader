const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Protect route middleware
function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

router.post("/upload", ensureAuth, upload.single("file"), async (req, res) => {
  if (!req.file) return res.send("No file uploaded.");

  const { originalname, size, path } = req.file;

  await prisma.file.create({
    data: {
      name: originalname,
      size,
      url: path,
      userId: req.user.id,
      folderId: null, // later when folders exist
    },
  });

  res.redirect("/dashboard");
});

module.exports = router;
