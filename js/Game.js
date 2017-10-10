
parts = ['fan', 'propeller', 'compressor', 'combustor', 'turbine', 'nozzle', 'afterburner'];

var Game = function()
{
	this.keys = {};
	this.sprites = [];
	this.slotSprites = [];
	this.slotBg = [];
	this.selected = null;
	this.highlight = null;
	this.textPartDesc;
	this.textPartName;

	this.background = null;

	this.previewIndex = 0;
	this.previewSprite = null;
	this.previewSize = 50;

	this.partscale = [0.14, 0.3, 0.16, 0.10, 0.16, 0.15, 0.15];
	this.partWidth = [212, 73, 553, 802, 553, 409, 610];
	this.slots = [null, null, null, null, null];

	this.positions = [];
	this.slot_width = [56, 80, 80, 80, 80];
	this.slot_height = [80+30, 80, 80, 80, 80, 80-30];
	this.slot_anchor = [1.0, 0.5, 0.5, 0.5, 0.0];
	this.part_body_height = [250, 250, 110, 30, 50, 110, 110];
	this.SCALE = 1.5;

	this.NOPOWER = 2;
	this.POWER = 20;
	this.animationSpeed = this.NOPOWER;
};

Game.prototype =
{
	create: function()
	{
		game.physics.startSystem( Phaser.Physics.ARCADE );

		this.engineLeft = 20;
		this.engineTop = HEIGHT/2;
		this.engineWidth = this.slot_width.reduce((a, b) => a + b, 0);

		this.drawBackground();
		this.drawInfo();
		this.drawEngineHull();

		this.calculateSlotPositions();

		this.setupSlots();

		this.setupPreview();

		this.setupParts();

		this.drawSlotNumbers();

		this.setupParticles();

		this.setupKeyboardInput();

		// Bezier curve from newly placed slot. Might remove later.
		//this.drawLine();

		// Temporary. Remove later.
		//this.setAtPosition( 0, 0 );
		//this.setAtPosition( 1, 2 );
		//this.setAtPosition( 2, 3 );
		//this.setAtPosition( 3, 4 );
		//this.setAtPosition( 4, 5 );

		this.runEngine();

		this.animationFrame = 0;
		this.animate();
	},

	update: function()
	{
		if ( this.animationSpeed < this.animationSpeedGoal )
			this.animationSpeed += 1;
		else if ( this.animationSpeed > this.animationSpeedGoal )
			this.animationSpeed -= 1;

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
					this.clearSlot( i );
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

			this.sprites[i].frame = this.animationFrame;
		}

		this.updateParticles();

		//var s = 0.5 + 0.5 * Math.sin( game.time.totalElapsedSeconds() * Math.PI );
		//s = 0;
		//var fac = s * 0xff;
		//this.textPartName.tint = (fac << 0) + (fac << 8) + (fac << 16);
		//this.textPartDesc.tint = (fac << 0) + (fac << 8) + (fac << 16);
		//this.cloud.tint = ((0xff - 0.5*fac << 0) + (0xff - 0.5*fac << 8) + (0xff - 0.5*fac << 16));
	},

	render: function()
	{
		for ( var i = 0; i < this.slotSprites.length; i++ )
		{
			//game.debug.body( this.slotSprites[i] );
		}
	},

	drawBackground: function()
	{
		game.stage.backgroundColor = '#ffffff';

		// Draw background
		game.add.tileSprite( 0, 0, game.width, game.height, 'sky' );

		this.cloud = game.add.sprite( 200, 50, 'cloud' );
		this.cloud.anchor.set( 0.5 );
		this.cloud.scale.set( 0.5 );
		this.cloud2 = game.add.sprite( 900, 500, 'cloud' );
		this.cloud2.anchor.set( 0.5 );
		this.cloud2.scale.set( 0.5 );
	},

	drawInfo: function()
	{
		var box = [610, 10, WIDTH-610, 64];

		this.icon = game.add.sprite( box[0] - 80, box[1], 'info' );
		this.icon.scale.set( 0.12 );

		//var bar = game.add.graphics();
		//bar.beginFill( 0x000000, 0.2 );
		//bar.drawRect( box[0], box[1], box[2], box[3] );
		//bar.endFill();

		var padding = 10;
		this.textPartName = game.add.bitmapText( 0, 0, 'BalsamiqBold', 'Name', 32 );
		this.textPartName.x = box[0] + padding;
		this.textPartName.y = box[1] + padding;
		this.textPartName.tint = 0x000000;


		var box = [610, 260, WIDTH-610, 300];

		//var bar = game.add.graphics();
		//bar.beginFill( 0x000000, 0.2 );
		//bar.drawRect( box[0], box[1], box[2], box[3] );
		//bar.endFill();

		this.textPartDesc = game.add.bitmapText( 0, 0, 'Balsamiq', 'Description', 20 );
		this.textPartDesc.x = box[0] + padding;
		this.textPartDesc.y = box[1] + padding;
		this.textPartDesc.maxWidth = box[2] - 2*padding;
		this.textPartDesc.tint = 0x000000;


		var box = [610, 100, WIDTH-610, 100];

		this.brain = game.add.sprite( box[0] - 80, box[1], 'brain' );
		this.brain.scale.set( 0.48 );

		//var bar = game.add.graphics();
		//bar.beginFill( 0x000000, 0.2 );
		//bar.drawRect( box[0], box[1], box[2], box[3] );
		//bar.endFill();

		this.brainText = game.add.bitmapText( 0, 0, 'Balsamiq', 'Description', 20 );
		this.brainText.x = box[0] + padding;
		this.brainText.y = box[1] + padding;
		this.brainText.maxWidth = box[2] - 2*padding;
		this.brainText.tint = 0x000000;
	},

	drawEngineHull: function()
	{
		// Draw engine hull
		var x = this.engineLeft + this.SCALE * (this.engineWidth/2 + this.slot_width[0]/5);
		var y = this.engineTop;
		var scale = 0.48;
		this.background = game.add.sprite( x, y, 'bg' );
		this.background.anchor.set( 0.5, 0.5 );
		this.background.scale.set( this.SCALE * scale );
		this.background.alpha = 1.0;

		// Draw main axis, connecting fan with turbine
		var thick = 15;
		var bar = game.add.graphics();
		bar.beginFill( 0x333333, 1.0 );
		var barLeft = this.engineLeft + this.SCALE * ( this.slot_width[0]/2 - 5 );
		var barWidth = this.engineWidth - this.slot_width[0]/2 - this.slot_width[this.slots.length-1];
		bar.drawRect( barLeft, this.engineTop - thick/2, this.SCALE * barWidth, thick );
		bar.endFill();
	},

	setupSlots: function()
	{
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
			var hL = this.slot_height[i]*this.SCALE-2*padding;
			var topR = p[1]+padding - this.slot_height[i+1]/2*this.SCALE;
			var hR = this.slot_height[i+1]*this.SCALE-2*padding;
			var poly = new Phaser.Polygon([
				new Phaser.Point( left, topL ),
				new Phaser.Point( left + w, topR ),
				new Phaser.Point( left + w, topR + hR ),
				new Phaser.Point( left, topL + hL )
			]);
			box.drawPolygon(poly.points);
			box.endFill();

			var s = game.add.sprite( 0, 0, null );
			this.slotSprites.push(s);
			s.addChild( box );
			s.index = i;
			s.texture.frame.width = w;
			s.texture.frame.height = hL;
			//s.anchor.set( -left/w, -topL/hR );
			s.inputEnabled = true;
			s.events.onInputDown.add( function(sprite) {
				this.game.remove( this.game.slots[sprite.index] );
				this.game.setAtPosition( sprite.index, this.game.previewIndex );
				this.game.runEngine();
			}, {game: this, sprite: s});

			game.physics.arcade.enable( s, Phaser.Physics.ARCADE );
		}
	},

	calculateSlotPositions: function()
	{
		var left = this.engineLeft;
		var top = this.engineTop;
		for ( var i = 0; i < this.slots.length; i++ )
		{
			this.positions.push( [left, top] );
			left += this.SCALE * this.slot_width[i];
		}
	},

	setupParts: function()
	{
		for ( var i = 0; i < parts.length; i++ )
		{
			var s = game.add.sprite( 0, 0, parts[i], 0 );
			this.sprites.push( s );
			s.scale.set( this.partscale[i] * this.SCALE );

			//s.animations.add( 'run', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18], 20, true );
			//s.animations.play( 'run' );

			this.remove( i );
		}
	},

	drawSlotNumbers: function()
	{
		for ( var i = 0; i < this.slots.length; i++ )
		{
			var p = this.positions[i];

			var style = { font: "bold 32px Helvetica", fill: "#e54", boundsAlignH: "center", boundsAlignV: "middle" };
			var t = game.add.text( p[0], p[1] - this.slot_height[i]/2*this.SCALE, i+1, style );
			t.setShadow( 2, 2, 'rgba(0,0,0,1)', 0 );
		}
	},

	setupPreview: function()
	{
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
	},

	setupParticles: function()
	{
		this.particles = game.add.group();
		this.particles.createMultiple( 400, 'particle', 0, true );

		for ( var i = 0; i < this.particles.children.length; i++ )
		{
			var s = this.particles.children[i];
			game.physics.arcade.enable( s, Phaser.Physics.ARCADE );
			s.startTint = 0x88ddff;
			s.tint = s.startTint;
			s.anchor.set( 0.5 );
			s.scale.set( 0.5 );
			s.alpha = 0.2;
			s.position.x = game.rnd.integerInRange( 0, WIDTH );
			s.position.y = game.rnd.integerInRange( 130, HEIGHT-130 );
			s.startVelocity = new Phaser.Point( 1.5+0.5*Math.random(), 0 );
			s.velocity = new Phaser.Point( s.startVelocity.x, s.startVelocity.y );

			s.lastSlot = -1;
		}
	},

	updateParticles: function()
	{

		for ( var i = 0; i < this.particles.children.length; i++ )
		{
			var s = this.particles.children[i];
			if ( s.alive )
			{
				s.position.x += s.velocity.x;
				s.position.y += s.velocity.y;

				if ( s.position.x > WIDTH + 50 )
				{
					s.position.x -= WIDTH + 100;
					s.position.y = game.rnd.integerInRange( 130, HEIGHT-130 );
					s.velocity.x = s.startVelocity.x;
					s.velocity.y = s.startVelocity.y;
					s.tint = s.startTint;
					s.lastSlot = -1;
				}

				for ( var j = 0; j < this.slots.length; j++ )
				{
					if ( s.lastSlot == j )
						continue;
					var scale = this.animationSpeed / this.POWER;

				game.physics.arcade.overlap( s, this.slotSprites[j], function( s, slot ) {
					s.lastSlot = j;

					var speedFac = 3;
					var p = parts[this.slots[j]];
					if ( p == 'fan' || p == 'propeller' )
					{
						var speed = 350 * speedFac;
						var fac = 1.0 - 0.1 * scale;
						var pFac = 1.0 - 0.5 * scale;
						game.add.tween( s.position ).to({ y: this.engineTop + (s.position.y - this.engineTop)*pFac }, speed, Phaser.Easing.Circular.InOut, true );
						game.add.tween( s.velocity ).to({ x: s.velocity.x * fac }, speed, Phaser.Easing.Circular.InOut, true );
						//game.add.tween( s.scale ).to({ x: s.scale.x*fac, y: s.scale.y*fac }, speed, Phaser.Easing.Circular.InOut, true );
						//this.tweenTint( s, s.tint, 0x55ff77, speed );
					}
					else if ( p == 'compressor' )
					{
						var speed = 600 * speedFac;
						var fac = 1.0 - 0.4 * scale;
						var pFac = 1.0 - 0.66 * scale;
						game.add.tween( s.position ).to({ y: this.engineTop + (s.position.y - this.engineTop)*pFac }, speed, Phaser.Easing.Circular.InOut, true );
						game.add.tween( s.velocity ).to({ x: s.velocity.x * fac }, speed, Phaser.Easing.Circular.InOut, true );
						//game.add.tween( s.scale ).to({ x: fac, y: fac }, speed, Phaser.Easing.Circular.InOut, true );
						//this.tweenTint( s, s.tint, 0xccff11, speed );
					}
					else if ( p == 'combustor' )
					{
						var speed = 250 * speedFac;
						var fac = 5.3;
						game.add.tween( s.velocity ).to({ x: s.velocity.x * fac }, speed, Phaser.Easing.Circular.In, true );
						this.tweenTint( s, s.tint, 0xff0000, speed );
					}
					else if ( p == 'turbine' && s.velocity.x > 4 )
					{
						var speed = 150 * speedFac;
						var fac = 1.0 - 0.3 * scale;
						var pFac = 1.0 + 2.0 * scale;
						game.add.tween( s.position ).to({ y: this.engineTop + (s.position.y - this.engineTop)*pFac }, speed, Phaser.Easing.Circular.InOut, true );
						game.add.tween( s.velocity ).to({ x: s.velocity.x * fac }, speed, Phaser.Easing.Circular.InOut, true );
						//game.add.tween( s.scale ).to({ x: fac, y: fac }, speed, Phaser.Easing.Circular.InOut, true );
						this.tweenTint( s, s.tint, 0xffff00, speed );
					}
					else if ( p == 'nozzle' )
					{
						var speed = 300 * speedFac;
						var pFac = 1.0 - 0.23 * scale;
						game.add.tween( s.position ).to({ y: this.engineTop + (s.position.y - this.engineTop)*pFac }, speed, Phaser.Easing.Circular.InOut, true );
						//game.add.tween( s.scale ).to({ x: fac, y: fac }, speed, Phaser.Easing.Circular.InOut, true );
						//this.tweenTint( s, s.tint, 0x0000ff, speed );
					}
					else if ( p == 'afterburner' )
					{
						var speed = 300 * speedFac;
						var fac = 4;
						game.add.tween( s.velocity ).to({ x: s.velocity.x * fac }, speed, Phaser.Easing.Circular.In, true );
						//game.add.tween( s.position ).to({ y: this.engineTop + (s.position.y - this.engineTop)*2 }, speed, Phaser.Easing.Circular.InOut, true );
						//game.add.tween( s.scale ).to({ x: fac, y: fac }, speed, Phaser.Easing.Circular.InOut, true );
						this.tweenTint( s, s.tint, 0xff0000, speed );
					}
				}, null, this );

				}
			}
		}
	},

	setupKeyboardInput: function()
	{
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
	},
};


