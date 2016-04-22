'use strict';
const controllers = require('../controllers'),
    models = require('../models');

var userController = controllers.userController,
    topicController= controllers.topicController,
    feedController = controllers.feedController,
    userSession = {}, roomIdent="";

var routeConfig = function(app, io){
    /**
     * Require always for authentication
     */
    app.use(function(req, res, next) {
        if (req.user) {
            userSession = req.session.passport;
            next();
        } else {
            req.session.error = 'Access denied!';
            res.render('login');
        }
    });
    app.get('/test/getMaxUps', function(req, res, next){
        var id = "5711c8e29d4f45e34c8a8156";
        topicController.getMaxUps(id, function(error, model){
            if (error) console.log("ERROR: " + error);
            console.log("MODEL: " + model);
            res.redirect('/');
        });
    });
    app.get('/', function(req, res, next) {
        res.render('index', { title: 'Express', profile: {}});
    });
    app.get('/create', function(req,res){

        // Generate unique id for the room
        var id = Math.round((Math.random() * 1000000));

        // Redirect to the random room
        res.cookie('topic-id', id, {path: '/room/'});
        res.redirect('/topic/'+id);
    });

    app.get('/topic/:id', function(req,res){
        console.log(req.session.passport);
        // Render the chant.html view
        res.render('controls/topic');
    });

    app.get('/mytopics', function(req, res, next){
        var topics = topicController.getUserTopics(userSession.user, function(error, model){
            console.log(model);
            res.render('controls/mytopics', {topics: model});
        });
    });
    app.get('/feeds/:roomId', function(req, res, next){
        var roomId = req.params.roomId;
        console.log("ROOM ID: " + roomId);
        topicController.getTopicByRoomId(roomId, function(error, model){
            if(!error){
                feedController.getFeedsByTopic(model, function(error, model){
                    res.render('controls/feeds', {feeds: model, roomId: roomId});
                    return;
                });
            }
        });
    });

    app.post('/topics/create', function(req, res, next){
        const name = req.body.topicName,
            pictureUrl = req.body.pictureUrl,
            siteUrl = req.body.siteUrl,
            topicDesc = req.body.topicDesc;
        console.log('Name: '+ name);
        console.log('Name: '+ pictureUrl);
        console.log('Name: '+ siteUrl);
        console.log('Name: '+ topicDesc);
        topicController.saveNewTopic(name,userSession.user,pictureUrl,siteUrl,topicDesc, function(error,model){
            if(error) console.log(error);
            res.redirect('http://localhost:3001/mytopics');
        })
    });
    app.post('/feeds/create/:roomId', function(req, res, next){
        const body = req.body.feedBody,
            roomId = req.params.roomId;
        roomIdent = roomId;
        feedController.saveNewFeedWithRoomId(roomId, userSession.user, body, function(error, model){
            res.cookie('room.id', roomId);
            res.render('controls/feeds', {});
        })
    });
    var socketConfig = io.on('connection', function (socket) {
        socket.userId = userSession.user;
        require('../socket.io')(io,socket);
    });
};

module.exports = routeConfig;
