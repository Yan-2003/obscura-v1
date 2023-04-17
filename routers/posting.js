const express = require('express');
const client = require('../controllers/DB');
const posting = express.Router();
const path = require('path');
const multer = require('multer');
const bodyPareser = require('body-parser');
posting.use(bodyPareser.json());
posting.use(bodyPareser.urlencoded({extended : false}));


const storage = multer.diskStorage({
    destination : (req , file, callback) =>{
        callback(null, 'public/DataBase/images');
    },

    filename : (req , file , callback) =>{
        console.log(file);
        callback(null, Date.now() + path.extname(file.originalname));
    }
    
});

const upload = multer({
    storage : storage,

    fileFilter: (req, file, callback)=>{
        if(file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg"){
            callback(null , true);
        }else{
            callback(null , false);
            return (req, res) =>{
                res.render('post', {error : 'Only .png, .jpg and .jpeg format allowed!', title : req.body.title, username : req.user.username});
            };
        }
    }
});


posting.get('/', (req , res)=>{
    res.render('post', { username : req.user.username } );
});


posting.post('/',
    upload.single('photo'),
    
    (req, res, next)=>{
    
        if(req.body.title == "" || req.file == null){
            res.render('post', {error: checkPostInput(req.body.title, req.file), title : req.body.title, username : req.user.username});
        }else{
            console.log(JSON.stringify(req.body));

            console.log("Image file path: " + JSON.stringify(req.file.path)); 
            console.log("user id: " + req.user.username); 
            console.log("body: " + JSON.stringify(req.body));
            return next();
        }

             
    },
    (req, res)=>{

        const post_query = ({
            post_title : req.body.title,
            post_date : getCurrentDate(),
            post_username : req.user.username,
            post_img_file_path : newPath(req.file.path)
        });


        client.query(
            `INSERT INTO post_data(post_date, post_username, post_title, post_img_file_path) 
                VALUES(
                    '${post_query.post_date}', 
                    '${post_query.post_username}',
                    '${post_query.post_title}',
                    '${post_query.post_img_file_path}'
                )
            `,
            (err , que)=>{
                if(!err){
                    console.log("POSTING DETAILS: successfully post to database."); 
                }else{
                    console.log("System Error: " + err.message);
                }
            }
        ); 

        res.redirect('/dashboard');
    });



function checkPostInput(input1, input2){
    if(input1 == ""){
        return "Enter your tilte.";
    }else if(input2 == null){
        return "No image selected or the file is not a image('Only .png, .jpg and .jpeg format allowed!').";
    }
}

function getCurrentDate(){
    let date = new Date();

    let month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return month[date.getMonth()] + " " + date.getDate()+ " " + date.getFullYear();
}


function newPath(file_path){
    const sliptpath = file_path.split("\\");
    return sliptpath[1]+"/"+sliptpath[2]+"/"+sliptpath[3];
}


module.exports = posting;