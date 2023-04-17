const express = require('express');
const register = express.Router();
const bcrypt = require('bcrypt');
const client = require('../controllers/DB');

client.connect((err)=>{
    if(err){
        console.log("Database connection status: error");
    }
    console.log("Database connection status: connected");
});
register.use(express.urlencoded({ extended: false}));
register.get('/', (req , res) =>{
    res.render('register');
});
register.post('/', async (req, res) =>{
    if(checkInputField(req.body.username, req.body.name, req.body.email, req.body.pass, req.body.cpass)){
        res.render('register', { error : "Please fill out all the requirements.", username : req.body.username ,name : req.body.name, email: req.body.email, pass : req.body.pass, cpass : req.body.cpass});
    }else{
        try{
            const hashpass = await bcrypt.hash(req.body.cpass, 10);
                client.query(`INSERT INTO user_data(username, user_full_name, user_email, user_password) VALUES('@${req.body.username.toLowerCase().trim()}', '${req.body.name.trim()}', '${req.body.email.trim()}', '${hashpass}')`, (err, que)=>{
                    if(!err){
                        console.log("Successfully insert a record.");
                        res.render('register', {error: 'Successfully to registered.'});
                    }else{
                        console.log(err.message);
                        console.log("failed to insert a record.");
                        res.render('register', {error: 'This username is already taken.'});
                    }
                }); 
        }catch (e) {
            console.log(e);
        }     
    }
});

function checkInputField(username, name, email, password, cpassword){
    if(username == "" || name == "" || email == "" || password == "" || cpassword == ""){
        return true;
    }
    return false;
}
module.exports = register;