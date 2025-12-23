const express = require("express");
const app = express();

const port = process.env.PORT || 8080;

const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const methodOverride = require("method-override");

//  view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// body parser FIRST
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// THEN method override
app.use(methodOverride("_method"));

// static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));


//  Multer config (unchanged)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });


//  Data
let posts = [
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


// Routes
app.get("/posts", (req, res) => {
  res.render("index", { posts });
});

app.get("/posts/new", (req, res) => {
  res.render("new");
});

app.post("/posts", upload.single("image"), (req, res) => {
  console.log(req.file);

  posts.push({
    id: uuidv4(),
    username: req.body.username,
    content: req.body.content,
   image: req.file ? req.file.originalname : null

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

  // ONLY update image if new image uploaded
  if (req.file && req.file.originalname) {
    post.image = req.file.originalname;
  }

  res.redirect("/posts");
});


app.delete("/posts/:id", (req, res) => {
  posts = posts.filter(p => p.id !== req.params.id);
  res.redirect("/posts");
});

//  DO NOT listen on Vercel
// app.listen(port, () => {
//   console.log("Server running on http://localhost:8080/posts");
// });

if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/posts`);
  });
}

module.exports = app;
