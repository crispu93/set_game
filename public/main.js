/****************************************************************/
/****************************************************************/
/****************************************************************/

const STACK_SIZE = 81;
const BOARD_SIZE = 15;
const NORMAL_SIZE = 12;
const DECK_POS = 15;

//Atributos de las cartas
const NUMBER = 0;
const SYMBOL = 1;
const SHADING = 2;
const COLOR = 3;

var vNUMBER = [1,2,3];
var vSYMBOL = ['ROMB','RECT','OVAL'];
var vSHADING = ['SOLID','STRIPED','OPEN'];
var vCOLOR = ['red','green','purple'];


// Clase principal del juego
function playerGame() {
	this.stack = new Array(STACK_SIZE);
	this.board = new Array(BOARD_SIZE);
	this.boardSize = NORMAL_SIZE;
	this.selected = [];
	this.players = [];
	this.active = false;
	this.id = "";
	this.state = "initing";
	this.actual = "";
}


function Card(attrs) {
	this.attrs = attrs;
	this.used = false;
	this.selected = false;
}

/*
function drawEmptySpace(id) {
	var canvas = document.getElementById(id);
	var ctx = canvas.getContext("2d");

	for (i = 0; i < canvas.width; i++) {
		for (j = 0; j < canvas.height; j++) {
			if ( (i + j) % 2 === 0) {
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
*/
function drawBackCard(id) {
	var canvas = document.getElementById(id);
	var ctx = canvas.getContext("2d");

	for (i = 0; i < canvas.width; i++) {
		for (j = 0; j < canvas.height; j++) {
			if ( (i + j) % 2 === 0) {
				ctx.fillStyle = "rgba(0,0,0,1)";
				ctx.fillRect(i*10,j*10,10,10);
			}
			else {
				ctx.fillStyle = "rgba(30,144,255,1)";
				ctx.fillRect(i*10,j*10,10,10);
			}
		}
	}
}

function imageBackCard(id) {
	var canvas = document.getElementById(id);
	var ctx = canvas.getContext("2d");
	var imageObj = new Image();

	imageObj.onload = function() {
		ctx.drawImage(imageObj, 0, 0, .9*canvas.width, .9*canvas.height);//, ctx.height, ctx.width);
	};
	imageObj.src = "campusviviente.png";
}


function drawEmptyCard(id) {
	var canvas = document.getElementById(id);
	var ctx = canvas.getContext("2d");

	//document.getElementById(id).background = "#FFFFFF";
	ctx.fillStyle = '#FFFFFF';
	ctx.clearRect(15,15,100,150);

}

function hideNoSelected() {
	for (var i = 0; i < BOARD_SIZE; i++) {
		var aux = false;
		for (var j = 0; j < player.selected.length; j++) {
			if ( player.selected[j] == i ) {
				aux = true;
				break;
			}
		}

		if ( aux === false ) {
			var canvas = document.getElementById(i);
			var context = canvas.getContext('2d');
			context.fillStyle = 'rgba(0, 0, 0, 0.85)';   /// black with high transparency
			context.fillRect(0, 0, context.canvas.width, context.canvas.height);
		}
		
	}
}

function clearBoard() {
	for (var i = 0; i < BOARD_SIZE; i++) {
		var canvas = document.getElementById(i);
		var context = canvas.getContext('2d');
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	}
}

/****************************************************************/
/****************************************************************/
/****************************************************************/

var player = new playerGame();
printStackLength();
drawButtons();

//var socket = io.connect('http://192.168.1.106:8080');
var ip = location.host;
var ipA = ip.split(":",2);
var server = ipA[0];
var port = ipA[1];
var socket = io.connect('http://' + server + ':' + port, { 'forceNew': true });

// sign in
function signIn(){
	
	var user = document.getElementById("user").value;
	socket.emit('signIn',user);
	player.id = user;
}

socket.on('signIn',function() {
	alert("Ese nombre de usuario ya está en uso. Elige otro.");
});

socket.on('signInResponse',function(game, user) {
	if (user === player.id) {
		signDiv.style.display = 'none';
		board.style.display = 'inline-block';
		messages.style.display = 'inline-block';
		printMessage( 'Esperando a los demás jugadores para iniciar el juego');
	}
	player.players = game.players;
	player.board = game.board;
	printPlayers();
});


socket.on('initGame', function(game) {
	player.stack = game.stack;
	player.board = game.board;
	player.players = game.players;
	printPlayers();
	printBoard();
	printStackLength();
	player.state = "searching";
	player.actual = "";
	printMessage('¡El juego ha comenzado! Busca un conjunto');
});

