const express = require('express');
const bodyParser = require('body-parser');

const Blogs = require('../models/blogs');

const blogRouter = express.Router();

blogRouter.use(bodyParser.json());

////////////////////////////////////////////////////////
blogRouter.route('/')
.get((req,res,next) => {        //get all Blogs 
    Blogs.find({})
    .then((blogs) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(blogs);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post((req, res, next) => {     //post a new Blog
    Blogs.create(req.body)
    .then((blogs) => {
        console.log('Blog Created ', blogs);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(blogs);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /blogs');
})
.delete((req, res, next) => {       //Delete all Blog!!
    Blogs.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

////////////////////////////////////////////////////////
blogRouter.route('/:blogId')
.get((req,res,next) => {            //Get a blog by ID
    Blogs.findById(req.params.blogId)
    .then((blog) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(blog);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post((req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /blogs/'+ req.params.blogId);
})
.put((req, res, next) => {          //Update a blog by ID
    Blogs.findByIdAndUpdate(req.params.blogId, {
        $set: req.body
    }, { new: true })
    .then((blog) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(blog);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete((req, res, next) => {       //Delete a blog by id
    Blogs.findByIdAndRemove(req.params.blogId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

////////////////////////////////////////////////////////
blogRouter.route('/:blogId/comments')
.get((req,res,next) => {        //Get all comments for a blog
    Blogs.findById(req.params.blogId)
    .then((blog) => {
        if (blog != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(blog.comments);
        }
        else {
            err = new Error('blog ' + req.params.blogId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post((req, res, next) => {         //Post a comment on a blog
    Blogs.findById(req.params.blogId)
    .then((blog) => {
        if (blog != null) {
            blog.comments.push(req.body);
            blog.save()
            .then((blog) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(blog);                
            }, (err) => next(err));
        }
        else {
            err = new Error('blog ' + req.params.blogId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /Blogs/'
        + req.params.blogId + '/comments');
})
.delete((req, res, next) => {           //Delete all comments of a blog
    Blogs.findById(req.params.blogId)
    .then((blog) => {
        if (blog != null) {
            for (var i = (blog.comments.length -1); i >= 0; i--) {
                blog.comments.id(blog.comments[i]._id).remove();
            }
            blog.save()
            .then((blog) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(blog);                
            }, (err) => next(err));
        }
        else {
            err = new Error('blog ' + req.params.blogId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));    
});

////////////////////////////////////////////////////////
blogRouter.route('/:blogId/comments/:commentId')
.get((req,res,next) => {            //Get a particular comment of a blog
    Blogs.findById(req.params.blogId)
    .then((blog) => {
        if (blog != null && blog.comments.id(req.params.commentId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(blog.comments.id(req.params.commentId));
        }
        else if (blog == null) {
            err = new Error('blog ' + req.params.blogId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post((req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /blogs/'+ req.params.blogId
        + '/comments/' + req.params.commentId);
})
.put((req, res, next) => {          //Update a comment on a blog
    Blogs.findById(req.params.blogId)
    .then((blog) => {
        if (blog != null && blog.comments.id(req.params.commentId) != null) {
            if (req.body.rating) {
                blog.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if (req.body.comment) {
                blog.comments.id(req.params.commentId).comment = req.body.comment;                
            }
            blog.save()
            .then((blog) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(blog);                
            }, (err) => next(err));
        }
        else if (blog == null) {
            err = new Error('blog ' + req.params.blogId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete((req, res, next) => {          //Update a comment on a blog
    Blogs.findById(req.params.blogId)
    .then((blog) => {
        if (blog != null && blog.comments.id(req.params.commentId) != null) {
            blog.comments.id(req.params.commentId).remove();
            blog.save()
            .then((blog) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(blog);                
            }, (err) => next(err));
        }
        else if (blog == null) {
            err = new Error('blog ' + req.params.blogId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = blogRouter;