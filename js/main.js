
var WIDTH = 1000;
var HEIGHT = 600;
var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, 'build-an-engine' );

game.state.add( 'Boot', Boot );
game.state.add( 'Preload', Preload );
game.state.add( 'Game', Game );

game.state.start( 'Boot' );
