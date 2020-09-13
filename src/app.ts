var express         = require('express');
var passport        = require('passport');
var bodyParser      = require('body-parser');
var session         = require('express-session');
var LocalStrategy   = require('passport-local').Strategy;

var app = express();
   
// hardcoded users
var users = [{"id":111, "username":"vijeesh", "password":"test123"}];
 
// passport needs ability to serialize and unserialize users out of session
passport.serializeUser(function (user, done) {
    done(null, users[0].id);
});
passport.deserializeUser(function (id, done) {
    done(null, users[0]);
});
 
// passport local strategy for local-login, local refers to this app
passport.use('local-login', new LocalStrategy(
	{
		usernameField: 'email',
		passwordField: 'pw'
	},
    function (username, password, done) {
        if (username === users[0].username && password === users[0].password) {
            return done(null, users[0]);
        } else {
            return done(null, false, {"message": "User not found."});
        }
    })
);

 
// body-parser for retrieving form data as well as json
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
 
// initialize passposrt and  session for persistent login sessions
app.use(session({
    secret: "1234567890",
    resave: true,
	saveUninitialized: true }));
	
app.use(passport.initialize());
app.use(passport.session());
 
//  middleware logic to check user is logged in or not
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
 
     res.redirect('login')
}
 
app.get("/", function (req, res) {
    res.send("Hello world");
});
 

app.get("/login", function (req, res) {
    res.send("<p>Please login </p><form method='post' action='/login'><input type='text' name='email'/><input type='password' name='pw'/><button type='submit' value='submit'>Submit</buttom></form>");
});

app.post("/login", 
    passport.authenticate("local-login", { failureRedirect: "/login"}),
    function (req, res) {
        res.redirect("/content");
});

app.get("/content", isLoggedIn, function (req, res) {
    res.send("<b>This is my secure page content<b><form action='logout'><input type='submit' value='logout'></form>");
});

app.get("/logout", function (req, res) {
    req.logout();
    res.send("logout success!");
});
 
// launch the app
app.listen(3030);
console.log("App running at localhost:3030");