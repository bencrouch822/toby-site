var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var dbUrl = "mongodb://localhost:27017/toby";
var ObjectID = require('mongodb').ObjectID;   

//Models
var Post = require('../models/Post');

router.get('/new', ensureAuthenticated, function(req, res){
    res.render('newpost');
});

router.post('/new', function(req, res){
    var caption = req.body.caption;
    req.checkBody('caption', 'Caption is required').notEmpty();
    
    if(!req.files.image){
        console.log("Err: No files attached at upload [posts.js /new]");
        res.render('newpost', {errors: [{msg: "Image is required"}]});
    } else {
        var image = req.files.image;
        var date = new Date();
        var newName = (date.getTime()/1000) + '_' + image.name;
        image.mv(`./public/posts/${newName}`, function(err){
            if(err){
                console.log(err);
                return res.render('newpost', {errors: [{msg: "Something went wrong uploading your image. Try again"}]});
            }
            
            var newPost = new Post({
                author: req.user.username,
                caption: caption,
                image: newName,
                likes: [],
                comments: [],
                created_at: date.getDate()
            });

            Post.createPost(newPost, function(err, post){
                if(err) throw err;
                console.log(post);
            });

            res.redirect('/');
        });
    }
});

router.get('/post/:pid', function(req, res){
    var postID = req.params.pid;

    Post.findPostbyId(postID, function(err, post) {
        res.render('postview', {post: post});
    });

});

router.post('/post/addLike/:pid/:user', ensureAuthenticated, function(req, res){
    var postID = req.params.pid;
    var user = req.params.user;

    Post.findPostbyId(postID, function(err, post) {
        post.likes.push({'user': user});
        Post.update({'_id': post._id}, post, function(err, post){
            res.redirect('/');
        });
    });
});




function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		req.flash('error_msg','You are not logged in');
		res.render('login');
	}
}

module.exports = router;