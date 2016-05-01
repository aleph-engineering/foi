'use strict';

const models = require('../models'),
    userProfile = models.UserProfile,
    topicController = require('./topicController'),
    feed = models.Feed;

var feedController = {
    saveNewFeedWithTopicId(topicId, authorId, text, callback){
        if (typeof callback === "function") {
            var newFeed = new feed({
                topicId: topicId,
                authorId: authorId,
                body: text
            });
            newFeed.save(function(error, model){
                callback(error,model);
            })
        }
    },
    saveNewFeedWithRoomId(roomId, authorId, avatarUrl ,text, callback){
        if (typeof callback === "function") {
            topicController.getTopicByRoomId(roomId, function(error, model){
                if(!error){
                    var newFeed = new feed({
                        topicId: model._id,
                        authorId: authorId,
                        authorAvatar: avatarUrl,
                        body: text
                    });
                    newFeed.save(function(error, model){
                        callback(error,model);
                    })
                }
            })

        }
    },
    getFeedsByTopic(topicId, callback){
        if (typeof callback === "function") {
            feed.find({topicId: topicId}, function(error, models){
                callback(error, models);
            })
        }
    },
    setUp(feedId, userId, maxUps ,callback){
        if (typeof callback === "function") {
            feed.findById(feedId, function(error, model){
                if(!error){
                    if(maxUps > model.ups.length){
                        model.ups.push(userId);
                        model.save(callback(error, model));
                    }
                    else (callback(new Error("You can not give more 'Ups' to this feed."), null));
                }
                else callback(error, null);
            });
        }
    },
    setDown(feedId, userId, maxDowns, callback) {
        if (typeof callback === "function") {
            feed.findById(feedId, function(error, model){
                if(!error){
                    if(maxDowns > model.downs.length) {
                        model.downs.push(userId);
                        model.save(callback(error, model));
                    }
                    else (callback(new Error("You can not give more 'Downs' to this feed."), null));
                }
                else callback(error, null);
            });
        }
    },
    getUps(feedId, userId, callback){
        if (typeof callback === "function") {
            feed.find({_id: feedId, ups: userId}, function(error, model){
                callback(error, model.length);
            })
        }
    },
    getDowns(feedId, userId, callback){
        if (typeof callback === "function") {
            feed.find({_id: feedId, downs: userId}, function(error, model){
                callback(error, model.length);
            })
        }
    },
    getFeedsByRoomId(roomId, callback){
        if (typeof callback === "function") {
            topicController.getTopicByRoomId(roomId, function(error, model){
                if(!error){
                    feed.find({topicId: model._id}, function(error, models){
                        callback(error, models);
                    })
                }
            })
        }
    }

};

module.exports = feedController;
