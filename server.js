
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}
const express = require('express');
const app = express();
const passport = require('passport');
const initializer = require('./controllers/passport-config');
const session = require('express-session');
const flash = require('express-flash');
const chekcAuthenticated = require('./controllers/authenticate');
const client = require('./controllers/DB');
const fs = require('fs');


app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/DataBase'));

// this is the home page router
app.get('/', (req, res) => {
    res.render('index');
});

// this is the login route in the server

initializer(passport);

app.use(session(
    {
        secret : process.env.SECRET_SESSION,
        resave : false,
        saveUninitialized : false
    }
));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());


app.use(express.urlencoded({ extended: false}));

app.get('/login', (req, res)=>{
    res.render('login');
});



app.post('/login',
    (req , res, next) =>{

        if(req.body.username == "") res.render('login', {message : "Please enter your username", password : req.body.password});
        else if(req.body.password == "") res.render('login', {message : "Please enter your password", username : req.body.username});
        else return next();

    }, passport.authenticate('local', {
        successRedirect : '/dashboard',
        failureRedirect : '/login',
        failureFlash: true
    }));

    // this is a logout 
    app.get('/logout', (req, res)=>{
        req.session.destroy();
        res.redirect('/login');
    }
);

// this is the register route in the server
const Register = require('./routers/register');
app.use('/register', Register); 

// this is the dashboard router in the server
const Dashboard = require('./routers/dashboard');
app.use('/dashboard', chekcAuthenticated, Dashboard);

// this is the galleries router in the server.

const Galleries = require('./routers/galleries');
app.use('/galleries', chekcAuthenticated, Galleries);

// this is the mygalleries router in the server

const MyGalleries = require('./routers/mygal');
app.use('/mygalleries', chekcAuthenticated, MyGalleries);

app.get('/mygalleries/trash/:post_id?' ,  chekcAuthenticated, (req, res) =>{

    console.log("DELETE ROUTE: ");

    client.query(`SELECT * FROM post_data WHERE post_id = ${req.params.post_id}`, (err, que)=>{

        if(!err){

            if(que.rows.length != 0){
                if(que.rows[0].post_username == req.user.username){
                    client.query(`
                    DELETE
                    FROM post_react
                    WHERE post_react =${req.params.post_id};
                    DELETE 
                    FROM post_data 
                    WHERE post_id = ${req.params.post_id};
                    `, (err, que2)=>{
                        if(!err){
                            console.log("POST DATA: Delete post succesfully.");
                            fs.unlink(__dirname +'\\public\\' + que.rows[0].post_img_file_path , (err) =>{
                                if(!err){
                                    console.log("Delete File successfully.");
                                }else{
                                    console.log(err.message);
                                }
                            });
                        }else{
                            console.log("System Error: " + err.message);
                        }   
                    });
                }else{
                    res.write("You are trying to delete a post from a different user.");
                    res.write("<a href = '/dashboard'>back</a>");
                }
            }else{
                res.write("You are trying to delete a post from a different user.");
                res.write("<a href = '/dashboard'>back</a>");
            }
        }else{
            console.log("System Error: " + err.message);
        }
    });
    
    res.redirect("/mygalleries");

});



// this is the post route in the server
const Posting = require('./routers/posting');
app.use('/posting', chekcAuthenticated, Posting);



console.log("Current time: " + new Date());
app.listen(process.env.LOCALPORT);