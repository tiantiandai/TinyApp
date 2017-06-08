var a = require("express");
var app = a();
var PORT = process.env.PORT || 8080;

app.set("view engine", "ejs")

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookiesParser = require("cookie-parser");
app.use(cookiesParser());

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls/new", (req, res) => {
  console.log(req.cookies);
  let templateVars = {
    username: req.cookies["username"]
  }
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  const longUrl = req.body.longURL;
  const shrotUrl = generateRandomString();
  urlDatabase[shrotUrl] = longUrl;
  res.redirect('/urls/' + shrotUrl);
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
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});
                // the ":" represents a parameters
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.id,
    urls: req.body};
  res.render("urls_show", templateVars);
});

function generateRandomString() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

// delete a short and long url
app.post("/urls/:id/delete", (req, res) => {
  delete( urlDatabase[req.params.id] );
  res.redirect("/urls");
});

//update a long url
app.post("/urls/:id", (req, res) => {
    console.log(req.body);
    urlDatabase[req.params.id] = req.body.updateURL;
    res.redirect("/urls");
});

app.post("/login", (req, res) => {
    console.log(req.body);
    res.cookie('username',req.body.username);
    res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie(req.body.username);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