socket.on('set', function(data) {
	player.actual = data.user;
	player.state = data.state;
	printMessage( "<strong style = 'color: red';>" + data.user + '</strong>  dice que encontró un conjunto' );
	/*var div = $("#button1");
    div.animate({height: '200px', opacity: '0.4'}, "slow");
    div.animate({width: '400px', opacity: '0.8'}, "slow");
    div.animate({height: '100px', opacity: '0.4'}, "slow");
    div.animate({width: '200px', opacity: '0.8'}, "slow");
    div.hide("explode",{pieces: 16}, "slow")*/
    var snd = new Audio('conjunto.mp3'); // buffers automatically when created
	snd.addEventListener("error", function(e) {
        console.log("Logging playback error: " + e);
    });
	snd.load();
	snd.play();
});

socket.on('select', function(data) {
	player.selected = data.sel;
	selectCard(data.cardId);
});

socket.on('disSelect', function(data) {
	player.selected = data.sel;
	disSelectCard(data.cardId);
});

socket.on('validating', function(data) {
	player.state = data.state;
	hideNoSelected();
	printMessage('Validando las cartas..');
});

socket.on('validate', function(data) {
	clearBoard();
	player.board = data.board;
	player.stack = data.stack;
	player.players = data.players;
	player.boardSize = data.boardSize;
	printBoard();
	printStackLength();
	printPlayers();

	if ( data.result === true) {
		printMessage('SI es conjunto');
		var snd = new Audio('siesunconjunto.mp3'); // buffers automatically when created
		snd.addEventListener("error", function(e) {
               console.log("Logging playback error: " + e);
        });
		snd.load();
		snd.play();
	}
	else if (data.result === false){
		printMessage('NO es conjunto');
		var snd = new Audio('noesconjunto.mp3'); // buffers automatically when created
		snd.addEventListener("error", function(e) {
               console.log("Logging playback error: " + e);
        });
		snd.load();
		snd.play();
	}
	/*else if (data.result === 'time'){
		printMessage('Se acabó el tiempo');
	};
	var t = window.setInterval(function() {
		printMessage('¡Sigue buscando un conjunto!');
		clearTimeout(t);
	},1000);
	*/

	player.state = data.state;
	disSelectAll();
	emptySelected();
	player.actual = "";
});

socket.on('noset', function(data) {
	player.state = data.state;
	player.board = data.board;
	player.stack = data.stack;
	player.actual = data.actual;
	player.players = data.players;
	player.boardSize = data.boardSize;

	printPlayers();
	printStackLength();

	if (player.state == "finished") {
		var winner = player.players[0];
		for (var i = 1; i < player.players.length; i++) {
			if (player.players[i].points > winner.points) {
				winner = player.players[i];
			}
		}

		var count = 0;
		for (var i = 0; i < player.players.length; i++) {
			if (player.players[i].points == winner.points) {
				count++;
			}
		}

		if ( count > 1 ) {
			printMessage("Ya no hay más conjuntos. El juego ha terminado con un empate.");
		}
		else
			printMessage("Ya no hay más conjuntos. El ganador es: <strong style = 'color: red';>" + winner.name + '</strong>');
	}
	else {
		if (data.response.result && (data.id == 'ADMIN') ) {
			player.selected = data.selected;
			for (var i = 0; i < player.selected.length; i++) {
				selectCard( player.selected[i] );
			}
			printMessage("Aquí está un conjunto");
		}
		else if ( data.response.result ) {
			printMessage("<strong style = 'color: red';>" + data.id + '</strong>' + " aún hay conjuntos. Sigue buscando!");
		}
		else {
			printBoard();
			printMessage("Ya no hay más conjuntos, se repartieron 3 cartas nuevas " + "<strong style = 'color: red';>" + data.id + " + 1" + '</strong>');
		}
	}
});

socket.on('disconnect', function(data) {
	player.selected = data.selected;
	player.players = data.players;
	player.state = data.state;
	player.actual = data.actual;
	printPlayers();
	printBoard();
});

$('canvas').on('click', function () {
	if ( player.id == player.actual ) {
		if ( ( Number(this.id) < NORMAL_SIZE ) || ( ( Number(this.id) - player.boardSize ) < 0 ) ){
			if (player.state == "choosing") {
				socket.emit('select', {cardId: this.id});
			}
		}
		else if ( (this.id == 'button2') && (player.state == "choosing") ) {
			//if( player.selected.length == 3 )
				socket.emit('validating');
			/*else
				socket.emit('validate');*/
		}
	}
	else if ( this.id == 'button3' && player.state == "searching" ) {
		socket.emit('noset', {id: player.id});
	}
});

