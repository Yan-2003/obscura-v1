const express = require('express');
const client = require('../controllers/DB');
const dashboard = express.Router();


dashboard.get('/',(req , res) =>{
    client.query("SELECT * FROM post_data ORDER BY RANDOM()", (err , que) =>{
        console.log("POST DATA: " + JSON.stringify(que.rows));
        if(!err){
            client.query("SELECT * FROM post_react", (err , que1) =>{
                if(!err){
                    
                    let post_contents = [];
                    
                    que.rows.forEach( (post)=> {
                        let my_post_count = 0;
                        let my_reaction_stats = 0;

                        que1.rows.forEach( (reaction)=>{
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

                    res.render('dashboard', { username : req.user.username , user_post : post_contents});
                }else{
                    console.log(err.message);
                }
            });
        }else{
            console.log(err.message);
        }
    });
});

dashboard.post('/react', (req, res) =>{
    
    console.log("POST REACT: " + req.body.post_id);
        client.query(`INSERT INTO post_react VALUES('${req.user.username}' , ${req.body.post_id})`, (err, que)=>{
            if(!err){
                console.log("Successfully react to a post.");
            }else{
                console.log("System Error: " + err.message);
            }
        });
    res.redirect('/dashboard');
}); 

dashboard.post('/react/delete', (req, res) =>{
    
    console.log("POST REACT: " + req.body.post_id);
        client.query(`DELETE FROM post_react WHERE post_react=${req.body.post_id} AND user_reactor = '${req.user.username}'`, (err, que)=>{
            if(!err){
                console.log("Successfully unreact to a post.");
            }else{
                console.log("System Error: " + err.message);
            }
        });
    res.redirect('/dashboard');
}); 





module.exports = dashboard;