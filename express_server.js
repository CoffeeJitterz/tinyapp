const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const PORT = 8080; // default port 8080
const app = express();
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser ());

//FUNCTIONS
//random string generator
function generateRandomString() {
return Math.random().toString(20).substr(2, 6);
};

//AUTHENTICATION HELPER FUNCTIONS
const findUserByEmail = function(email, users) {
  for (let userID in users) {
    const user = users[userID];
    if(email === user.email) {
      return user;
    };
  };
  return false;
};

const createUser = function(email, password, users) {
  const userID = generateRandomString();
  
  users[userID] = {
    id: userID,
    email,
    password
  };
  return userID
};

const authenticateUser = function (email, password, users){
  const userFound = findUserByEmail(email, users);
  
  if (userFound && userFound.password === password) {
    return userFound;
  };
  return false;
};

//URL DATABASE HELPER FUNCTIONS
const logURL= function(shortURL, longURL, userID, database){
  database[shortURL] = {
    longURL,
    userID
  }
  return shortURL;
}; 

//DATABASES
//"Database" for storing the urls
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

//user database
const usersDatabase = {
  "userRandomID": {
    id: "userRandomId",
    email: "user@example.com",
    password: "drowssap"
  },
  "user2RandomID": {
    id: "user2RandomId",
    email: "user2@example.com",
    password: "drowssap"
  }
}

//home page?
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Main Url Page => writes out and displays URL database
app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase, user: usersDatabase[req.cookies.user_id]};
  res.render("urls_index", templateVars);
});

//New URL Page
app.get("/urls/new", (req, res) => {
const templateVars = {user: usersDatabase[req.cookies.user_id]};
const user = templateVars.user;
if(!user) {
  res.redirect("/login")
  return;
};
res.render("urls_new", templateVars);
});

//Takes longURL, generates shortURL and saves the longURL plus the id of the user that made it
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  let longURL = req.body.longURL;
  longURL = longURL.startsWith("http") ? longURL : ('http://' + longURL)
  userID = usersDatabase[req.cookies.user_id].id;
  let urlID = logURL(shortURL, longURL, userID, urlDatabase)
  res.redirect(`/urls/${shortURL}`);
});

//Page which will contain short URL after it's created
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: usersDatabase[req.cookies.user_id]};
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

});

//edit(updat) urls from show_url page
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL; 
  res.redirect("/urls");
});





//registration page
app.get("/register", (req, res) => {
  const templateVars = {user: null}
  res.render("urls_register", templateVars);
})

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  const userFound = findUserByEmail(email, usersDatabase);
  
  if(!email || !password) {
    res.status(401).send('fields blank')
  }
  if (userFound) {
    res.status(403).send('Sorry, that user already exists');
    return;
  }
  
  const userID = createUser(email, password, usersDatabase);
  
  res.cookie('user_id', userID);
  
  //console.log()
  
  res.redirect("/urls");
  
});

//login page
app.get("/login", (req, res) => {
  const templateVars = {user: null};
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  const user = authenticateUser(email, password, usersDatabase);
  console.log(user);
  
  if(user) {
    res.cookie('user_id', user.id);
    res.redirect("/urls");
    return;
  }
  
  console.log(usersDatabase);
  res.status(403).send('Wrong credentials');
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//Listener
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
