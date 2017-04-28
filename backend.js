const express=require("express");
const app=express();
const http = require("http").Server(app);
const io = require("socket.io")(http);


app.use(express.static('public'));

app.get("/", function(req, res){
  res.send(res.sendFile(__dirname+"/public/index.html"))
})

var history = [];

function Drawevent(color, thickness, startpoint, movement){
  this.color = color;
  this.thickness = thickness;
  this.startpoint = startpoint;
  this.movement = movement;
}

var singledrawevent = [];
var cordhistory = [];

io.on('connection', function(socket) {
  socket.on("join", function(screenName){
    socket.screenName = screenName;
    io.emit("join", [history, screenName]);
  })
  socket.on("choice", function(array){
    socket.broadcast.emit("choice", array);
  })
  socket.on("start-draw", function(array){
    singledrawevent.push(array[2]);
    singledrawevent.push(array[3]);
    socket.broadcast.emit("start-draw", array)
    singledrawevent.push([array[0][0], array[0][1]]);
  })
  socket.on("draw", function(array){
    socket.broadcast.emit("draw", array)
    cordhistory.push([array[0][0], array[0][1]]);
  })
  socket.on("end-draw", function(array){
    socket.broadcast.emit("end-draw", array)
    singledrawevent.push(cordhistory);
    var drawevent = new Drawevent(singledrawevent[0], singledrawevent[1], singledrawevent[2], singledrawevent[3]);
    history.push(drawevent);
    singledrawevent = [];
    cordhistory = [];
  })
  socket.on("message", function(msg){
    io.emit("message", socket.screenName+": "+msg)
  })
  socket.on("disconnect", function(){
    io.emit("leave", socket.screenName)
  })
})



http.listen(3005, function(){
  console.log("listening on 3005...")
})
