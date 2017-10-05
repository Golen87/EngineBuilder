
parts = ['fan', 'propeller', 'compressor', 'combustor', 'turbine', 'nozzle', 'afterburner'];

var Game = function()
{
	this.keys = {};
	this.sprites = [];
	this.slotBg = [];
	this.selected = null;
	this.highlight = null;
	this.textPartDesc;
	this.textPartName;

	this.background = null;

	this.previewIndex = 0;
	this.previewSprite = null;
	this.previewSize = 100;

	this.partscale = [0.14, 0.3, 0.16, 0.10, 0.16, 0.15, 0.15];
	this.slots = [null, null, null, null, null];

	this.positions = [];
	this.slot_width = [56, 80, 80, 80, 80];
	this.slot_height = [80+30, 80, 80, 80, 80, 80-30];
	this.slot_anchor = [1.0, 0.5, 0.5, 0.5, 0.0];
	this.SCALE = 1.5;
};

Game.prototype =
{
	create: function()
	{
		game.stage.backgroundColor = '#ffffff';
		game.add.tileSprite( 0, 0, game.width, game.height, 'sky' );


		var box = [600, 30, WIDTH-600, 200];

		this.cloud = game.add.sprite( box[0] + box[2]/2, box[1] + box[3]/2, 'cloud' );
		this.cloud.anchor.set( 0.5 );
		this.cloud.scale.set( 0.5 );

		//var bar = game.add.graphics();
		//bar.beginFill( 0x000000, 0.2 );
		//bar.drawRect( box[0], box[1], box[2], box[3] );
		//bar.endFill();

		var padding = 0;
		this.textPartName = game.add.bitmapText( 0, 0, 'BalsamiqBold', 'Name', 32 );
		this.textPartName.x = box[0] + padding;
		this.textPartName.y = box[1] + padding;

		var sep = 48;
		this.textPartDesc = game.add.bitmapText( 0, 0, 'Balsamiq', 'Description', 24 );
		this.textPartDesc.x = box[0] + padding;
		this.textPartDesc.y = box[1] + padding + sep;
		this.textPartDesc.maxWidth = box[2] - 2*padding - sep;

		var startLeft = WIDTH * 1/12;
		var startTop = HEIGHT/2;
		var width = this.slot_width.reduce((a, b) => a + b, 0);

		var left = startLeft;
		var top = startTop;
		for ( var i = 0; i < this.slots.length; i++ )
		{
			this.positions.push( [left, top] );
			left += this.SCALE * this.slot_width[i];
		}


		var x = startLeft + this.SCALE * (width/2 + this.slot_width[0]/5);
		var y = startTop;
		var scale = 0.48;
		this.background = game.add.sprite( x, y, 'bg' );
		this.background.anchor.set( 0.5, 0.5 );
		this.background.scale.set( this.SCALE * scale );
		this.background.alpha = 1.0;


		var thick = 15;
		var bar = game.add.graphics();
		bar.beginFill( 0x333333, 1.0 );
		var barLeft = startLeft + this.SCALE * ( this.slot_width[0]/2 - 5 );
		var barWidth = width - this.slot_width[0]/2 - this.slot_width[this.slots.length-1];
		bar.drawRect( barLeft, startTop - thick/2, this.SCALE * barWidth, thick );
		bar.endFill();


		for ( var i = 0; i < this.slots.length; i++ )
		{
			var p = this.positions[i];

			var box = game.add.graphics();
			this.slotBg.push( box );
			box.beginFill( 0x001133, 0.2 );
			var padding = 10;
			var left = p[0]+padding;
			var w = this.slot_width[i]*this.SCALE-2*padding;
			var topL = p[1]+padding - this.slot_height[i]/2*this.SCALE;
			var hL = this.slot_height[i+1]*this.SCALE-2*padding;
			var topR = p[1]+padding - this.slot_height[i+1]/2*this.SCALE;
			var hR = this.slot_height[i]*this.SCALE-2*padding;
			var poly = new Phaser.Polygon([
				new Phaser.Point( left, topL ),
				new Phaser.Point( left + w, topR ),
				new Phaser.Point( left + w, topR + hL ),
				new Phaser.Point( left, topL + hR )
			]);
			box.drawPolygon(poly.points);
			box.endFill();

			var s = game.add.sprite( 0, 0, null );
			s.addChild( box );
			s.index = i;
			s.texture.frame.width = w;
			s.texture.frame.height = hR;
			s.anchor.set( -left/w, -topL/hR );
			s.inputEnabled = true;
			s.events.onInputDown.add( function(sprite) {
				this.game.remove( this.game.slots[sprite.index] );
				this.game.setAtPosition( sprite.index, this.game.previewIndex );
				this.game.runEngine();
				//game.add.tween(this).to({
				//	alpha: 0.8,
				//}, 200, Phaser.Easing.Exponential.Out, true, 0, 0, true);
			}, {game: this, sprite: s});
		}


		var preview = game.add.sprite( WIDTH - this.previewSize, HEIGHT - this.previewSize, null );

		var box = game.add.graphics();
		box.beginFill( 0xffff00, 0.5 );
		//box.drawRect( 0, 0, this.previewSize, this.previewSize );
		box.drawCircle( this.previewSize/2, this.previewSize/2, this.previewSize );
		box.endFill();
		preview.addChild( box );

		this.previewSprite = game.add.sprite( this.previewSize/2, this.previewSize/2, parts[this.previewIndex], 0 );
		this.previewSprite.anchor.set( 0.5, 0.5 );
		this.previewSprite.scale.set( this.previewSize / game.cache.getImage( parts[this.previewIndex] ).height );
		preview.addChild( this.previewSprite );

		preview.inputEnabled = true;
		preview.events.onInputDown.add( function() {
			this.previewIndex = (this.previewIndex + 1) % parts.length;
			this.previewSprite.loadTexture( parts[this.previewIndex], 0 );
			this.previewSprite.scale.set( this.previewSize / game.cache.getImage( parts[this.previewIndex] ).height );
		}, this);


		//this.drawLine();


		for ( var i = 0; i < parts.length; i++ )
		{
			var s = game.add.sprite( 0, 0, parts[i], 0 );
			this.sprites.push( s );
			s.scale.set( this.partscale[i] * this.SCALE );

			s.animations.add( 'run', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18], 20, true );
			s.animations.play( 'run' );

			this.remove( i );
		}

		for ( var i = 0; i < this.slots.length; i++ )
		{
			var p = this.positions[i];

			var style = { font: "bold 32px Helvetica", fill: "#e54", boundsAlignH: "center", boundsAlignV: "middle" };
			var t = game.add.text( p[0], p[1] - this.slot_height[i]/2*this.SCALE, i+1, style );
			t.setShadow( 2, 2, 'rgba(0,0,0,1)', 0 );
		}


		for ( var i = 0; i < 7; i++ )
			this.keys[i] = [];

		this.keys[0][0] = game.input.keyboard.addKey( Phaser.Keyboard.ONE );
		this.keys[1][0] = game.input.keyboard.addKey( Phaser.Keyboard.TWO );
		this.keys[2][0] = game.input.keyboard.addKey( Phaser.Keyboard.THREE );
		this.keys[3][0] = game.input.keyboard.addKey( Phaser.Keyboard.FOUR );
		this.keys[4][0] = game.input.keyboard.addKey( Phaser.Keyboard.FIVE );

		this.keys[0][1] = game.input.keyboard.addKey( Phaser.Keyboard.Q );
		this.keys[1][1] = game.input.keyboard.addKey( Phaser.Keyboard.W );
		this.keys[2][1] = game.input.keyboard.addKey( Phaser.Keyboard.E );
		this.keys[3][1] = game.input.keyboard.addKey( Phaser.Keyboard.R );
		this.keys[4][1] = game.input.keyboard.addKey( Phaser.Keyboard.T );
		this.keys[5][1] = game.input.keyboard.addKey( Phaser.Keyboard.Y );
		this.keys[6][1] = game.input.keyboard.addKey( Phaser.Keyboard.U );


		particles = game.add.group();
		particles.createMultiple( 100, 'particle', 0, true );

		for ( var i = 0; i < particles.children.length; i++ )
		{
			var s = particles.children[i];
			s.tint = 0xff0000;
			s.tint = 0x88ddff//game.rnd.integerInRange( 0, 0xffffff );
			s.anchor.set( 0.5 );
			s.scale.set( 0.5 );
			s.alpha = 0.2;
			s.position.x = game.rnd.integerInRange( 0, WIDTH );
			s.position.y = game.rnd.integerInRange( 150, HEIGHT-150 );
			s.velocity = new Phaser.Point( 4, 0 );
		}


		this.setAtPosition( 0, 0 );
		this.setAtPosition( 1, 2 );
		this.setAtPosition( 2, 3 );
		this.setAtPosition( 3, 4 );
		this.setAtPosition( 4, 5 );
		this.runEngine();
	},

	update: function()
	{
		for ( var i = 0; i < this.slots.length; i++ )
		{
			if ( this.keys[i][0].justDown )
			{
				if ( this.selected != null )
				{
					this.remove( this.slots[i] );
					this.setAtPosition( i, this.selected );
					this.selected = null;
					this.runEngine();
				}
				else
				{
					this.remove( this.slots[i] );
					this.slots[i] = null;
					this.runEngine();
				}
			}
		}

		for ( var i = 0; i < parts.length; i++ )
		{
			if ( this.keys[i][1].justDown )
			{
				if ( this.selected == null )
				{
					this.setAsPreview( i );
				}
				else if ( this.selected == i )
				{
					this.remove( this.selected );
					this.selected = null;
					this.runEngine();
				}
				else
				{
					this.remove( this.selected );
					this.setAsPreview( i );
					this.runEngine();
				}
			}
		}

		for ( var i = 0; i < particles.children.length; i++ )
		{
			var s = particles.children[i];
			if ( s.alive )
			{
				s.position.x += s.velocity.x;
				s.position.y += s.velocity.y;

				if ( s.position.x > WIDTH + 50 )
				{
					s.position.x -= WIDTH + 100;
				}
			}
		}

		var s = 0.5 + 0.5 * Math.sin( game.time.totalElapsedSeconds() * Math.PI );
		s = 0;
		var fac = s * 0xff;
		this.textPartName.tint = (fac << 0) + (fac << 8) + (fac << 16);
		this.textPartDesc.tint = (fac << 0) + (fac << 8) + (fac << 16);
		this.cloud.tint = ((0xff - 0.5*fac << 0) + (0xff - 0.5*fac << 8) + (0xff - 0.5*fac << 16));
	},
};