Game.prototype.setAsPreview = function ( i )
{
	this.selected = i;

	if ( this.slots.indexOf( i ) > -1 )
	{
		this.clearSlot( this.slots.indexOf( i ) );
	}

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
	{
		this.sprites[i].x = -1000;
	}
};

Game.prototype.clearSlot = function ( i )
{
	this.slots[i] = null;
	this.slotSprites[i].body.setSize( 0, 0 );
	this.updateSpeed();
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
	{
		this.clearSlot( this.slots.indexOf( s ) );
	}
	this.slots[p] = s;
	//this.slotBg[p].top += 100;

	if ( this.highlight )
		this.highlight.tint = 0xffffff;
	this.highlight = s;
	this.highlight.tint = 0xffff77;

	var left = this.positions[p][0]+padding;
	var w = this.slot_width[p]*this.SCALE-2*padding;
	var topL = this.positions[p][1]+padding - this.slot_height[p]/2*this.SCALE;
	var hL = this.slot_height[p]*this.SCALE-2*padding;
	var h = this.part_body_height[s];
	this.slotSprites[p].body.setSize( 50, h, left, topL + hL/2 - h/2 );

	this.updateSpeed();
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

	if ( getClean( this.slots ).length == 0 )
	{
		this.icon.loadTexture( null );
		this.textPartName.text = "";
		this.textPartDesc.text = "";
		this.brainText.text = "Placera en motordel i något av hålen.";
	}
	else if ( !success )
	{
		if ( text[0] == 'ERROR' )
		{
			this.icon.loadTexture( 'error' );
			this.textPartName.text = text[1];
			this.brainText.text = text[2];
			this.textPartDesc.text = "";
		}
		else if ( text[0] == 'INFO' )
		{
			this.icon.loadTexture( null );
			this.brainText.text = text[1];
		}
	}
	else
	{
		var t = findFinishedEngine( getClean( this.slots ) );
		var type = t[0];

		if ( type == 'ERROR' )
		{
			this.icon.loadTexture( 'error' );
			this.textPartDesc.text = "Propellern suger in luft i motorn. För att göra motorn mer effektiv behövs även en motordel som pressar samman luften.";
		}
		else if ( type == 'ENGINE' )
		{
			this.icon.loadTexture( 'check' );
			this.textPartName.text = t[1];
			this.textPartDesc.text = t[2];
			this.brainText.text = "Det finns fortfarande fler motorer att bygga. Prova till exempel att byta ut propellern mot en annan motordel.";
			//"Det finns fortfarande fler motorer att bygga. Du kan göra motorn mer effektiv genom att lägga till en motordel som suger in luft i motorn."
		}
		else if ( type == 'INFO' )
		{
			this.icon.loadTexture( 'info' );
			this.textPartName.text = t[1];
			this.textPartDesc.text = t[2];
		}
	}
};

