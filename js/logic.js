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
	console.log( pps, seq );
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
			"Turbojetmotor",
			"De första jetmotorerna som uppfanns var turbojetmotorer och fanns bland annat i den tyska flygplansmodellen Henkel He 178 år 1939.\nDet hade en maxhastighet på 598 km/h, så att flyga mellan Linköping och Stockholm med det planet skulle ta cirka 20 minuter. Samma sträcka skulle ta ungefär 2 timmar att resa med bil.",
		];
	}
	if ( compareEngine( pps, [0,2,3,4,5] ) )
	{
		return [
			"Turbofläktmotor",
			"De första jetmotorerna som uppfanns var turbojetmotorer och fanns bland annat i den tyska flygplansmodellen Henkel He 178 år 1939.\nDet hade en maxhastighet på 598 km/h, så att flyga mellan Linköping och Stockholm med det planet skulle ta cirka 20 minuter. Samma sträcka skulle ta ungefär 2 timmar att resa med bil.",
		];
	}
	if ( compareEngine( pps, [1,2,3,4,5] ) )
	{
		return [
			"Turbopropmotor",
			"De första jetmotorerna som uppfanns var turbojetmotorer och fanns bland annat i den tyska flygplansmodellen Henkel He 178 år 1939.\nDet hade en maxhastighet på 598 km/h, så att flyga mellan Linköping och Stockholm med det planet skulle ta cirka 20 minuter. Samma sträcka skulle ta ungefär 2 timmar att resa med bil.",
		];
	}

	return [
		"Okänd modell",
		"...",
	];
}

function simulate( pps, airflow=1.0, hot=false )
{
	if ( pps.length <= 0 )
		return;
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
		if ( airflow >= 1.0 )
			throw 'Combustion engine requires compressed air.';
	}
	if ( part == 4 ) // turbine
	{
		if ( airflow >= 1.0 )
			throw 'Turbine requires compressed air.';
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
		if ( slot )
			if ( partData[parts[slot]]['allowed'].indexOf( input.indexOf(slot)+1 ) == -1 )
				throw 'Invalid placement.';
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
