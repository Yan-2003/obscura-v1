const express = require('express');
const client = require('../controllers/DB');
const galleries = express.Router();


galleries.get('/',(req , res) =>{

        client.query("SELECT * FROM user_data ORDER BY RANDOM()", (err , que) =>{
            console.log("USER DATA: " + JSON.stringify(que.rows));
            if(!err){
                res.render('galleries', { username : req.user.username , user_data : que.rows});
            }else{
                console.log(err.message);
            }
        });

});

galleries.get('/:username?' , (req, res) =>{
    client.query(`SELECT * FROM post_data WHERE post_username = '${req.params.username}' ORDER BY post_id DESC`, (err , que1) =>{
        if(!err){
            console.log("POST DATA: " + JSON.stringify(que1.rows));
            client.query(`SELECT * FROM user_data where username = '${req.params.username}' `, (err, que2)=>{      
                if(!err){
                    client.query(`SELECT * FROM follow_follower WHERE user_follow = '${req.params.username}'`, (err, que3)=>{
                        if(!err){
                            client.query(`SELECT * FROM follow_follower WHERE user_follower = '${req.user.username}' AND user_follow = '${req.params.username}'`, (err, que4)=>{
                                    if(!err){
                                        client.query(`SELECT * FROM follow_follower WHERE user_follower = '${req.params.username}'`, (err, que5)=>{
                                            if(!err){
                                                console.log("USER DATA: " + JSON.stringify(que2.rows));

                                                client.query(`SELECT * FROM post_react`, (err , que6)=>{

                                                    if(!err){
                                                        let post_contents = [];
                                    
                                                        que1.rows.forEach( (post)=> {
                                                            let my_post_count = 0;
                                                            let my_reaction_stats = 0;
                                    
                                                            que6.rows.forEach( (reaction)=>{
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
                                                        if(que2.rows.length != 0){
                                                            res.render('usergal', 
                                                                { 
                                                                    username : req.user.username ,
                                                                    user_post : post_contents, 
                                                                    user_data : que2.rows, 
                                                                    post_count : que1.rows.length, 
                                                                    followed_stats : que4.rows.length ,
                                                                    following_stats : que5.rows.length,
                                                                    follower_stats: que3.rows.length
                                                                }
                                                            );
                                                        }else{
                                                            res.redirect('/galleries');
                                                        }
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
        }else{
            console.log("System Error Request: " + err.message);
        }
    });
});
    


// this is a post for the user follow or follower api
galleries.post('/:username?', (req, res) =>{

    if(req.body.follow == "true"){
        client.query(`INSERT INTO follow_follower VALUES('${req.user.username}', '${req.params.username}')`, (err, que)=>{
            if(!err){
                console.log("Successfully Followed.");
            }else{
                console.log("System Error: " + err.message);
            }
        });
    }

    if(req.body.follow == "false"){
        client.query(`DELETE FROM follow_follower WHERE user_follower = '${req.user.username}' AND user_follow = '${req.params.username}'`, (err, que)=>{
            if(!err){
                console.log("Successfully Unfollowed.");
            }else{
                console.log("System Error: " + err.message);
            }
        });
    }
    res.redirect(`/galleries/${req.params.username}`);
});

galleries.get('/search/user',(req , res) =>{

    console.log("Search body: " + req.query.input);

    client.query(`SELECT * FROM user_data WHERE username = '${req.query.input}' OR user_full_name = '${req.query.input}'`, (err, que)=>{
        if(!err){
            console.log("USER DATA: " + JSON.stringify(que.rows));
            res.render('galleries', { username : req.user.username , user_data : que.rows});
        }else{
            console.log("System Error: " + err.message);
        }
    })

});



module.exports = galleries;