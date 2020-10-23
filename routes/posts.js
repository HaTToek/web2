var express     =   require('express')
var router      =   express.Router()
var Post        =   require('../models/Post')
var File = require('../models/File');
var multer = require('multer');
var storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './public/uploads/');
    },
    filename: (req, file, callback) => {
        callback(null, file.originalname);
    }
})
var upload = multer({ storage });

// index 
router.get('/', async function(req, res){
    let posts = await Post.find({})
        .populate('author')
        .sort('-createAt') //String or object 를 받아서 데이터 정렬방법을 정의 -를 붙히면 내림차순
        // .exec(function(err, posts){
        //     if(err) return res.json(err)
        // })
    
    return res.render('posts/index', { posts:posts })
})

// New
router.get('/new', function(req, res){
    return res.render('posts/new')
})

// create
router.post('/', upload.single('attachment'), async function(req, res){
    var attachment = req.file?await File.createNewInstance(req.file, req.user._id):undefined;
    req.body.attachment = attachment;
    req.body.author = req.user._id;
    Post.create(req.body, function(err, post){
        if(err) {
            return res.redirect('/posts/new')
        }
        if(attachment){
            attachment.postId = post._id;
            attachment.save();
        }
        res.redirect('/posts')
    })
})

// show
router.get('/:id', function(req, res){
    Post.findOne({_id:req.params.id})
        .populate( 'author' )   
        .populate( 'attachment' )
        .exec(function(err, post){      
            if(err) return res.json(err)
            res.render('posts/show', {post:post})
      })
  })
//edit
router.get('/:id/edit', function(req, res){
    Post.findOne({_id:req.params.id}, function(err, post){
        if(err) return res.json(err);
        res.render('posts/edit', {post:post});
    });
});
// update
router.put('/:id', function(req, res){
    Post.findOneAndUpdate({_id:req.params.id}, req.body, {runValidators:true},function(err, post){
    res.redirect("/posts/"+req.params.id)
    })
})

// destroy
router.delete('/:id', function(req, res){
    Post.deleteOne({_id:req.params.id}, function(err){
        if(err) return req.json(err)
        res.redirect('/posts')
    })
})


module.exports  =   router

function parseError(errors){
    var parsed = {};
    if(errors.name == 'ValidationError'){
      for(var name in errors.errors){
        var validationError = errors.errors[name];
        parsed[name] = { message:validationError.message };
      }
    }
    else if(errors.code == '11000' && errors.errmsg.indexOf('username') > 0) {
      parsed.username = { message:'This username already exists!' };
    }
    else {
      parsed.unhandled = JSON.stringify(errors);
    }
    return parsed;
  }