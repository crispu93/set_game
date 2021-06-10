// Crea un servidor http
var express = require('express');
var app = express();
var server = require('http').Server(app);
// Servidor de websockets  
var io = require('socket.io')(server);
// Soporte para manejar directorios
var path = require("path");
var compression = require('compression');
app.use(compression()); //use compression 

// Donde se encuentran nuestros ficheros estaticos
app.use(express.static( path.join(__dirname,'..', 'public') ));

// Calcula el ip del servidor en la red
var os = require('os');
var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}

if (addresses.length === 0) {
	throw new Error("No se encuentra conectado a niguna red");
}
else
	server.listen(8080, function() {
		console.log('Servidor corriendo en http://' + addresses[0] + ':8080' );
	});

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

// Clase principal del juego
function SetGame() {
	this.stack = new Array(STACK_SIZE);
	this.board = new Array(BOARD_SIZE);
	this.selected = [];
	this.players = [];
	this.state = "initing";
	this.actual = "";
	this.boardSize = NORMAL_SIZE;
}

// Representacion de una carta
function Card(attrs) {
	this.attrs = attrs;
	this.used = false;
	this.selected = false;
}

SetGame.prototype.addPlayer = function(user, socketId) {
	this.players.push({name: user, points: 0, id: socketId});
};

SetGame.prototype.createCards = function() {
	for (var i = 0; i < STACK_SIZE; i++) {
		this.stack[i] = new Card([i % 3, Math.floor(i / 3) % 3, Math.floor(i / 9) % 3, Math.floor(i / 27) % 3]);
		//console.log('('+ this.stack[i].attrs[0] + ',' + this.stack[i].attrs[1] + ',' + this.stack[i].attrs[2] + ',' + this.stack[i].attrs[3] + ')');
	}
};

SetGame.prototype.mixStack = function() {
	var temp;
	var aux;
	for (var i = 0; i < STACK_SIZE; i++) {
		aux = Math.floor(Math.random()*STACK_SIZE);
		if (aux != i) {
			temp = this.stack[i];
			this.stack[i] = this.stack[aux];
			this.stack[aux] = temp;
		}
	}
};

SetGame.prototype.fillBoard = function() {
	if(this.state == "initing") {
		for (var i = 0; i < NORMAL_SIZE; i++) {
			this.board[i] = this.stack.pop();
		}
	}
};

SetGame.prototype.emptySelected = function() {
	var aux = this.selected.length;
	for (var i = 0; i < aux; i++) {
		this.selected.pop();
	}
};

SetGame.prototype.newCards = function() {
	if (this.boardSize == BOARD_SIZE) {
		// Ordena el arreglo en orden descendente
		this.selected.sort( function(a, b){ return b - a; } );
		//console.log(this.selected);

		var boardAux = [];
		for (var i = 0; i < this.board.length; i++) {
			var temp = -1;
			for (var j = 0; j < this.selected.length; j++) {
				if (i == this.selected[j]) {
					temp = 1;
				}
			}
			if (temp == -1) {
				boardAux.push(this.board[i]);
			}
		}
		boardAux.push();
		boardAux.push();
		boardAux.push();

		this.board = boardAux.slice();
		
		this.boardSize = NORMAL_SIZE;
	}
	else if (this.boardSize <= NORMAL_SIZE) {
		var it = this.selected.length;
		if ( game.stack.length != 0 ) {
			for (var i = 0; i < it; i++) {
				this.board[ this.selected[i] ] = this.stack.pop();
			}
		}
		else {
			for (var i = 0; i < it; i++) {
				this.board[ this.selected[i] ] = undefined;
			}
			this.board = this.board.filter(function(n){ return n != undefined }); 
			this.boardSize = this.board.length;
		}
	}
	//console.log(this.board);
};

SetGame.prototype.addPoint = function(ind) {
	this.players[ind].points += 1;
};

SetGame.prototype.quitPoint = function(ind) {
	this.players[ind].points -= 1;
};

SetGame.prototype.aument = function() {
	if ( this.boardSize >= NORMAL_SIZE ) {
		for (var i = NORMAL_SIZE; i < BOARD_SIZE; i++) {
			this.board[i] = this.stack.pop();
		}
		this.boardSize = BOARD_SIZE;
		this.state = "searching";
	}
	else {
		this.state = "finished";
	}
};

SetGame.prototype.isSet = function() {
	if (this.selected.length == 3) {
		var flag = 0;
		var aux = new Array(4);
		for (var i = 0; i < aux.length; i++) {
			aux[i]=0;
			for (var j = 0; j < this.selected.length; j++) {
				aux[i] += this.board[ this.selected[j] ].attrs[i];
			}
			if ( aux[i] % 3 != 0 ) {
				return false;
			}
		}
		return true;
	}
	else
		return false;
};

