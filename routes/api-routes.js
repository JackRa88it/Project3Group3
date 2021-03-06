var db = require("../models");
var passport = require("../config/passport");
var formidable = require('formidable');
const path = require('path')
var fs = require('fs')
var extract = require('extract-zip')
var rimraf = require('rimraf');
var moment = require("moment");


module.exports = function (app,io){
    io.on('connection',function(socket){
        //Occurs when a user connects to any chatroom
        console.log('a user connected to /');        
        socket.on('disconnect', function(){
          console.log('user disconnected from /');
        });
      })
      db.Game.findAll({})
        .then(function(games){
            //Create a chatroom for each game when the server first starts up
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
                                    fs.rename(oldpath, newpath, function (err) {
                                        if (err) console.log(err);
                                        
                                        //Create a directory if it doesn't already exist
                                        var dir = "./client/public/games/" + game.id
                                        if (!fs.existsSync(dir)){
                                            fs.mkdirSync(dir);
                                        }
                
                                        //Unzip the file to target directory
                                        var target = path.join(__dirname,'../client/public/games/' + game.id)
                                        extract(newpath,{dir:target},function(err){
                                            if(err) console.log(err);
                                            fs.unlink(newpath, (err) => {
                                                if (err) console.log(err);
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
        // db.User.findOne({
        //     where: {username: req.body.username}
        // }).then(function(user){
        //     if (user){
        //         console.log('------------------------------------')
        //         console.log(user)
        //         console.log('------------------------------------')
        //         res.status(400).send({error: "username already taken"})
        //     }
        //     if (!user){
                db.User.create({
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password,
                  }).then(function(user) {
                    var random = Math.floor(Math.random()*9) + 1
                    var userImage = path.join(__dirname, '../client/public/assets/userThumbnails/Default'+random+'.png')
                    var userImageCopy = path.join(__dirname, '../client/public/assets/userThumbnails/' + user.id)
                    fs.createReadStream(userImage).pipe(fs.createWriteStream(userImageCopy));
                    res.redirect(307, "/api/login");
        
                }).catch(function(err) {
                    console.log(err);
                    res.redirect(307, "/api/login");
                    // res.send(err);
                });

        //     }
        // })            
    });

    app.get("/api/validateUser/:name", function(req,res){
        db.User.findOne({
            where: {username: req.params.name}
        }).then(function(user){
            res.json(user)
        }).catch(function(err){
            res.json(err)
        })
    })
    
    app.get("/api/validateEmail/:email", function(req,res){
        db.User.findOne({
            where: {email: req.params.email}
        }).then(function(user){
            res.json(user)
        }).catch(function(err){
            res.json(err)
        })
    })

    
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

    app.get('/api/games/all', (req,res)=>{
        db.Game.findAll({
        })
        .then((games)=>{
            res.json(games)
        })
    });

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
                fs.unlink(path.join(__dirname,'../client/public/assets/gameThumbnails/' + req.params.id),(err)=>{
                    if(err){console.log(err)};
                    if(deletedGames >= 1){
                        res.status(200).json({message:"Deleted succesfully"})
                    }
                    else{
                        res.status(404).json({message:'record not found'})
                    }
                })
                
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
        //Grabs random games
        db.Game.findAll({
            order: [ [ db.sequelize.fn('RAND') ] ],
            limit: 8
        }).then((games) =>{
            res.json(games)
        })
    })


    app.post('/api/game/:id/vote', function(req,res){
        //Up or downvotes a game and also updates its rating
        if(req.user){
            db.Vote.upsert({
                upDown: req.body.vote,
                UserId: req.user.id,
                GameId: req.params.id
            }).then((post) => {
            db.Game.findOne({
                where:{
                    id: req.params.id
                },
                include: [db.Vote]
            }).then((game) => {
                var upVoteCount = 0
                var totalVotes = 0
                game.Votes.forEach((vote)=>{
                    totalVotes++
                    if(vote.upDown){
                        upVoteCount++
                    }
                })
                if(totalVotes == 0){
                    newRating = 0
                }
                else{
                    var newRating = upVoteCount/totalVotes
                }
                db.Game.update({
                    rating: newRating
                },
                {
                    where: {
                        id: req.params.id
                    }
                }).then(()=>{
                    res.status(200).send('success')
                }).catch((err) => {
                    console.log(err)
                    res.json(err)
                })
            }).catch((err) => {
                console.log(err)
                res.json(err)
            })
            })
        }
    })


    app.get('/api/game/:id', function(req,res){
        //Grab game data with :id and also calculates its score based on upvotes and downvotes
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
        //Intended to be a direct messaging system
        //Currently unused. 
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

    // get list of forums for Community main page
    // includes threads for displaying threadcount, most recent, etc.
    app.get('/api/forumList', function(req,res) {
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
        if(req.user){
            var form = new formidable.IncomingForm();
            form.maxFileSize = Math.pow(1024, 3);
            form.parse(req, function(err, fields, files) {
                db.User.update(
                    {
                        username: fields.Username,
                        bio: fields.Bio,
                        postBanner: fields.Banner
                    },
                    {where: {id: fields.userId}}
                ).then((user) => {
                    var oldPath = files.Avatar.path;
                    var newPath = path.join(__dirname, '../client/public/assets/userThumbnails/' + fields.userId )
                    if (files.Avatar.name) {
                        fs.rename(oldPath,newPath, function(err) {
                            if(err) throw err
                            res.send('200')
                        })
                    } else {
                        res.send('200')
                    }
                }).catch((err) => {
                    console.log(err);
                    res.json(err)
                })
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
    /*Creates a chatroom for a specific game. Run once for all games at startup and also run when a
    new game is uploaded */
    const gameRoom = io.of('/game/' + game.id);
    //chatLogs is an array containing the most recent 8 messages
    var chatLogs = []
    //When a new user connects
    gameRoom.on('connection', function (socket) {
        //Send them the chat logs
        socket.emit('currentLogs',chatLogs)
        console.log('a user connected to /game/' + game.id);
        //When the server receives a message update the chatlogs and send back the new message to all users
        socket.on('messagePost', function (msg, name, id) {
            var timestamp = moment().format('hh:mm:ssa')
            chatLogs.push({msg: msg, name: name, id: id, timestamp: timestamp})
            if(chatLogs.length>8){
                chatLogs.shift()
            }
            gameRoom.emit('messagePost', msg, name, id, timestamp);
        });
        gameRoom.on('disconnect', function () {
            console.log('user disconnected from /game/' + game.id);
        });
    });
}

