var db = require("../models");
var passport = require("../config/passport");
var formidable = require('formidable');
const path = require('path')
var fs = require('fs')
var extract = require('extract-zip')
var rimraf = require('rimraf');


module.exports = function (app,io){
    io.on('connection',function(socket){
        console.log('a user connected to /');        
        socket.on('disconnect', function(){
          console.log('user disconnected from /');
        });
      })
      db.Game.findAll({})
        .then(function(games){
            for (let i=0;i<games.length;i++){
                newGame(games[i],io);
            }  
        })
    


    app.post('/upload',function(req,res){
        if(req.user){
            //Initialize an empty form
            var form = new formidable.IncomingForm()
            form.maxFileSize = Math.pow(1024,3)
            form.parse(req,function(err,fields,files){
                //fields are any values that are not files that were sent with the form whose keys are the name of the input
                db.Game.create({
                    name: fields.name,
                    description: fields.description,
                    UserId: req.user.id,
                }).then(function(game) {
                    const tags = JSON.parse(fields.tags)
                    //For each tag find the tag ID
                    tags.forEach(function(tag){
                        db.Tag.findOne({
                            where:{
                                name: tag.text}
                            }
                        ).then(function(found){
                            //With a tag ID associate the two inside the join table
                            game.addTag(found.id)
                            .then(function(){
                                if(err) console.log(err);
                                //Grab the path of the file that was just uploaded "filetoupload" is the name of the input on the frontend
                                var oldpath = files.filetoupload.path;
                                var thumbnailPath = files.thumbnail.path;
                                //Create a newpath to store the file at
                                var newpath = path.join(__dirname, "../" + files.filetoupload.name)
                                var newThumbnailPath = path.join(__dirname, '../client/public/assets/gameThumbnails/' + game.id )
                                fs.rename(thumbnailPath,newThumbnailPath, function(err) {
                                    //Rename thumbnail
                                    // if(err) throw err;
                                    fs.rename(oldpath, newpath, function (err) {
                                        console.log('renaming filepaths')
                                        if (err) console.log(err);
                                        
                                        //Create a directory if it doesn't already exist
                                        var dir = "./client/public/games/" + game.id
                                        if (!fs.existsSync(dir)){
                                            console.log('path does not exist \n creating newpath')
                                            fs.mkdirSync(dir);
                                        }
                
                                        //Unzip the file to target directory
                                        var target = path.join(__dirname,'../client/public/games/' + game.id)
                                        extract(newpath,{dir:target},function(err){
                                            console.log('extracting to ', target)
                                            if(err) console.log(err);
                                            fs.unlink(newpath, (err) => {
                                                if (err) console.log(err);
                                                console.log('deleting' + newpath );
                                                //Redirect the user in the frontend to their game
                                                newGame(game, io);
                                                if(res.headersSent){
                                                    console.log('headers already sent')
                                                }
                                                else{
                                                    return res.send('/all/games/'+game.id);  
                                                }
                                            });
                                        })
                                    });
                                }) 
                            })
                        })
                    })  
                })
            })
        }  
    })

    app.get('/api/authenticate',function(req,res){
        if(req.user){
            console.log("user authenticated")
            res.send(req.user);

        }
        else{
            console.log('user not authenticated')
            res.status(403).send('access denied')
        }
    })

    app.get('/api/getUser/:id', function(req,res){
        let userId= req.params.id
        db.User.findOne({
            where: {id: userId}
        })
        .then(user => {
            console.log(user.dataValues)
            res.send(user.dataValues);
        })
    })

    app.post("/api/login",passport.authenticate("local"),  function(req, res) {
        res.send('/');
    });

    app.get("/api/logout", function(req, res) {
        req.logout();
        res.send('/')
    });

    app.post('/api/upload/userimage',function(req,res){
        if(req.user){
            var form = new formidable.IncomingForm()
            form.parse(req,function(err,fields,files){
                if(err) throw err;
                var oldPath = files.profilephoto.path;
                var newPath = path.join(__dirname, '../client/public/assets/userThumbnails/' + req.user.id )
                fs.rename(oldPath,newPath, function(err) {
                    if(err) throw err
                })
            })
        }
    })

    app.post("/api/signup", function(req, res) {
        db.User.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            bio: req.body.bio,
            postBanner: req.body.postBanner
          }).then(function(user) {
            var random = Math.floor(Math.random()*9) + 1
            var userImage = path.join(__dirname, '../client/public/assets/userThumbnails/Default'+random+'.png')
            var userImageCopy = path.join(__dirname, '../client/public/assets/userThumbnails/' + user.id)
            fs.createReadStream(userImage).pipe(fs.createWriteStream(userImageCopy));
            res.redirect(307, "/api/login");
        }).catch(function(err) {
            console.log(err);
            res.send(err);
        });
    });

    app.get('/api/tags/games/all', (req,res)=>{
        db.Tag.findAll({
            include:[{
                model:db.Game,
            }]
        }).then((tags)=>{
            res.json(tags)
        }).catch(function(err){
            console.log(err);
            res.json(err)
        })
    })

    app.get('/api/user/favorites', (req,res)=>{
        if(req.user){
            db.User.findOne({
                where: {id: req.user.id},
            }).then((user)=>{
                user.getFavorites()
                .then(function(fav){
                    res.json(fav)
                })
                // res.json(user)
            }).catch(function(err){
                console.log(err);
                res.json(err)
            })
        }
    })

    app.get('/api/game/:id/favorites', (req,res)=>{
        db.Game.findOne({
            where: {id: req.params.id},
        }).then((game)=>{
            game.getFavorites()
            .then(function(fav){
                res.json(fav)
            })
        }).catch(function(err){
            console.log(err);
            res.json(err)
        })
    })

    app.post('/api/delete/game/:id', function(req,res){
        db.Game.destroy({
            where: {id: req.params.id}
        }).then((deletedGames) => {
            rimraf(path.join(__dirname,'../client/public/games/' + req.params.id),()=>{
                fs.unlinkSync(path.join(__dirname,'../client/public/assets/gameThumbnails/' + req.params.id))
                if(deletedGames >= 1){
                    res.status(200).json({message:"Deleted succesfully"})
                }
                else{
                    res.status(404).json({message:'record not found'})
                }
            })
        })
    })

    app.get('/api/games/newest', function(req,res){
        db.Game.findAll({
            limit: 8,
            order:[
                ['createdAt','DESC']
            ],
            include:[db.Vote,db.Tag]
        }).then((games) => {
            res.json(games)
        }).catch(function(err){
            console.log(err);
            res.json(err)
        })
    })

    app.get('/api/games/best', function(req,res){
        db.Game.findAll({
            limit: 4,
            order:[
                ['rating','DESC']
            ],
            include:[db.Vote,db.Tag, db.User]
        }).then((games) => {
            res.json(games)
        }).catch(function(err){
            console.log(err);
            res.json(err)
        })
    })

    app.post('/api/game/:id/post/', function(req,res){
        //Create a comment and associate it with gameId :id
        if(req.user){
            db.Post.create({
                text: req.body.text,
                UserId: req.user.id,
                GameId: req.params.id,
            }).then((post) => {
                console.log(post)
                res.send('200')
            }).catch(function(err){
                console.log(err);
                res.json(err)
            })
        }
    })

    app.get('/api/post/:id/vote/',function(req,res){
        //This route returns the number of upvotes and downvotes on a post
        db.sequelize.query("SELECT upDown,count(upDown) as counts FROM votes WHERE PostId = "+req.params.id+" group by upDown", { type: db.sequelize.QueryTypes.SELECT
        }).then((voteCounts) => {
            //Data comes back as [{upDown: 0, counts: n} {upDown: 1, counts: 1}]
            voteCounts = {votes: voteCounts}
            if(req.user){
                //If the user is logged in find if they have previously voted on this comment or not
                db.Vote.findOne({
                    where:{
                        UserId: req.user.id,
                        PostId: req.params.id
                    },
                }).then((found) => {
                    if(found){
                        if(found.upDown){
                            voteCounts.upVoted = true
                        }
                        else{
                            voteCounts.downVoted = true
                        }
                    }
                    res.json(voteCounts)
                }).catch((err) => {
                    res.json(err)
                    console.log(err)
                })      
            }
            else{
                res.json(voteCounts)
            }
        }).catch((err) => {
            res.json(err)
            console.log(err)
        })
    })

    app.post('/api/post/:id/vote/',function(req,res){
        //Post a vote to the database
        if(req.user){
            db.Vote.upsert({
                upDown: req.body.vote,
                UserId: req.user.id,
                PostId: req.params.id
            }).then((post) => {
                res.send('200')
            }).catch((err) => {
                console.log(err);
                res.json(err)
            })
        }
    })

    app.get('/api/games/user/:id', function(req,res){
        //Grabs all games made by a certain user
        db.Game.findAll({
            where: {
                UserId: req.params.id
            }
        }).then((games) => {
            res.json(games)
        })
    })

    app.get('/api/games/random', function(req,res){
        db.Game.findAll({
            order: [ [ db.sequelize.fn('RAND') ] ],
            limit: 8
        }).then((games) =>{
            res.json(games)
        })
    })


    app.post('/api/game/:id/vote', function(req,res){
        if(req.user){
            db.Vote.upsert({
                upDown: req.body.vote,
                UserId: req.user.id,
                GameId: req.params.id
            }).then((post) => {
                res.status(200).send('success')
            }).catch((err) => {
                console.log(err)
                res.json(err)
            })
        }
    })


    app.get('/api/game/:id', function(req,res){
        //Grab game data with :id
        db.Game.findOne({
            where:{
                id: req.params.id
            },
            include: [{model: db.Post,
                include: db.User},
                db.User,db.Vote],
        }).then((game) => {
            game.dataValues.score = 0
            game.dataValues.upVoted = false
            game.dataValues.downVoted = false
            game.dataValues.Votes.forEach((vote) => {
                if(vote.dataValues.upDown){
                    game.dataValues.score++
                    if(req.user && req.user.id==vote.dataValues.UserId){
                        game.dataValues.upVoted = true
                    }
                }
                else{
                    game.dataValues.score--
                    if(req.user && req.user.id==vote.dataValues.UserId){
                        game.dataValues.downVoted = true
                    }
                }
            })
            res.json(game)
        }).catch(function(err) {
            console.log(err);
            res.json(err);
        });
    })

    app.get('/api/game/:id/addFavorite', function(req,res){
        db.User.findOne({
            where: {id: req.user.id},
        }).then(function(user){
            user.addFavorite(req.params.id)
            res.json(user)
        })
    })


    app.get('/api/game/:id/post/', function(req,res){
        // Grab all posts from game :id
        db.Post.findAll({
            where:{
                GameId: req.params.id
            },
            order:[
                ['createdAt','DESC']
            ],
            include: [db.User, db.Vote],
        }).then((posts) => {
            posts.forEach((post) => {
                post.dataValues.score = 0
                post.dataValues.upVoted = false
                post.dataValues.downVoted = false
                post.dataValues.Votes.forEach((vote) => {
                    if(vote.upDown){
                        post.dataValues.score++
                        if(req.user && req.user.id==vote.UserId){
                            post.dataValues.upVoted = true
                        }
                    }
                    else{
                        post.dataValues.score--
                        if(req.user && req.user.id==vote.UserId){
                            post.dataValues.downVoted = true
                        }
                    }
                })
            })
            res.json(posts)
        }).catch(function(err) {
            console.log(err);
            res.json(err);
        });
        
    })



    app.get('/api/messages/', function(req,res){
        //Create a channel
        const chatRoom = io.of('/'+req.user.id)
        chatRoom.on('connection',function(socket){
            console.log('a user connected to channel ', req.user.id);
            socket.on('newMessage', function(msg){
                chatRoom.emit('messageBroadcast', msg);
            });
            socket.on('disconnect', function(){
                console.log('user disconnected from ', req.user.id);
            });
        })
        res.send(Object.keys(io.nsps))
    })

    app.get('/api/forumList', function(req,res) {
        // get list of forums for community main page
        db.Forum.findAll({
            include: [{
                model: db.Thread
            }],
            order: [db.sequelize.col('id')]
        })
        .then(data => {
            res.json(data)
        }).catch(err => {
            console.log(err);
            res.json(err);
        });
    })

    app.get('/api/threadList/:id', function(req,res) {
        //get list of threads to populate forum page
        var forumId = req.params.id;
        db.Thread.findAll({
            where: {ForumId: forumId},
            include: [
                {model: db.User}, 
                {model: db.Post, include: [{model: db.User}]}],
            order: [db.sequelize.col('id')]
        })
        .then(data => {
            res.json(data)
        }).catch(err => {
            console.log(err);
            res.json(err);
        });
    })

    app.get('/api/postList/:id', function(req,res) {
        //get list of posts to populate thread page
        var threadId = req.params.id;
        db.Post.findAll({
            where: {ThreadId: threadId},
            include: [{
                model: db.User
            }],
            order: [db.sequelize.col('id')]
        })
        .then(data => {
            res.json(data)
        }).catch(err => {
            console.log(err);
            res.json(err);
        });
    })

    app.post('/api/community/newForumPost', function(req,res){
        //create new forum post in the database
        if(req.user){
            db.Post.create({
                text: req.body.newPost.text,
                UserId: req.body.newPost.userId,
                ThreadId: req.body.newPost.threadId
            }).then((post) => {
                res.send('200')
            }).catch((err) => {
                console.log(err);
                res.json(err)
            })
        }
    })

    app.put('/api/community/editForumPost', function(req,res){
        //update forum post in the database
        if(req.user){
            db.Post.update(
                {text: req.body.editedPost.text},
                {where: {id: req.body.editedPost.id}}
            ).then((post) => {
                res.send('200')
            }).catch((err) => {
                console.log(err);
                res.json(err)
            })
        }
    })

    
    app.post('/api/community/newForumThread', function(req,res){
        //create new forum thread in the database
        if(req.user){
            db.Thread.create({
                title: req.body.newThread.title,
                UserId: req.body.newThread.userId,
                ForumId: req.body.newThread.forumId
            }).then((thread) => {
                res.send(thread)
            }).catch((err) => {
                console.log(err);
                res.json(err)
            })
        }
    })
    app.put('/api/editProfile', function(req,res){
        // console.log(req.body.editedUser)
        if(req.user){
            // console.log(req.body.editedUser.id)
            // console.log(req.body.editedUser.Username)
            // console.log(req.body.editedUser.Bio)
            // console.log(req.body.editedUser.Banner)
            db.User.update(
                {
                    username: req.body.editedUser.Username,
                    bio: req.body.editedUser.Bio,
                    postBanner: req.body.editedUser.Banner
                },
                {where: {id: req.body.editedUser.id}}
            ).then((user) => {
                res.send('200')
            }).catch((err) => {
                console.log(err);
                res.json(err)
            })
        }
    })
    app.get('/api/YourPosts', function(req,res){
        // Grab all posts by userID
        var userID = req.user.id;
        db.Post.findAll({
            where:{
                UserId: userID
            },
            order:[
                ['createdAt','DESC']
            ],
        }).then((posts) => {
            res.json(posts)
        }).catch(function(err) {
            console.log(err);
            res.json(err);
        });
        
    })

}


function newGame(game,io) {
    const gameRoom = io.of('/game/' + game.id);
    gameRoom.on('connection', function (socket) {
        console.log('a user connected to /game/' + game.id);
        socket.on('messagePost', function (msg, name, id) {
            console.log("something sent");
            gameRoom.emit('messagePost', msg, name, id);
        });
        gameRoom.on('disconnect', function () {
            console.log('user disconnected from /game/' + game.id);
        });
    });
}