// Revisa si el arreglo que recibe es un set
function isSet(data) {
	var flag = 0;
	if (data.length == 3) {
		var aux = new Array(4);
		for (var i = 0; i < aux.length; i++) {
			aux[i]=0;
			for (var j = 0; j < data.length; j++) {
				aux[i] += data[j].attrs[i];
			}
			if ( aux[i] % 3 != 0 ) {
				return false;
			}
		}
		return true;
	}
	return false;
}

SetGame.prototype.isSetBoard = function() {
	var set = [];
	for (var i = 0; i < this.boardSize; i++) {
		set.push(this.board[i]);
	}
	var result = false;
	var sug = [];
	for (var i = 0; i < set.length; i++) {
		for (var j = i+1; j < set.length; j++) {
			for (var k = j+1; k < set.length; k++) {
				var data = [];
				data.push(set[i]);
				data.push(set[j]);
				data.push(set[k]);
				result = isSet(data);
				if (result == true) {
					sug.push(i);
					sug.push(j);
					sug.push(k);
					return {result: result, hint: sug};
				}
			}
		}
	}
	return {result: result, hint: sug};
};

SetGame.prototype.quitPlayer = function(socketId) {
	for (var i = 0; i < this.players.length; i++) {
		if ( this.players[i].id == socketId ) {
			if ( this.players[i].name == this.actual) {
				this.actual = "";
				this.state = "searching";
				this.emptySelected();
			}
			//delete this.players[i];
			this.players.splice(i,1);	
			break;
		}
	}
};
/****************************************************************/
/****************************************************************/
/****************************************************************/

var game = new SetGame();
game.createCards();
// console.log('YA CREO EL STACK');
game.mixStack();
// console.log('YA MEZCLÓ');
game.fillBoard();
// console.log('YA LLENO');

// Cuando se conecta un cliente
io.on('connection', function(socket) {
    console.log('Un cliente se ha conectado');
    // Inicia una instancia para el juego

    socket.on('signIn', function(user) {
		//console.log(game.players);
		
		var flag = false;
		for (var i = 0; i < game.players.length; i++) {
			if(game.players[i].name == user) {
				flag = true;
				break;
			}
		}
		if ( flag ) {
			socket.emit('signIn');
		}
		else {
			game.addPlayer(user, socket.id);
			io.emit('signInResponse', game, user, flag);
		}
	});

	socket.on('start', function(){
		game.state = "searching";
		io.emit('initGame', game);
    });

    socket.on('set', function(id){
		if (game.state == "searching") {
			game.state = "choosing";
		}
		game.actual = id;
		io.emit('set', {user: id, state: game.state});
    });

    socket.on('select', function(data) {
		var index = game.selected.indexOf(data.cardId);
		if (index >= 0) {
			game.selected.splice(index,1);
			io.emit('disSelect', {sel: game.selected, cardId: data.cardId });
		}
		else {
			game.selected.push(data.cardId);
			io.emit('select', {sel: game.selected, cardId: data.cardId });
		}
    });

    socket.on('validating', function() {
		game.state = "validating";
		io.emit('validating', {state: game.state});
    });

    socket.on('validate', function() {
		var result = game.isSet();
		if ( result === true ) {
			game.newCards();
		}
		game.emptySelected();
		
		game.state = "searching";
		var ind = -1;
		for (var i = 0; i < game.players.length; i++) {
			if (game.players[i].name == game.actual)
				ind = i;
		}

		if ( result === true ) {
			game.addPoint(ind);
		}
		else {
			game.quitPoint(ind);
		}
		game.actual = "";

		io.emit('validate', {result: result, state: game.state, board: game.board, stack: game.stack, players: game.players, state: game.state, boardSize: game.boardSize});
    });

    socket.on('noset', function(data) {
		var response = game.isSetBoard();
		var ind = -1;
		for (var i = 0; i < game.players.length; i++) {
			if (game.players[i].name == data.id)
				ind = i;
		}
		if (response.result === true) {	// Si hay conjuntos en el tablero
			if (data.id == 'ADMIN') {
				for (var i = 0; i < response.hint.length; i++) {
					game.selected.push( response.hint[i] );
				}
				game.state = "choosing";
				game.actual = 'ADMIN';
			}
			else {
				game.state = "searching";
				game.quitPoint(ind);
			}
		}
		else {
			game.addPoint(ind);
			game.aument();
			
		}
		//console.log(game.stack.length);
		io.emit('noset', {response: response, id: data.id, players: game.players, selected: game.selected, board: game.board, boardSize: game.boardSize, state: game.state, actual: game.actual, stack: game.stack});
    });

    socket.on('disconnect', function () {
		game.quitPlayer(socket.id);
		io.emit('disconnected', { players: game.players, state: game.state, actual: game.actual, selected: game.selected} );
		console.log("Un cliente se ha desconectado");
	});

});