Game.prototype.setAsPreview = function ( i )
{
	this.selected = i;

	if ( this.slots.indexOf( i ) > -1 )
		this.slots[this.slots.indexOf( i )] = null;

	this.sprites[i].tint = 0xffffff;
	this.sprites[i].alpha = 1.0;
	this.sprites[i].scale.set( this.partscale[i] * this.SCALE / 3 );
	this.sprites[i].anchor.set( 0.0 );
	this.sprites[i].x = -1000;
	this.sprites[i].y = this.SCALE / 4;

	this.previewIndex = i;
	this.previewSprite.loadTexture( parts[this.previewIndex], 0 );
	this.previewSprite.scale.set( this.previewSize / game.cache.getImage( parts[this.previewIndex] ).height );
};

Game.prototype.remove = function ( i )
{
	if ( i != null )
		this.sprites[i].x = -1000;
};

Game.prototype.setAtPosition = function ( p, s )
{
	if ( partData[parts[s]]['allowed'].indexOf( p+1 ) == -1 )
	{
		this.sprites[s].tint = 0xff7777;
		this.sprites[s].alpha = 0.75;
	}
	else
	{
		this.sprites[s].tint = 0xffffff;
		this.sprites[s].alpha = 1.0;
	}

	var padding = 5;
	var anchor = this.slot_anchor[p];
	if ( parts[s] == 'propeller' )
		anchor = 0.0;
	this.sprites[s].position.x = this.positions[p][0] + this.SCALE * ( padding + ( this.slot_width[p] - 2*padding ) * anchor );
	this.sprites[s].position.y = this.positions[p][1];
	this.sprites[s].scale.set( this.partscale[s] * this.SCALE );
	this.sprites[s].anchor.set( anchor, 0.5 );

	if ( this.slots.indexOf( s ) > -1 )
		this.slots[this.slots.indexOf( s )] = null;
	this.slots[p] = s;
	//this.slotBg[p].top += 100;

	if ( this.highlight )
		this.highlight.tint = 0xffffff;
	this.highlight = s;
	this.highlight.tint = 0xffff77;
};


