var express = require('express');
var router = express.Router();

//Models
var Post = require('../models/Post');

router.get('/new', ensureAuthenticated, function(req, res){
    res.render('newpost');
});

router.post('/new', function(req, res){
    var caption = req.body.caption;
    req.checkBody('caption', 'Caption is required').notEmpty();

    console.log(req.user.username +"");
    
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

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		req.flash('error_msg','You are not logged in');
		res.render('login');
	}
}

module.exports = router;