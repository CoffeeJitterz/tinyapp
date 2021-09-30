const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');

const PORT = 8080; // default port 8080
const app = express();
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser ());


//HELPER FUNCTIONS
//random string generator
function generateRandomString() {
return Math.random().toString(20).substr(2, 6);
};

//AUTHENTICATION
//find email in user database
const findUserByEmail = function(email, usersDB) {
  for (let userID in usersDB) {
    const user = usersDB[userID];
    if(email === usersDB[userID].email) {
      console.log(user);
      return user;
    };
  };
  return false;
};

//authenticate user password
const authenticateUser = function (email, password, usersDB){
  const user= findUserByEmail(email, usersDB);
  
  if (user && bcrypt.compare(password, user.password)) {
    return user;
  };
  return false;
};

//create new user and add to user database
const createUser = function(email, password, users) {
  const userID = generateRandomString();

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  users[userID] = {
    id: userID,
    email,
    password: hashedPassword
  };
  return userID
};


//URL DATABASE HELPER FUNCTIONS
//create new url and add to url database
const logURL= function(shortURL, longURL, userID, database){
  database[shortURL] = {
    longURL,
    userID
  }
  return shortURL;
}; 

//display user's urls 
const urlsForUser = function(userID, urlDatabase){
  const urls = {};
  for (let shortURL in urlDatabase) {
    if(userID === urlDatabase[shortURL].userID)
    urls[shortURL] = urlDatabase[shortURL].longURL;
  }
  return urls;
}





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



//redirect empty / to main page or login 
app.get("/", (req, res) => {
  const user = req.cookies.user_id;
  if (user) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//Main Url Page 
app.get("/urls", (req, res) => {
  const userID = req.cookies.user_id;  
  const urls = urlsForUser(userID, urlDatabase)
  const userEmail = usersDatabase[userID].email;
  const templateVars = {urls, user: userID, email: userEmail};
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

//!!CREATE new url!!
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  let longURL = req.body.longURL;
  longURL = longURL.startsWith("http") ? longURL : ('http://' + longURL)
  userID = usersDatabase[req.cookies.user_id].id;
  let urlID = logURL(shortURL, longURL, userID, urlDatabase)

  console.log(urlDatabase)
 
  res.redirect(`/urls/${shortURL}`);
});

//Short Url Page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: usersDatabase[req.cookies.user_id]};
  res.render("urls_show", templateVars);
});

//Redirect shortURL to longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL);
});

//DELETE
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.cookies.user_id;
  
  if(!userID){
    res.status(403).send('unauthorized to delete');
    return;
  } 
  delete urlDatabase[shortURL];
  res.redirect("/urls");

});

//!!EDIT(update)!!
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const userID = req.cookies.user_id

  if(!userID){
    res.status(403).send('unauthorized to edit');
    return;
  }

  urlDatabase[shortURL] = longURL; 
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
 
  const userFound = findUserByEmail(email, usersDatabase);
  
  if(!email || !password) {
    res.status(401).send('you left the fields bare!')
  }
  if (userFound) {
    res.status(403).send('Sorry, that user already exists');
    return;
  }
  const userID = createUser(email, password, usersDatabase);
  res.cookie('user_id', userID);
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
  //const userID = 
  console.log(req.body);
  const user = authenticateUser(email, password, usersDatabase);
  
  if(user) {
    res.cookie('user_id', user.id);
    res.redirect("/urls");
    return;
  }
  
  console.log(usersDatabase);
  res.status(403).send('Wrong credentials');
});

//**LOGOUT**
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//Listener
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//TO DO

//LOG IN *
//LOG OUT
//REGISTER
//CHANGE shortURL to id?
//HELPER FUNCTIONS
//DELETE
//EDIT