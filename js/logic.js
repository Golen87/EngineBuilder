// allowed: Position 1-6 of slots
var SLOTS = 5;

var partData = {
	'fan': {
		'name': 'Fanb',
		'allowed': [1]
	},
	'propeller': {
		'name': 'Prop',
		'allowed': [1]
	},
	'compressor': {
		'name': 'Comp',
		'allowed': [2,3,4]
	},
	'combustor': {
		'name': 'Comb',
		'allowed': [2,3,4]
	},
	'turbine': {
		'name': 'Turb',
		'allowed': [2,3,4]
	},
	'nozzle': {
		'name': 'Nozz',
		'allowed': [5]
	},
	'afterburner': {
		'name': 'Burn',
		'allowed': [5]
	},
};

var parts = Object.keys(partData);

var uniqueCases = [];
var validCount = 0;
var successCount = 0;


function getName( part )
{
	if ( part in partData )
		return partData[parts[part]]['name']
	return '-'
}

function compareEngine( pps, seq )
{
	for ( var i = 0; i < seq.length; i++ )
	{
		if ( pps[i] != seq[i] )
		return false;
	}
	return true;
}

function findFinishedEngine( pps )
{
	if ( compareEngine( pps, [2,3,4,5] ) )
	{
		return [
			"ENGINE",
			"Grattis! Du har byggt\nen turbojetmotor!",
			"De första jetmotorerna som uppfanns var turbojetmotorer och fanns bland annat i den tyska flygplansmodellen Henkel He 178 år 1939.Det hade en maxhastighet på 598 km/h, så att flyga mellan Linköping och Stockholm med det planet skulle ta cirka 20 minuter. Samma sträcka skulle ta ungefär 2 timmar att resa med bil.",
		];
	}
	if ( compareEngine( pps, [0,2,3,4,5] ) )
	{
		return [
			"ENGINE",
			"Grattis! Du har byggt\nen turbofläktmotor!",
			"Turbofläktmotorer är lika jetmotorer men har även en fläkt som suger in luft i motorn. Eftersom mycket av luften inte passerar genom motorns kompressor skapas en större drivkraft utan att förbruka lika mycket bränsle som andra motorer. Turbofläktmotorer används i de flesta större trafikflygplan som exempelvis Boeing 747 som kan nå hastigheter av 920 km/h. Att resa mellan Linköping och Stockholm med det planet skulle bara ta cirka 14 minuter. Samma resa med bil tar ungefär 2 timmar.",
		];
	}
	if ( compareEngine( pps, [1,2,3,4,5] ) )
	{
		return [
			"ENGINE",
			"Grattis! Du har byggt\nen turbopropmotor!",
			"Turbopropmotorer är lika turbojetmotorer men har även en propeller monterad i fram som suger in luft i motorn. Turbopropmotorer använder mycket bränsle men är också väldigt kraftfulla och tillförlitliga. De används ofta i mindre trafikflygplan som ATR 72 som kan flyga i hastigheter runt 500 km/h. Att flyga från Linköping till Stockholm i ett sådant plan skulle ta cirka 24 min. Att färdas samma sträcka med bil tar ungefär 2 timmar.",
		];
	}

	return [
		"ERROR",
		"Hoppsan! Den delen kan inte monteras där!",
		"Prova att montera delen på en annan plats.",
	];
}

function simulate( pps, airflow=1.0, hot=false )
{
	if ( pps.length <= 0 )
	{
		if ( !hot )
			throw ["INFO", "För att motorn ska få någon kraft behövs även en del som blandar bränsle med luften och antänder den."];
		return;
	}

	var part = pps.shift();

	if ( part == 0 ) // fan
	{
	}
	if ( part == 1 ) // propeller
	{
	}
	if ( part == 2 ) // compressor
	{
		airflow /= 2;
	}
	if ( part == 3 ) // combustor
	{
		hot = true;
		//if ( airflow >= 1.0 )
		//	throw 'Combustion engine requires compressed air.';
	}
	if ( part == 4 ) // turbine
	{
		//if ( airflow >= 1.0 )
		//	throw 'Turbine requires compressed air.';
		airflow *= 2
	}
	if ( part == 5 ) // nozzle
	{
	}
	if ( part == 6 ) // burn
	{
		hot = true;
	}
	simulate( pps, airflow, hot );
}

function getClean( input )
{
	var clean = input.slice();
	var i = clean.indexOf( null );
	while ( i > -1 )
	{
		clean.splice(i, 1);
		i = clean.indexOf( null );
	}
	return clean;
}

// @param input: ('part1', 'part2', ...)
function isValid( input, unique )
{
	// Filters physical limitations (when a user places a piece that shouldn't fit or cheating the RFID.)
	input.forEach(function(slot) {
		if ( slot != null )
			if ( partData[parts[slot]]['allowed'].indexOf( input.indexOf(slot)+1 ) == -1 )
				throw ["ERROR", "Hoppsan!", "Den här motordelen kan inte monteras där. Prova att sätta den på en annan plats."];
	});
	validCount += 1

	// Filters unique cases, removing empty slots
	var clean = getClean( input )
	var key = clean.toString();
	if ( unique )
	{
		if ( uniqueCases.indexOf( key ) == -1 )
			uniqueCases.push( key )
		else
			throw 'Case already covered.';
	}

	simulate( clean )

	return true;
}

function tryInput( input, unique=false )
{
	try
	{
		isValid( input, unique );
		successCount += 1;
		var clean = getClean( input );
		return [true, clean];
	}
	catch( error )
	{
		return [false, error];
	}
}

function findPermutations( parts, slot=1 )
{
	var result = [];
	if ( slot <= SLOTS )
	{
		var plist = parts.concat(null);
		for ( var i = 0; i < plist.length; i++ )
		{
			var remain = parts.slice();
			if ( plist[i] )
				remain.splice( remain.indexOf( plist[i] ), 1 );
			var perms = findPermutations( remain, slot+1 );
			for ( var j = 0; j < perms.length; j++ )
			{
				result.push( [plist[i]].concat(perms[j]) );
			};
		}
	}
	else
	{
		result.push( [] );
	}
	return result;
}


if ( false )
{
	var perms = findPermutations( parts );
	perms.forEach(function(p) {
		// ie. ( None, 'Fan', None, None, 'Ńozzle', None )
		tryInput( p, true );
	});

	var totalCount = perms.length;
	console.log( 'Success:', successCount );
	console.log( ' Unique:', uniqueCases.length );
	console.log( '  Valid:', validCount );
	console.log( '  Total:', totalCount );
	console.log();
}
