// Número de cartas del mazo
const DECKSIZE = 81;
const TOTALFIELD = 15;
const NORMALFIELD = 12;

// Clase principal del juego
function SetGame() {
  this.players = [];
  this.fields = new Array(TOTALFIELD);
  this.selected = [] // Cartas seleccionadas
}

// Clase que representa a una carta
function Card(attrs) {
  this.attrs = attrs;
  this.selected = false;
}
