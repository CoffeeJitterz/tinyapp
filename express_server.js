//requirements\\
const express = require("express");
const bodyParser = require("body-parser");
var cookieSession = require('cookie-session');
const helpers = require('./helpers.js');

const PORT = 8080; // default port 8080
const app = express();
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['ThIs Is aN unbREAKable paSSphRASE', 'So is THIS because there are many characters'],
}));



//*******DATABASES*******\\
//**urlDatabase**\\
const urlDatabase = {
      b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
    }
};

//**userDatabase**\\
const usersDatabase = {
  "userRandomId": {
    id: "userRandomId",
    email: "user@example.com",
    password: "drowssap"
  },
  "user2RandomId": {
    id: "user2RandomId",
    email: "user2@example.com",
    password: "drowssap"
  }
}



//redirect "/" to /urls or /login
app.get("/", (req, res) => {
  const user = req.session.user_id;
  if (user) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// /urls route
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;  
  const urls = helpers.urlsForUser(userID, urlDatabase)
  const user = usersDatabase[userID];
  const templateVars = {urls, user};
  res.render("urls_index", templateVars);
});

// /urls/new route
app.get("/urls/new", (req, res) => {
const user = usersDatabase[req.session.user_id];
const templateVars = {user: usersDatabase[req.session.user_id]};

if(!user) {
  res.redirect("/login")
  return;
};
res.render("urls_new", templateVars);
});

//***CREATEnewURL***\\
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  //ternary statment to ensure longURL starts with http://
  longURL = longURL.startsWith("http") ? longURL : ('http://' + longURL);
  const userID = req.session.user_id;
  //logs url in database and returns shortURL
  let shortURL = helpers.logURL(longURL, userID, urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

// urls/:id route
app.get("/urls/:id", (req, res) => {
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: usersDatabase[req.session.user_id]};
  res.render("urls_show", templateVars);
});

//Redirect shortURL to longURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL);
});

//**EDIT(update)**\\
app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id
  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;

  if(!userID){
    res.status(403).send('unauthorized to edit');
    return;
  }

  urlDatabase[shortURL].longURL = newLongURL; 
  res.redirect("/urls");
});

//**DELETE**\\
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  const userID = req.session.user_id;
  
  if(!userID){
    res.status(403).send('unauthorized to delete');
    return;
  } 
  delete urlDatabase[shortURL];
  res.redirect("/urls");

});

//**||**REGISTER**||**\\
app.get("/register", (req, res) => {
  const templateVars = {user: null}
  res.render("urls_register", templateVars);
})

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  //search for email and return user or false
  const user = helpers.findUserByEmail(email, usersDatabase);
  
  //if email or password fields are left blank
  if(!email || !password) {
    res.status(401).send('you left the fields blank!')
  }
  //if user already exists
  if (user) {
    res.status(403).send('Sorry, that user already exists');
    return;
  }
  //create new user and add to userDatabase. Create cookie.
  const userID = helpers.createUser(email, password, usersDatabase);
  req.session.user_id = userID;
  res.redirect("/urls");
  
});

//**LOGIN**\\
app.get("/login", (req, res) => {
  const templateVars = {user: null};
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //authenticate user email and password
  const user = helpers.authenticateUser(email, password, usersDatabase);

  if(!user) {
    res.status(403).send('Wrong credentials');
    return;
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
  
});

//**LOGOUT**
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//Listener
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

