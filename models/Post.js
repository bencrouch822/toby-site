var mongoose = require('mongoose');

var PostSchema = mongoose.Schema({
    author : {
        type: String
    },
    caption : {
        type: String
    },
    image : {
        type: String
    },
    likes : {
        type: Array
    },
    comments : {
        type: Array
    },
    created_at : {
        type: Date
    }
});

var Post = module.exports = mongoose.model('Post', PostSchema);

module.exports.createPost = function(newPost, callback){
    newPost.save(callback);
};

module.exports.findPostbyId = function(id, callback){
    var query = {_id: id};
    Post.findOne(query, callback);
};