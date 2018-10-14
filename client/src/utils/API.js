import axios from "axios";

export default {
  login: function(userInfo) {
    return axios.post("/api/login", userInfo);
  },
  signup: function(userInfo) {
    return axios.post("/api/signup",userInfo);
  },
  joinChat: function(){
    return axios.get("/api/messages")
  },
  authenticate: function(){
    return axios.get('/api/authenticate')
  },
  deleteGame: function(gameId){
    return axios.post('/api/delete/game/'+gameId)
  },
  getUser: function(userId){
    return axios.get('/api/getUser/'+userId )
  },
  getUserGames: function(userId){
    return axios.get('/api/games/user/'+userId)
  },
  logout: function(){
    return axios.get('/api/logout')
  },
  chatRoom: function(){
    return axios.get('/api/chatRoom')
  },
  postGameComment: function(gameId,text){
    return axios.post('/api/game/' + gameId + '/post/',{text: text})
  },
  getGameComments: function(gameId){
    return axios.get('/api/game/'+ gameId+'/post/' )
  },
  getGameData: function(gameId){
    return axios.get('/api/game/' + gameId)
  },
  favoriteGame: function(gameId){
    return axios.get('/api/game/'+gameId+'/addFavorite')
  },
  postVote: function(postId, bool){
    return axios.post('/api/post/'+postId+'/vote/', {vote: bool})
  },
  getVote: function(postId){
    return axios.get('/api/post/'+postId+'/vote/')
  },
  postGameVote: function(gameId, bool){
    return axios.post('/api/game/'+gameId+'/vote/',{vote: bool})
  },
  getForumList: function() {
    return axios.get("/api/forumList")
  },
  getThreadList: function(forumId) {
    return axios.get("/api/threadList/" + forumId)
  },
  getPostList: function(threadId) {
    return axios.get("/api/postList/" + threadId)
  },
  newForumPost: function(newPost) {
    return axios.post('/api/community/newForumPost/', {newPost: newPost})
  },
  editForumPost: function(editedPost) {
    return axios.put('/api/community/editForumPost/', {editedPost: editedPost})
  },
  editUser: function(editedUser) {
    return axios.put('/api/editProfile/', {editedUser: editedUser})
  },
  newForumThread: function(newThread) {
    return axios.post('/api/community/newForumThread/', {newThread: newThread})
  },
  getBest: function(){
    return axios.get('/api/games/best')
  },
  getNewest: function(){
    return axios.get('/api/games/newest')
  },
  getTagsandGames: function(){
    return axios.get('/api/tags/games/all')
  },
  getRandom: function(){
    return axios.get('/api/games/random')
  },
  getFavorites: function(){
    return axios.get('/api/user/favorites')
  },
  getUserPosts: function(){
    return axios.get('api/YourPosts')
  },
  isThisGameFavorited: function(gameId){
    return axios.get('/api/game/'+gameId+'/favorites')
  }
};
