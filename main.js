
var WIDTH = 1000;
var HEIGHT = 600;
var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, 'build-an-engine', { preload: preload, create: create, update: update });

function preload()
{
	game.load.spritesheet( 'fan', 'images/fan_sheet.png', 212, 826 );
	game.load.spritesheet( 'propeller', 'images/propeller_sheet.png', 73, 908 );
	game.load.spritesheet( 'compressor', 'images/compressor_sheet.png', 553, 470 );
	game.load.spritesheet( 'combustor', 'images/combustor_sheet.png', 802, 478 );
	game.load.spritesheet( 'turbine', 'images/turbine_sheet.png', 553, 470 );
	game.load.image( 'nozzle', 'images/nozzle.png' );
	game.load.image( 'afterburner', 'images/afterburner.png' );

	game.load.image( 'particle', 'images/particle.png' );

	game.load.bitmapFont( 'Balsamiq', 'fonts/balsamiq_regular.png', 'fonts/balsamiq_regular.fnt' ); // 72
	game.load.bitmapFont( 'BalsamiqBold', 'fonts/balsamiq_bold.png', 'fonts/balsamiq_bold.fnt' ); // 72
}


var jetDesc = "A jet engine is a reaction engine discharging a fast-moving jet that generates thrust by jet propulsion. This broad definition includes airbreathing jet engines (turbojets, turbofans, ramjets, and pulse jets) and non-airbreathing jet engines (such as rocket engines). In general, jet engines are combustion engines.";
var keys = {};
var sprites = [];
var slotBg = [];
var selected = null;
var highlight = null;
var textPartDesc;
var textPartName;

var previewIndex = 0;
var previewSprite = null;

var parts = ['fan', 'propeller', 'compressor', 'combustor', 'turbine', 'nozzle', 'afterburner'];
var partscale = [0.2, 0.3, 0.16, 0.10, 0.16, 0.15, 0.18];
var slots = [null, null, null, null, null];

var positions = [];
var slot_width = [60, 80, 80, 80, 80];
var slot_height = [85+30, 85, 85, 85, 85, 85-30];
var slot_anchor = [1.0, 0.5, 0.5, 0.5, 0.0];
var scale = 1.5;


function create()
{
	game.stage.backgroundColor = '#ffffff';


	var box = [585, 30, WIDTH-585, 200];

	var bar = game.add.graphics();
	bar.beginFill( 0x000000, 0.2 );
	bar.drawRect( box[0], box[1], box[2], box[3] );
	bar.endFill();

	var padding = 0;
	textPartName = game.add.bitmapText( 0, 0, 'BalsamiqBold', 'Name', 32 );
	textPartName.x = box[0] + padding;
	textPartName.y = box[1] + padding;

	var sep = 48;
	textPartDesc = game.add.bitmapText( 0, 0, 'Balsamiq', 'Description', 24 );
	textPartDesc.x = box[0] + padding;
	textPartDesc.y = box[1] + padding + sep;
	textPartDesc.maxWidth = box[2] - 2*padding - sep;

	var startLeft = WIDTH * 1/16;
	var startTop = HEIGHT/2;
	var width = slot_width.reduce((a, b) => a + b, 0);

	var left = startLeft;
	var top = startTop;
	for ( var i = 0; i < slots.length; i++ )
	{
		positions.push( [left, top] );
		left += scale * slot_width[i];
	}

	var thick = 15;
	var bar = game.add.graphics();
	bar.beginFill( 0x333333, 1.0 );
	var barLeft = startLeft + scale * slot_width[0]/2;
	var barWidth = width - slot_width[0]/2 - slot_width[slots.length-1] - slot_width[slots.length-2]/2;
	bar.drawRect( barLeft, startTop - thick/2, scale * barWidth, thick );
	bar.endFill();


	for ( var i = 0; i < slots.length; i++ )
	{
		var p = positions[i];

		var box = game.add.graphics();
		slotBg.push( box );
		box.beginFill( 0x000000, 0.1 );
		var padding = 5;
		var left = p[0]+padding;
		var w = slot_width[i]*scale-2*padding;
		var topL = p[1]+padding - slot_height[i]/2*scale;
		var hL = slot_height[i+1]*scale-2*padding;
		var topR = p[1]+padding - slot_height[i+1]/2*scale;
		var hR = slot_height[i]*scale-2*padding;
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
		s.events.onInputDown.add( function() {
			remove( slots[this.index] );
			setAtPosition( this.index, previewIndex );
			//game.add.tween(this).to({
			//	alpha: 0.8,
			//}, 200, Phaser.Easing.Exponential.Out, true, 0, 0, true);
		}, s);
	}


	var size = 100;
	var preview = game.add.sprite( WIDTH - size, HEIGHT - size, null );

	var box = game.add.graphics();
	box.beginFill( 0xffff00, 0.5 );
	//box.drawRect( 0, 0, size, size );
	box.drawCircle( size/2, size/2, size );
	box.endFill();
	preview.addChild( box );

	previewSprite = game.add.sprite( size/2, size/2, parts[previewIndex], 0 );
	previewSprite.anchor.set( 0.5, 0.5 );
	previewSprite.scale.set( size / game.cache.getImage( parts[previewIndex] ).height );
	preview.addChild( previewSprite );

	preview.inputEnabled = true;
	preview.events.onInputDown.add( function() {
		previewIndex = (previewIndex + 1) % parts.length;
		previewSprite.loadTexture( parts[previewIndex], 0 );
		previewSprite.scale.set( size / game.cache.getImage( parts[previewIndex] ).height );
	}, this);


	//drawLine();


	for ( var i = 0; i < parts.length; i++ )
	{
		var s = game.add.sprite( 0, 0, parts[i], 0 );
		sprites.push( s );
		s.scale.set( partscale[i] * scale );

		s.animations.add( 'run', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18], 20, true );
		s.animations.play( 'run' );

		remove( i );
	}

	for ( var i = 0; i < slots.length; i++ )
	{
		var p = positions[i];

		var style = { font: "bold 32px Helvetica", fill: "#e54", boundsAlignH: "center", boundsAlignV: "middle" };
		var t = game.add.text( p[0], p[1] - slot_height[i]/2*scale, i+1, style );
		t.setShadow( 2, 2, 'rgba(0,0,0,1)', 0 );
	}


	for ( var i = 0; i < 7; i++ )
		keys[i] = [];

	keys[0][0] = game.input.keyboard.addKey( Phaser.Keyboard.ONE );
	keys[1][0] = game.input.keyboard.addKey( Phaser.Keyboard.TWO );
	keys[2][0] = game.input.keyboard.addKey( Phaser.Keyboard.THREE );
	keys[3][0] = game.input.keyboard.addKey( Phaser.Keyboard.FOUR );
	keys[4][0] = game.input.keyboard.addKey( Phaser.Keyboard.FIVE );

	keys[0][1] = game.input.keyboard.addKey( Phaser.Keyboard.Q );
	keys[1][1] = game.input.keyboard.addKey( Phaser.Keyboard.W );
	keys[2][1] = game.input.keyboard.addKey( Phaser.Keyboard.E );
	keys[3][1] = game.input.keyboard.addKey( Phaser.Keyboard.R );
	keys[4][1] = game.input.keyboard.addKey( Phaser.Keyboard.T );
	keys[5][1] = game.input.keyboard.addKey( Phaser.Keyboard.Y );
	keys[6][1] = game.input.keyboard.addKey( Phaser.Keyboard.U );


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
}