Game.prototype.tweenTint = function (obj, startColor, endColor, time)
{
	var colorBlend = {step: 0};
	var colorTween = game.add.tween(colorBlend).to({step: 100}, time);

	colorTween.onUpdateCallback(function() {
		obj.tint = Phaser.Color.interpolateColor(startColor, endColor, 100, colorBlend.step);
	});

	obj.tint = startColor;
	colorTween.start();
};

Game.prototype.animate = function ()
{
	this.animationFrame = (this.animationFrame + 1) % 19;
	game.time.events.add( Phaser.Timer.SECOND / this.animationSpeed, this.animate, this );
}

Game.prototype.updateSpeed = function ()
{
	var list = [];
	for ( var i = 0; i < this.slots.length; i++ )
	{
		if ( this.slots[i] != null )
			list.push( parts[this.slots[i]] );
	}

	this.animationSpeedGoal = this.NOPOWER;

	if ( list.indexOf('combustor') != -1 && list.indexOf('turbine') != -1 && list.indexOf('combustor') < list.indexOf('turbine') )
	{
		this.animationSpeedGoal = 8;
		if ( list.indexOf('fan') == 0 )
			this.animationSpeedGoal += 4;
		if ( list.indexOf('propeller') == 0 )
			this.animationSpeedGoal += 4;
		if ( list.indexOf('compressor') == 1 )
			this.animationSpeedGoal += 8;
	}
};
