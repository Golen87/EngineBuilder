//loading the game assets
var Preload = function() {};

Preload.prototype = {
	preload: function () {
		
		this.game.stage.backgroundColor = '#ffffff';

		// Load game assets

		game.load.bitmapFont( 'Balsamiq', 'fonts/balsamiq_regular.png', 'fonts/balsamiq_regular.fnt' ); // 72
		game.load.bitmapFont( 'BalsamiqBold', 'fonts/balsamiq_bold.png', 'fonts/balsamiq_bold.fnt' ); // 72
		
		game.load.spritesheet( 'fan', 'images/parts/fan_sheet.png', 212, 826 );
		game.load.spritesheet( 'propeller', 'images/parts/propeller_sheet.png', 73, 908 );
		game.load.spritesheet( 'compressor', 'images/parts/compressor_sheet.png', 553, 470 );
		game.load.spritesheet( 'combustor', 'images/parts/combustor_sheet.png', 802, 478 );
		game.load.spritesheet( 'turbine', 'images/parts/turbine_sheet.png', 553, 470 );
		game.load.image( 'nozzle', 'images/parts/nozzle.png' );
		game.load.image( 'afterburner', 'images/parts/afterburner.png' );

		game.load.image( 'sky', 'images/sky.jpg' );
		game.load.image( 'cloud', 'images/cloud.png' );
		game.load.image( 'bg', 'images/bg.png' );

		game.load.image( 'particle', 'images/particle.png' );


		// Loading percentage text
		//this.progress = this.game.add.text(this.game.world.centerX, this.game.world.centerY-30, '0%', {fill: 'white'});
		//this.progress.anchor.setTo(.5,.5);

		// Loading progress bar
		var s = 4;
		var x = this.game.world.centerX - this.game.cache.getImage( 'preloader-bar' ).width / 2 * s;
		var y = this.game.world.centerY;
		var progressBg = this.game.add.sprite( x, y, 'preloader-bar' );
		var progressFg = this.game.add.sprite( x, y, 'preloader-bar' );
		progressBg.tint = 0x111111;
		progressFg.tint = 0x2196f3;
		progressBg.anchor.setTo( 0, 0.5 );
		progressFg.anchor.setTo( 0, 0.5 );
		progressBg.scale.set( s );
		progressFg.scale.set( s );
		this.game.load.setPreloadSprite( progressFg );
		this.game.load.onFileComplete.add( this.fileComplete, this );

	},
	create: function () {
		this.state.start( 'Game' );
	},
	fileComplete: function ( progress, cacheKey, success, totalLoaded, totalFiles ) {}
};
