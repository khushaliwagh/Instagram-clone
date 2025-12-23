const express = require("express");
const app = express();

const port = process.env.PORT || 8080;

const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const methodOverride = require("method-override");

// =======================
// VERCEL SAFETY FLAGS
// =======================
const isVercel = process.env.VERCEL === "1";

// =======================
// VIEW ENGINE
// =======================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// =======================
// BODY PARSER
// =======================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// =======================
// METHOD OVERRIDE
// =======================
app.use(methodOverride("_method"));

// =======================
// STATIC FILES (SAFE)
// =======================
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// =======================
// MULTER (FIXED FOR VERCEL)
// =======================
let upload;

if (isVercel) {
  // Vercel cannot write files → prevent crash
  upload = multer({ storage: multer.memoryStorage() });
} else {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/uploads");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
  upload = multer({ storage });
}

// =======================
// GLOBAL MEMORY (NO CRASH)
// =======================
global.posts = global.posts || [
  {
    id: uuidv4(),
    image: "cat.jpg",
    username: "Cutie_CAT",
    content: "I love CAT!...,",
  },
  {
    id: uuidv4(),
    image: "pgp.jpg",
    username: "Smily_Girl",
    content: "I love MySelf!...& I love Someone",
  },
  {
    id: uuidv4(),
    image: "dog.jpg",
    username: "Dogesh_Bhai",
    content: "Dogesh Bhai is so Cute!..., MY Name is DOGESH!!",
  },
  {
    id: uuidv4(),
    image: "pfpb.jpeg",
    username: "Its_Me",
    content: "I am Handsome boy!..., MY Name is Rahul!!",
  }
];

let posts = global.posts;

// =======================
// ROUTES (UNCHANGED)
// =======================
app.get("/posts", (req, res) => {
  res.render("index", { posts });
});

app.get("/posts/new", (req, res) => {
  res.render("new");
});

app.post("/posts", upload.single("image"), (req, res) => {
  posts.push({
    id: uuidv4(),
    username: req.body.username,
    content: req.body.content,
    image: req.file ? req.file.originalname : "default.png"
  });
  res.redirect("/posts");
});

app.get("/posts/:id", (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  res.render("show.ejs", { post });
});

app.get("/posts/:id/edit", (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).send("Post not found");
  res.render("edit.ejs", { post });
});

app.patch("/posts/:id", upload.single("image"), (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).send("Post not found");

  post.content = req.body.content;
  if (req.file && req.file.originalname) {
    post.image = req.file.originalname;
  }

  res.redirect("/posts");
});

app.delete("/posts/:id", (req, res) => {
  posts = posts.filter(p => p.id !== req.params.id);
  global.posts = posts;
  res.redirect("/posts");
});

// =======================
// LOCAL ONLY LISTEN
// =======================
if (!isVercel) {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/posts`);
  });
}

// =======================
// REQUIRED FOR VERCEL
// =======================
module.exports = app;