function printMessage(message) {
	document.getElementById('messages').innerHTML = message;
}

function printPlayers() {
	$("#players").empty();
	$("#points").empty();
	for (var i = 0; i < player.players.length; i++) {
		if (player.players[i].name == player.id) {
			$("#players").append("<li style = 'color: red' ><strong>" + player.players[i].name + "</strong></li>");
			$("#points").append("<li style = 'color: red' ><strong>" + player.players[i].points + "</strong></li>");
		}
		/*else if (player.players[i].name == player.actual) {
			$("#players").append("<li style = 'color: orange' ><strong>" + player.players[i].name + "</strong></li>");
			$("#points").append("<li style = 'color: orange' ><strong>" + player.players[i].points + "</strong></li>");
		}*/
		else {
			$("#players").append("<li>" + player.players[i].name + "</li>");
			$("#points").append("<li>" + player.players[i].points + "</li>");
		}
	}
}

function printStackLength() {
	//drawBackCard(DECK_POS);
	drawEmptyCard(DECK_POS);
	imageBackCard(DECK_POS);
	var canvas = document.getElementById(DECK_POS);
	var ctx = canvas.getContext("2d");
	ctx.font = "80px Verdana";
	ctx.fillStyle = "#C7D1C0";
	ctx.fillText(player.stack.length,15,120);
}

function emptySelected() {
	// Empty selected cards
	var aux = player.selected.length;
	for (var i = 0; i < aux; i++) {
		player.selected.pop();
	}
}

function selectCard(id) {
	document.getElementById(id).style.background = '#F2F5A9';
	document.getElementById(id).style.boxShadow = "inset 0 0 20px #000000"; //#F77D17";
}

function disSelectAll(){
	for (var i = 0; i < player.selected.length; i++) {
		disSelectCard( player.selected[i] );
	}
}

function disSelectCard(id) {
	document.getElementById(id).style.background = '#FFFFFF';
	document.getElementById(id).style.boxShadow = "inset 0 0 10px #000000"; //#F77D17";
}

function drawButtons() {
	var canvas = document.getElementById("button1");
	var ctx = canvas.getContext("2d");
	ctx.font = "bold 32px sans-serif";
	ctx.strokeStyle = "blue";
	ctx.fillText("CONJUNTO",10,60);

	var canvas2 = document.getElementById("button2");
	var ctx2 = canvas2.getContext("2d");
	ctx2.font = "bold 32px sans-serif";
	ctx2.strokeStyle = "blue";
	ctx2.fillText("VALIDAR",25,60);

	var canvas3 = document.getElementById("button3");
	var ctx3 = canvas3.getContext("2d");
	ctx3.font = "bold 32px sans-serif";
	ctx3.strokeStyle = "blue";
	ctx3.fillText("NO",70,40);
	ctx3.fillText("CONJUNTO",10,70);
}

function printBoard() {
	var number, symbol, shading, color;
	
	for (var i = 0; i < player.boardSize; i++) {
		number = player.board[i].attrs[0];
		symbol = player.board[i].attrs[1];
		shading = player.board[i].attrs[2];
		color = player.board[i].attrs[3];
		drawEmptyCard(i);
		drawCard(i, number+1, symbol, shading, color);
	}
	if ( player.boardSize == NORMAL_SIZE ) {
		for (var j = NORMAL_SIZE; j < BOARD_SIZE; j++) {
			drawEmptyCard(j);
		}
	}
}

function drawOval(id, pos, shading, color) {
	var canvas = document.getElementById(id);
	var context = canvas.getContext('2d');
	var centerX = 0;
	var centerY = 0;
	var radius = 20;

	// save state
	context.save();

	// translate context
	context.translate(canvas.width / 2, (pos)*canvas.height / 8);

	// scale context horizontally
	context.scale(2, 1);

	// draw circle which will be stretched into an oval
	context.beginPath();
	context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);

	// restore to original state
	context.restore();

	// apply styling
	var pattern;
	if (vSHADING[shading] == 'SOLID') {
		pattern = vCOLOR[color];
	} else if (vSHADING[shading] == 'STRIPED') {
		canvasPattern = createPattern( vCOLOR[color] );
		pattern = context.createPattern(canvasPattern,"repeat");
	} else if (vSHADING[shading] == 'OPEN') {
		canvasPattern = createPatternT();
		pattern = context.createPattern(canvasPattern,"repeat");
	}

	context.fillStyle = pattern;
	context.fill();
	context.lineWidth = 4;
	context.strokeStyle = vCOLOR[color];
	context.stroke();
}

