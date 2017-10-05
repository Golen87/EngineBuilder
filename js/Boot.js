var Boot = function() {};

Boot.prototype = {
	preload: function() {
		this.load.image( 'preloader-bar', 'images/preloader-bar.png' );
	},
	create: function() {
		this.state.start( 'Preload' );
	}
};
