var a = require("express");
var app = a();
var PORT = process.env.PORT || 8080;
const bcrypt = require('bcrypt');
const cookieSession = require("cookie-session");

app.set("view engine", "ejs")

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


app.use(cookieSession({
  name: 'session',
  keys: ['zsxdfghjklsdghjklcvbnmsdfghjk']
}));


const users = {
  "user1RandomID": {
    id: "user1RandomID",
    email: "user1@example.com",
    password: bcrypt.hashSync("password", 10)
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  },
 "user3RandomID": {
    id: "user3RandomID",
    email: "user3@example.com",
    password: bcrypt.hashSync("xcvbnm-cvbnm", 10)
  },
 "user4RandomID": {
    id: "user4RandomID",
    email: "user4@example.com",
    password: bcrypt.hashSync("qwertyuio-zxcv", 10)
  }
}

var urlDatabase = {
  "b2xVn2": {
    userID: "user1RandomID",
    longURL: "http://www.lighthouselabs.ca"
  },
  "9sm5xK": {
    userID: "user2RandomID",
    longURL: "http://www.google.com"
  }
};


const addUserToReq = (req, res, next) => {
  let user = users[req.session['user_id']];
  req.user = user;
  next();
}

app.use(addUserToReq);


function urlsForUser(id){
  var urlsCollection = {};
  for(var short in urlDatabase){
    if(urlDatabase[short].userID === id){
      urlsCollection[short] = {
        shortURL : short,
        longURL : urlDatabase[short].longURL
      }
    }
  }
  return urlsCollection;
}


function checkIdForUser(userId, shortUrl) {
  return (urlDatabase[shortUrl] && urlDatabase[shortUrl].userID === userId);
}

app.get("/urls/new", (req, res) => {
  if(req.session.user_id){
    let templateVars = {
      user: req.user
    }
    res.render("urls_new", templateVars);
  }
  else{
    res.redirect('/login');
  }

});

app.post("/urls", (req, res) => {
  const longUrl = req.body.longURL;
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = {
    userID: req.session.user_id,
    longURL: longUrl
  },
  res.redirect('/urls/' + shortUrl);
});

app.get("/u/:shortURL", (req, res) => {

  let longURL = req.params.shortURL;
  res.redirect(urlDatabase[longURL]);
});

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); // send urlDatabase as string in json format
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
                      // render(""name of file contains ejs
                      //urls is the varialbe that i created and is made a
                      //vailable in template file
                      // 2nd is the object that has variables that we want
                      //ot use in template)

  if (req.session.user_id){

    let urlsCollection = urlsForUser(req.session.user_id);

    let templateVars = {
      user: req.user,
      urls: urlsCollection
    };

    res.render("urls_index", templateVars);
  }
  else {
    res.redirect('/login');
  }

});


                // the ":" represents a parameters

app.get("/urls/:id", (req, res) => {
  var userID = req.session.user_id;
  var shortUrlId = req.params.id;

  if (checkIdForUser(userID, shortUrlId)) {
    let templateVars = {
      user: userID,
      shortURL: req.params.id,
      longURL: urlDatabase[shortUrlId].longURL
    };
    res.render("urls_show", templateVars);
  }
  else {
    res.send("Your userID does not have the authorization to perform this operation.");
  }
});

app.get("/urls/:id/webpage", (req, res) => {
  let longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

function generateRandomString() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

const find = email => {
  for(let user in users ){
    if(users[user].email === email){
      return true;
    }
  }
  return false;
}

// delete a short and long url
app.post("/urls/:id/delete", (req, res) => {
  let userID = req.session[user_id]; // get the userId
  for(var shortURL in urlDatabase){
    if(urlDatabase[shortURL].userID === userID){
      delete( urlDatabase[req.params.id] );
      res.redirect("/urls");
    }
  }
});

//update a long url
app.post("/urls/:id", (req, res) => {
  if(req.session[user_id] === req.params.id){
    let userID = req.session[user_id];
    for(var shortURL in urlDatabase){
      if(urlDatabase[shortURL].userID === userID){
        urlDatabase[req.params.id].longURL = req.body.updateURL;
        res.redirect("/urls");
      }
    }
  }

  else{
    res.send("Your userID does not have the authorization to perform this operation.");
  }


});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
res.render('urls_register');
});

app.post("/register", (req, res) => {

  if(req.body.email === "" || req.body.password === ""){
    return res.status(404).send("Email and Password cannot be empty.");
  }

 if(find(req.body.email)){
    return res.status(404).send("this email address has already been used");
  }

  let userRandomId = generateRandomString();

  const password = req.body.password;// you will probably this from req.params
  const hashed_password = bcrypt.hashSync(password, 10);


  users[userRandomId] = {
    id: userRandomId,
    email: req.body.email,
    password: hashed_password
  }

  req.session.user_id = userRandomId;

  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  res.render('urls_login');
});

app.post("/login", (req, res) => {
  for(var key in users){
    if(req.body.email === users[key].email && bcrypt.compareSync(req.body.password, users[key].password)){
      req.session.user_id = key;
      return res.redirect('/urls');
    }
  }
  res.status(403).send("Either email does not exist or password is incorrect.");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

