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



//*******DATABASES*******
//**url database**
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

//**user database**
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



//redirect empty / to main page or login 
app.get("/", (req, res) => {
  const user = req.session.user_id;
  if (user) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//Main Url Page 
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;  
  const urls = helpers.urlsForUser(userID, urlDatabase)
  const user = usersDatabase[userID];
  const templateVars = {urls, user};
  res.render("urls_index", templateVars);
});

//New URL Page
app.get("/urls/new", (req, res) => {
const templateVars = {user: usersDatabase[req.session.user_id]};
const user = templateVars.user;
if(!user) {
  res.redirect("/login")
  return;
};
res.render("urls_new", templateVars);
});

//!!CREATE new url!!
app.post("/urls", (req, res) => {
  const shortURL = helpers.generateRandomString();
  
  let longURL = req.body.longURL;
  longURL = longURL.startsWith("http") ? longURL : ('http://' + longURL);
  const userID = req.session.user_id;
  let urlID = helpers.logURL(shortURL, longURL, userID, urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

//Short Url Page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: usersDatabase[req.session.user_id]};
  res.render("urls_show", templateVars);
});

//Redirect shortURL to longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL);
});

//EDIT(update)
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const userID = req.session.user_id

  if(!userID){
    res.status(403).send('unauthorized to edit');
    return;
  }

  urlDatabase[shortURL].longURL = longURL; 
  res.redirect("/urls");
});

//DELETE
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  
  if(!userID){
    res.status(403).send('unauthorized to delete');
    return;
  } 
  delete urlDatabase[shortURL];
  res.redirect("/urls");

});

//**|o|**REGISTER**|o|**\\
app.get("/register", (req, res) => {
  const templateVars = {user: null}
  res.render("urls_register", templateVars);
})

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
 
  const userFound = helpers.findUserByEmail(email, usersDatabase);
  
  if(!email || !password) {
    res.status(401).send('you left the fields bare!')
  }
  if (userFound) {
    res.status(403).send('Sorry, that user already exists');
    return;
  }
  const userID = helpers.createUser(email, password, usersDatabase);
  req.session.user_id = userID;
  res.redirect("/urls");
  
});

//**LOGIN**
app.get("/login", (req, res) => {
  const templateVars = {user: null};
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = helpers.authenticateUser(email, password, usersDatabase);

  if(user) {
    req.session.user_id = user.id;
    res.redirect("/urls");
    return;
  }
  
  res.status(403).send('Wrong credentials');
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


//TO DO

// /urls/new form submit button bug