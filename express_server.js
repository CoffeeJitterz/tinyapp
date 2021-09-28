const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {
return Math.random().toString(20).substr(2, 6);
};

//"Database" for storing the urls
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//home page?
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Main Url Page => writes out and displays URL database
app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});

//New URL Page
app.get("/urls/new", (req, res) => {
res.render("urls_new");
});

//Takes longURL, generates shortURL and saves them as key value pair to urlDatabase
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  longURL = longURL.startsWith("http") ? longURL : ('http://' + longURL)
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

//Page which will contain short URL after it's created
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

//Deletes URLs on Main Page
app.post("/urls/:shortURL/delete", (req, res) => {
  const key = req.params.shortURL;
  delete urlDatabase[key];
  res.redirect("/urls");

})

//Listener
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
