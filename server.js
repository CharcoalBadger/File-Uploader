require("dotenv").config();
const express = require("express");
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const passport = require("passport");
const { PrismaClient } = require("@prisma/client");
const app = express();
const prisma = new PrismaClient();

// Body parsing middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/uploads", express.static("uploads"));

// Session config
app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, // Remove expired sessions every 2 mins
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

// Passport config and session
require("./config/passport")(passport); // ✅ Fix applied here
app.use(passport.initialize());
app.use(passport.session());

// View engine
app.set("view engine", "ejs");

// Routes
const authRoutes = require("./routes/auth");
const indexRoutes = require("./routes/index");
const uploadRoutes = require("./routes/upload");
const folderRoutes = require("./routes/folders");

app.use("/", authRoutes);
app.use("/", indexRoutes);
app.use("/", uploadRoutes);
app.use("/", folderRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