function drawRomb(id, pos, shading, color) {
	var canvas = document.getElementById(id);
	var context = canvas.getContext('2d');
	var centerX = 0;
	var centerY = 0;
	var radius = 20;

	context.beginPath();
	context.moveTo(canvas.width / 2 - 2*radius, (pos)*canvas.height / 8);
	context.lineTo(canvas.width / 2, (pos)*canvas.height / 8 - radius);
	context.lineTo(canvas.width / 2 + 2*radius, (pos)*canvas.height / 8);
	context.lineTo(canvas.width / 2, (pos)*canvas.height / 8 + radius);
	context.lineTo(canvas.width / 2 - 2*radius, (pos)*canvas.height / 8);

	// apply styling
	var pattern;
	if (vSHADING[shading] == 'SOLID') {
		pattern = vCOLOR[color];
	} else if (vSHADING[shading] == 'STRIPED') {
		canvasPattern = createPattern( vCOLOR[color] );
		pattern = context.createPattern(canvasPattern,"repeat");
	} else if (vSHADING[shading] == 'OPEN') {
		canvasPattern = createPatternT();
		pattern = context.createPattern(canvasPattern,"repeat");
	}

	context.fillStyle = pattern;
	context.fill();
	context.lineWidth = 4;
	context.strokeStyle = vCOLOR[color];
	context.stroke();
}

function drawRect(id, pos, shading, color) {
	var canvas = document.getElementById(id);
	var context = canvas.getContext('2d');
	var centerX = 0;
	var centerY = 0;
	var radius = 18;

	context.beginPath();
	context.moveTo(canvas.width / 2 - 2*radius, (pos)*canvas.height / 8 + radius);
	context.lineTo(canvas.width / 2 - 2*radius, (pos)*canvas.height / 8 - radius);
	context.lineTo(canvas.width / 2 + 2*radius, (pos)*canvas.height / 8 - radius);
	context.lineTo(canvas.width / 2 + 2*radius, (pos)*canvas.height / 8 + radius);
	context.lineTo(canvas.width / 2 - 2*radius, (pos)*canvas.height / 8 + radius);

	// apply styling
	var pattern;
	if (vSHADING[shading] == 'SOLID') {
		pattern = vCOLOR[color];
	} else if (vSHADING[shading] == 'STRIPED') {
		canvasPattern = createPattern( vCOLOR[color] );
		pattern = context.createPattern(canvasPattern,"repeat");
	} else if (vSHADING[shading] == 'OPEN') {
		canvasPattern = createPatternT();
		pattern = context.createPattern(canvasPattern,"repeat");
	}

	context.fillStyle = pattern;
	context.fill();
	context.lineWidth = 4;
	context.strokeStyle = vCOLOR[color];
	context.stroke();
}

function createPattern(color) {
	// create the off-screen canvas
	var canvasPattern = document.createElement("canvas");
	canvasPattern.width = 5;
	canvasPattern.height = 5;
	var contextPattern = canvasPattern.getContext("2d");

	// draw pattern to off-screen context
	contextPattern.beginPath();
	contextPattern.moveTo(5,0);
	contextPattern.strokeStyle = color;
	contextPattern.lineTo(5,10);
	contextPattern.lineWidth = 5;

	contextPattern.stroke();

	return canvasPattern;
}

function createPatternT() {
	// create the off-screen canvas
	var canvasPattern = document.createElement("canvas");
	canvasPattern.width = 5;
	canvasPattern.height = 5;
	var contextPattern = canvasPattern.getContext("2d");

	// draw pattern to off-screen context
	contextPattern.beginPath();
	contextPattern.stroke();

	return canvasPattern;
}

function drawCard(id, number, symbol, shading, color){
	if (vSYMBOL[symbol] == 'OVAL') {
		for (var i = 0; i < number; i++) {
			drawOval(id, 4 - number + 1 + 2*i, shading, color);
		}
	} else if (vSYMBOL[symbol] == 'RECT') {
		for (var i = 0; i < number; i++) {
			drawRect(id, 4 - number + 1 + 2*i, shading, color);
		}
	} else if (vSYMBOL[symbol] == 'ROMB') {
		for (var i = 0; i < number; i++) {
			drawRomb(id, 4 - number + 1 + 2*i, shading, color);
		}
	}
}

$('#15').click( function(){
	if( player.id == 'ADMIN' && player.state == "initing" ){
		socket.emit('start');
	}
	else if (player.state == "validating" && player.id == 'ADMIN') {
		socket.emit('validate');
	}
});

$('#button1').click( function(){
	if (player.state == "searching" && player.actual == "") {
		socket.emit('set', player.id);
	}
});
