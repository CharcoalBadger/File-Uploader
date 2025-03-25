const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

// Show all folders
router.get("/folders", ensureAuth, async (req, res) => {
  const folders = await prisma.folder.findMany({
    where: { userId: req.user.id },
    include: { files: true },
  });
  res.render("folders", { user: req.user, folders });
});

// Create a folder
router.post("/folders", ensureAuth, async (req, res) => {
  const { name } = req.body;
  await prisma.folder.create({
    data: {
      name,
      userId: req.user.id,
    },
  });
  res.redirect("/folders");
});

// View a single folder and its files
router.get("/folders/:id", ensureAuth, async (req, res) => {
  const folder = await prisma.folder.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { files: true },
  });

  if (!folder || folder.userId !== req.user.id) {
    return res.status(403).send("Access denied");
  }

  res.render("folder", { folder });
});

// (Optional) Delete a folder
router.post("/folders/:id/delete", ensureAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  await prisma.folder.delete({ where: { id } });
  res.redirect("/folders");
});

module.exports = router;