Game.prototype.drawLine = function () {
	var pointsArray = [];

	for(var i = 0; i < 4; i++) {
		var p = new Phaser.Point( game.rnd.between(0, WIDTH), game.rnd.between(0, HEIGHT) );
		pointsArray.push( p );
	}
	var bezierGraphics = this.game.add.graphics(0, 0);

	bezierGraphics.clear();
	bezierGraphics.lineStyle(2, 0x008800, 1);
	bezierGraphics.moveTo(pointsArray[1].x, pointsArray[1].y);
	bezierGraphics.lineTo(pointsArray[0].x, pointsArray[0].y);
	bezierGraphics.lineStyle(2, 0x880000, 1)
	bezierGraphics.moveTo(pointsArray[3].x, pointsArray[3].y);
	bezierGraphics.lineTo(pointsArray[2].x, pointsArray[2].y);
	bezierGraphics.lineStyle(4, 0xffff00, 1);
	bezierGraphics.moveTo(pointsArray[0].x, pointsArray[0].y);
	for (var i=0; i<1; i+=0.01){
		var p = this.bezierPoint(pointsArray[0], pointsArray[1], pointsArray[2], pointsArray[3], i);
		bezierGraphics.lineTo(p.x, p.y);
	}
};

Game.prototype.bezierPoint = function (p0, p1, p2, p3, t) {
	var cX = 3 * (p1.x - p0.x);
	var bX = 3 * (p2.x - p1.x) - cX;
	var aX = p3.x - p0.x - cX - bX;
	var cY = 3 * (p1.y - p0.y);
	var bY = 3 * (p2.y - p1.y) - cY;
	var aY = p3.y - p0.y - cY - bY;
	var x = (aX * Math.pow(t, 3)) + (bX * Math.pow(t, 2)) + (cX * t) + p0.x;
	var y = (aY * Math.pow(t, 3)) + (bY * Math.pow(t, 2)) + (cY * t) + p0.y;
	return {x: x, y: y};	
};

Game.prototype.runEngine = function () {
	var result = tryInput( this.slots );
	var success = result[0];
	var text = result[1];

	if ( !success )
	{
		this.textPartName.text = "*suck*";
		this.textPartDesc.text = text;
	}
	else
	{
		var t = findFinishedEngine( getClean( this.slots ) );
		this.textPartName.text = t[0];
		this.textPartDesc.text = t[1];
	}
};