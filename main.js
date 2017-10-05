
var WIDTH = 1000;
var HEIGHT = 600;
var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, 'build-an-engine', { preload: preload, create: create, update: update });

function preload()
{
	game.load.spritesheet( 'fan', 'images/fan_sheet.png', 212, 826 );
	game.load.spritesheet( 'propeller', 'images/propeller_sheet.png', 73, 908 );
	game.load.image( 'compressor', 'images/compressor.png' );
	game.load.image( 'combustor', 'images/combustor.png' );
	game.load.image( 'turbine', 'images/turbine.png' );
	game.load.image( 'nozzle', 'images/nozzle.png' );
	game.load.image( 'afterburner', 'images/afterburner.png' );

	game.load.image( 'particle', 'images/particle.png' );
}


var jetDesc = "A jet engine is a reaction engine discharging a fast-moving jet that generates thrust by jet propulsion. This broad definition includes airbreathing jet engines (turbojets, turbofans, ramjets, and pulse jets) and non-airbreathing jet engines (such as rocket engines). In general, jet engines are combustion engines.";
var keys = {};
var sprites = [];
var selected = null;
var textObj;

var parts = ['fan', 'propeller', 'compressor', 'combustor', 'turbine', 'nozzle', 'afterburner'];
var partscale = [0.2, 0.3, 1.0, 1.0, 1.0, 1.0, 1.0];
var slots = [null, null, null, null, null];

var positions = [];
var slot_width = [80, 55, 55, 55, 80];
var slot_height = [95+20, 95, 95, 95, 95, 95-20];
var slot_anchor = [1.0, 0.5, 0.5, 0.5, 0.0];
var scale = 1.5;


function create()
{
	game.stage.backgroundColor = '#ffffff';


	var box = [WIDTH - 300 - 50, 50, 300, 400];
	var padding = 10;

	var bar = game.add.graphics();
	bar.beginFill( 0x000000, 0.2 );
	bar.drawRect( box[0], box[1], box[2], box[3] );
	bar.endFill();

	var style = { font: "bold 16px Helvetica", fill: "#222", boundsAlignH: "center", boundsAlignV: "middle" };
	textObj = game.add.text( 0, 0, jetDesc, style );
	textObj.setShadow( 1, 1, 'rgba(0,0,0,0.5)', 2 );
	textObj.setTextBounds( box[0]+padding, box[1]+padding, box[2]-2*padding, box[3]-2*padding );
	textObj.wordWrap = true;
	textObj.wordWrapWidth = box[2] - 2*padding;

	var left = WIDTH * 1/16;
	var top = HEIGHT/2;
	var width = slot_width.reduce((a, b) => a + b, 0);

	var thick = 15;
	var padding = 60 * scale;
	var bar = game.add.graphics();
	bar.beginFill( 0x333333, 1.0 );
	bar.drawRect( left + padding, HEIGHT/2 - thick/2, width * scale - 2*padding, thick );


	for ( var i = 0; i < slots.length; i++ )
	{
		positions.push( [left, top] );
		left += scale * slot_width[i];
	}

	for ( var i = 0; i < slots.length; i++ )
	{
		var p = positions[i];

		var box = game.add.graphics();
		box.beginFill( 0x000000, 0.1 );
		var padding = 5;
		var left = p[0]+padding;
		var topL = p[1]+padding - slot_height[i]/2*scale;
		var topR = p[1]+padding - slot_height[i+1]/2*scale;
		var poly = new Phaser.Polygon([
			new Phaser.Point( left, topL ),
			new Phaser.Point( left + slot_width[i]*scale-2*padding, topR ),
			new Phaser.Point( left + slot_width[i]*scale-2*padding, topR + slot_height[i+1]*scale-2*padding ),
			new Phaser.Point( left, topL + slot_height[i]*scale-2*padding )
		]);
		box.drawPolygon(poly.points);
		box.endFill();
	}

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
				setAtPosition( i );
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

function setAtPosition( p )
{
	if ( partData[parts[selected]]['allowed'].indexOf( p+1 ) == -1 )
	{
		sprites[selected].tint = 0xff7777;
		sprites[selected].alpha = 0.75;
	}
	else
	{
		sprites[selected].tint = 0xffffff;
		sprites[selected].alpha = 1.0;
	}

	var padding = 10;
	sprites[selected].position.x = positions[p][0] + scale * ( padding + ( slot_width[p] - 2*padding ) * slot_anchor[p] );
	sprites[selected].position.y = positions[p][1];
	sprites[selected].scale.set( partscale[selected] * scale );
	sprites[selected].anchor.set( slot_anchor[p], 0.5 );

	slots[p] = selected;
	selected = null;
}
