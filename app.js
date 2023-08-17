//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const db = require('./db');
const ejs = require("ejs");
const mongoose = require("mongoose");
const multer = require("multer");
const _ = require("lodash");
const { kebabCase } = require("lodash");
const path = require("path");


const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

const posts = [];

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("uploads"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});

const upload = multer({ storage: storage });

db.connect();

const postSchema = {
  title: String,
  content: String,
  imagePath: String
};

const Post = mongoose.model("Post", postSchema);

app.get("/", async function(req, res){
  try {
    // Fetch all posts from the database
    const posts = await Post.find({});

    res.render("home", { homeText: homeStartingContent, newPosts: posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).send("Error fetching posts");
  }
});

app.get("/about", function(req, res){
  res.render("about", {aboutText: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactText: contactContent});
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.get("/post", function(req, res){
  res.redirect("/");
});

app.post("/compose", upload.single("file"), async function (req, res) {
  console.log("File uploaded:", req.file);
  const { postTitle, postBody } = req.body;
  const imagePath = req.file ? "uploads/" + req.file.filename : null;

  const post = new Post({
    title: postTitle,
    content: postBody,
    imagePath: imagePath
  });

  try {
    // Save the post to the database
    await post.save();
    res.redirect("/");
  } catch (error) {
    console.error("Error saving post:", error);
    res.status(500).send("Error saving post");
  }
});

app.get("/posts/:postId", async function(req, res){
  const postId = req.params.postId;

  try {
    // Find the post by postId in the database
    const post = await Post.findById(postId);

    if (post) {
      res.render("post", {
        title: post.title,
        content: post.content,
        imagePath: post.imagePath,
        path: path
      });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).send("Error fetching post");
  }
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