function update()
{
	for ( var i = 0; i < slots.length; i++ )
	{
		if ( keys[i][0].justDown )
		{
			if ( selected != null )
			{
				remove( slots[i] );
				setAtPosition( i, selected );
				selected = null;
			}
			else
			{
				remove( slots[i] );
				slots[i] = null;
			}
		}
	}

	for ( var i = 0; i < parts.length; i++ )
	{
		if ( keys[i][1].justDown )
		{
			if ( selected == null )
			{
				setAsPreview( i );
			}
			else if ( selected == i )
			{
				remove( selected );
				selected = null;
			}
			else
			{
				remove( selected );
				setAsPreview( i );
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
}

function setAsPreview( i )
{
	selected = i;

	if ( slots.indexOf( i ) > -1 )
		slots[slots.indexOf( i )] = null;

	sprites[i].tint = 0xffffff;
	sprites[i].alpha = 1.0;
	sprites[i].scale.set( partscale[i] * scale / 3 );
	sprites[i].anchor.set( 0.0 );
	sprites[i].x = 0;
	sprites[i].y = scale / 4;
}

function remove( i )
{
	if ( i != null )
		sprites[i].x = -1000;
}

function setAtPosition( p, s )
{
	if ( partData[parts[s]]['allowed'].indexOf( p+1 ) == -1 )
	{
		sprites[s].tint = 0xff7777;
		sprites[s].alpha = 0.75;
	}
	else
	{
		sprites[s].tint = 0xffffff;
		sprites[s].alpha = 1.0;
	}

	var padding = 10;
	sprites[s].position.x = positions[p][0] + scale * ( padding + ( slot_width[p] - 2*padding ) * slot_anchor[p] );
	sprites[s].position.y = positions[p][1];
	sprites[s].scale.set( partscale[s] * scale );
	sprites[s].anchor.set( slot_anchor[p], 0.5 );

	if ( slots.indexOf( s ) > -1 )
		slots[slots.indexOf( s )] = null;
	slots[p] = s;
	//slotBg[p].top += 100;

	highlight = s;
	textPartName.text = description[parts[s]]['name'];
	textPartDesc.text = description[parts[s]]['desc'];
}


function drawLine() {
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
		var p = bezierPoint(pointsArray[0], pointsArray[1], pointsArray[2], pointsArray[3], i);
		bezierGraphics.lineTo(p.x, p.y);
	}
}

function bezierPoint(p0, p1, p2, p3, t) {
	var cX = 3 * (p1.x - p0.x);
	var bX = 3 * (p2.x - p1.x) - cX;
	var aX = p3.x - p0.x - cX - bX;
	var cY = 3 * (p1.y - p0.y);
	var bY = 3 * (p2.y - p1.y) - cY;
	var aY = p3.y - p0.y - cY - bY;
	var x = (aX * Math.pow(t, 3)) + (bX * Math.pow(t, 2)) + (cX * t) + p0.x;
	var y = (aY * Math.pow(t, 3)) + (bY * Math.pow(t, 2)) + (cY * t) + p0.y;
	return {x: x, y: y};	
}
