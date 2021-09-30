const bcrypt = require('bcryptjs');

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
  
  // //create new user and add to user database
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
  
  
  // //URL DATABASE HELPER FUNCTIONS
  //create new url and add to url database
  const logURL= function(shortURL, longURL, userID, userDB){
    userDB[shortURL] = {
      longURL,
      userID
    }
    return shortURL;
  }; 
  
  // //display user's urls 
  const urlsForUser = function(userID, urlDatabase){
    const urls = {};
    for (let shortURL in urlDatabase) {
      if(userID === urlDatabase[shortURL].userID)
      urls[shortURL] = urlDatabase[shortURL].longURL;
    }
    return urls;
  }
  

  module.exports = {
    generateRandomString,
    findUserByEmail,
    authenticateUser,
    createUser,
    logURL,
    urlsForUser
  };
  
  