
var k = 0;
for (k=0; k<16; k++) {
  var canvas = document.getElementById(k);
  var ctx = canvas.getContext("2d");

  var i = 0;
  var j = 0;
  for (i = 0; i < canvas.width; i++) {
    for (j = 0; j < canvas.height; j++) {
      if ( (i + j) % 2 == 0) {
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fillRect(i*10,j*10,10,10);
      }
      else {
        ctx.fillStyle = "rgba(256,256,256,0.2)";
        ctx.fillRect(i*10,j*10,10,10);
      }
    }
  }
}
// Dibuja en un espacio del tablero
function drawBoard_card(id) {
  var canvas = getElementById(id);
  var ctx = canvas.getContext('2D');
}

