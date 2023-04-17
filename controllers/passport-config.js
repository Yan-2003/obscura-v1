const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const client = require('./DB');

function initialize(passport){
    const authenticateUser = (username, password, done)=>{

        client.query(`SELECT * FROM user_data where username = '@${username.toLowerCase().trim()}'`, async (err, que) =>{
            if(err) throw err;
            console.log(que.rows);

            if(que.rows.length > 0){
                console.log("username match.");
                const user = que.rows[0];
                if(await bcrypt.compare(password, user.user_password)){
                    return done(null, user);
                }else{
                    return done(null, false, {message : "Invalid Password"});
                }
            }else{
                return done(null, false, {message : "Invalid Username"});
            }
        });
    }

    passport.use(new LocalStrategy({ usernameField: 'username', passwordField : 'password'}, authenticateUser));

    passport.serializeUser((user, done)=> done(null, user.user_id));
    passport.deserializeUser((id, done)=> {
        client.query(`SELECT * FROM user_data WHERE user_id = ${id}`, (err, result)=>{

            if(err) throw err;

            return done(null, result.rows[0]);

        });
    });
}


module.exports = initialize;
