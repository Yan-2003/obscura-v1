const express = require('express');
const client = require('../controllers/DB');
const gals = express.Router();

gals.get('/',(req , res) =>{
    client.query(`SELECT * FROM post_data WHERE post_username = '${req.user.username}' ORDER BY post_id DESC`, (err , que1) =>{
        if(!err){
            console.log("POST DATA: " + JSON.stringify(que1.rows));
            client.query(`SELECT * FROM user_data where username = '${req.user.username}' `, (err, que2)=>{
                if(!err){
                    client.query(`SELECT * FROM follow_follower WHERE user_follow = '${req.user.username}'`, (err, que3)=>{
                        if(!err){
                            client.query(`SELECT * FROM follow_follower WHERE user_follower = '${req.user.username}'`, (err, que4)=>{
                                if(!err){
                                    console.log("USER DATA: " + JSON.stringify(que2.rows));
                                        client.query(`SELECT * FROM  post_react` , (err , que5)=>{
                                                
                                                if(!err){
                                                    let post_contents = [];
                                    
                                                    que1.rows.forEach( (post)=> {
                                                        let my_post_count = 0;
                                                        let my_reaction_stats = 0;
                                
                                                        que5.rows.forEach( (reaction)=>{
                                                            if(reaction.post_react == post.post_id){
                                                                my_post_count++;
                                                            }
                                                            if(reaction.user_reactor == req.user.username && reaction.post_react == post.post_id){
                                                                my_reaction_stats = 1;
                                                            }
                                                        });
                                
                                                        post_contents.push(
                                                            {       
                                                                post_id : post.post_id,
                                                                post_title : post.post_title,
                                                                post_date : post.post_date,
                                                                post_username : post.post_username,
                                                                post_img_file_path : post.post_img_file_path,
                                                                post_reaction: my_post_count,
                                                                post_stats : my_reaction_stats
                                                            }
                                                        )
                                                    });
                                                    res.render('mygal', { 
                                                        username : req.user.username , 
                                                        user_post : post_contents, 
                                                        user_data : que2.rows, 
                                                        post_count : que1.rows.length, 
                                                        followers : que3.rows.length,
                                                        following : que4.rows.length
                                                    });

                                                }else{
                                                    console.log("System Error Request: " + err.message);
                                                }
                                        });

                                }else{
                                    console.log("System Error Request: " + err.message);
                                }
                            });
                        }else{
                            console.log("System Error Request: " + err.message);
                        }
                    });
                }else{
                    console.log("System Error Request: " + err.message);
                }
            });
        }else{
            console.log("System Error Request: " + err.message);
        }
    });
});




module.exports = gals;