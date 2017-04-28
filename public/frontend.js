$(document).ready(function(){
  var socket = io();
  var screenName = prompt("what's your name");
  socket.emit("join", screenName);
  var canvas = document.getElementById("thecanvas");
  var ctx = canvas.getContext("2d");
  var offsetLeft= canvas.offsetLeft;
  var offsetTop = canvas.offsetTop;

  var mousepos;
  var drawing;
  var choice_submitted;
  var color = "black";
  var thickness = 5;

  $("#custom").spectrum({
      color: "#000"
  });

  $("#thecanvas").on("mousedown", function(event){
    var mousepos = [event.clientX-offsetLeft, event.clientY-offsetTop-15];
    // if(choice_submitted){
      drawing = true;
      socket.emit("start-draw", [mousepos,drawing,color, thickness]);

      ctx.strokeStyle = color;
      ctx.lineJoin = "round";
      ctx.lineWidth = thickness;

      ctx.beginPath();
      ctx.moveTo(mousepos[0], mousepos[1]);
    // }
  })

  $("#thecanvas").on("mousemove", function(event){
    mousepos = [event.clientX-offsetLeft, event.clientY-offsetTop-15];
    if (drawing) {
      socket.emit("draw", [mousepos,drawing]);
      ctx.lineTo(mousepos[0], mousepos[1]);
      ctx.stroke();
    }
  })

  $("#thecanvas").on("mouseup", function(event){
      socket.emit("end-draw", drawing)
      drawing = false;
      ctx.closePath()
  })

  $("#choice").change(function(){
    color = $("#custom").spectrum('get').toHexString();
    thickness = $('#thickness').val();
    socket.emit("choice", [color, thickness]);
    choice_submitted = true;
    return false;
  })

  $("#chat").submit(function(){
    var msg = $('#message_input').val();
    socket.emit("message", msg);
    $('#message_input').val("");
    return false;
  })

  socket.on("join", function(array){
    var history = array[0];
    var msg = array[1];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    history.forEach(function(drawevent){
      ctx.strokeStyle = drawevent.color;
      ctx.lineJoin = "round";
      ctx.lineWidth = drawevent.thickness;

      ctx.beginPath();
      ctx.moveTo(drawevent.startpoint[0], drawevent.startpoint[1]);

      drawevent.movement.forEach(function(cord){
        ctx.lineTo(cord[0], cord[1]);
        ctx.stroke();
      })
      ctx.closePath();
    })
    $('#message').append($('<li></li>').text(msg + ' has connected!'))
  })

  socket.on("message", function(msg){
    $('#message').append($('<li></li>').text(msg))
  })

  socket.on("choice", function(array){
    color = array[0];
    thickness = array[1];
  })

  socket.on("start-draw", function(array){
    ctx.strokeStyle = color;
    ctx.lineJoin = "round";
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.moveTo(array[0][0], array[0][1])
  })
  socket.on("draw", function(array){
    if(array[1]){
      ctx.lineTo(array[0][0], array[0][1])
      ctx.stroke();
    }
  })
  socket.on("end-draw", function(drawing){
    ctx.closePath();
  })
  socket.on("leave", function(name){
    $('#message').append($('<li></li>').text(name + ' has disconnected!'))
  })
})
