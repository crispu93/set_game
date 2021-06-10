const STACK_SIZE = 81;
const BOARD_SIZE = 15;
const NORMAL_SIZE = 12;

//Atributos de las cartas
const COLOR = 0;
const SYMBOL = 1;
const NUMBER = 2;
const SHADING = 3; 

// Clase principal del juego
function SetGame() {
	this.stack = new Array(STACK_SIZE);
	this.board = new Array(STACK_SIZE);
	this.selected = [];
	this.discard = [];
	this.players = [];
}

// Representacion de una carta
function Card(attrs) {
	this.attrs = attrs;
	this.used = false;
	this.selected = false;
}

SetGame.prototype.createCards = function() {
	for (var i = 0; i < STACK_SIZE; i++) {
		this.stack[i] = new Card([a % 3, Math.floor(a / 3) % 3, Math.floor(a / 9) % 3, Math.floor(a / 27) % 3]);
	}
};

SetGame.prototype.mixStack = function() {
	var temp;
	var aux;
	for (var i = 0; i < STACK_SIZE; i++) {
		aux = Math.round(Math.random()*STACK_SIZE);
		if (aux != i) {
			temp = this.stack[i];
			this.stack[i] = this.stack[aux];
			this.stack[aux] = temp;
		}
	}
};

SetGame.prototype.initGame = function() {

};

function drawBoard() {
	var k = 0;
	var i=0,j = 0;
	for (k=0; k<16; k++) {
		var canvas = document.getElementById(k);
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
}

function drawBoardCard(id) {
	var canvas = getElementById(id);
	var ctx = canvas.getContext('2D');


}

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

SetGame.prototype.takeCard = function() {
	this.discard.push(this.stack.pop());
};