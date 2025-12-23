const express = require("express");
const app = express();

const port = process.env.PORT || 8080;

const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const methodOverride = require("method-override");



// ✅ CORRECT view engine setup (case-sensitive)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ✅ Static files
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ✅ Body parser
app.use(express.urlencoded({ extended: true }));

// ✅ Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// ✅ Data
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

// ✅ Show posts
app.get("/posts", (req, res) => {
    res.render("index", { posts });
});

// ✅ Form page
app.get("/posts/new", (req, res) => {
    res.render("new");
});

// ✅ Create post WITH IMAGE
app.post("/posts", upload.single("image"), (req, res) => {
    console.log(req.file); // 🔥 IMPORTANT DEBUG

    posts.push({
    id: uuidv4(),      // ✅ MUST EXIST
    username: req.body.username,
    content: req.body.content,
    image: req.file ? req.file.filename : null
});

    res.redirect("/posts");
});

app.get("/posts/:id", (req, res) => {
    let { id } = req.params;
    let post = posts.find((p) => p.id === id);
    res.render("show.ejs", { post });
});

app.patch("/posts/:id", upload.single("image"), (req, res) => {
    let { id } = req.params;
    let post = posts.find(p => p.id === id);

    if (!post) {
        return res.status(404).send("Post not found");
    }

    // update content
    post.content = req.body.content;

    // update image ONLY if new image uploaded
    if (req.file) {
        post.image = req.file.filename;
    }

    res.redirect("/posts");
});



app.get("/posts/:id/edit", (req, res) => {
    let { id } = req.params;
    let post = posts.find(p => p.id === id);
    

    if (!post) {
        return res.status(404).send("Post not found");
    }

    res.render("edit.ejs", { post });
});


app.delete("/posts/:id", (req, res) => {
    let { id } = req.params;

    posts = posts.filter(p => p.id !== id);

    res.redirect("/posts");
});

app.listen(port, () => {
    console.log("Server running on http://localhost:8080/posts");
});

app.use(express.json());
