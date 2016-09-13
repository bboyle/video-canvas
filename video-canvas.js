const fps = 24;

const video = document.querySelector( 'video' );
const canvas = document.querySelector( 'canvas#video' );
const cache = document.querySelector( 'canvas#cache' );
const scrub = document.querySelector( 'input[name="scrub"]' );
const volume = document.querySelector( 'input[name="volume"]' );
const rate = document.querySelector( 'input[name="rate"]' );
const syncPlayback = document.querySelector( 'input[name="sync-playback"]' );

let sync = {
	scrub: true
};

let canvasCache = [];

// this fixes scale quality on canvas!
canvas.width = 640;
canvas.height = 360;
cache.width = 640;
cache.height = 360;

const ctx = canvas.getContext( '2d' );
const ctx2 = cache.getContext( '2d' );

function cacheFrame() {
	let frame = Math.floor( video.currentTime * fps );
	if ( ! canvasCache[ frame ]) {
		let c1 = document.createElement( 'canvas' );
		c1.width = canvas.width;
		c1.height = canvas.height;
		let c2 = c1.getContext( '2d' );
		c2.drawImage( video, 0, 0, canvas.width, canvas.height );
		canvasCache[ frame ] = c1;
	}
}

function videoToCanvas() {
	let frame = Math.floor( video.currentTime * fps );
	if ( canvasCache[ frame ] ) {
		cache.classList.remove( 'missing' );
		ctx2.drawImage( canvasCache[ frame ], 0, 0, cache.width, cache.height );
	} else {
		cache.classList.add( 'missing' );
		cacheFrame();
	}
	ctx.drawImage( video, 0, 0, canvas.width, canvas.height );
}

function setScrub() {
	scrub.max = Math.ceil( video.duration * fps );
	scrub.value = Math.floor( video.currentTime * fps );
}

let seek = video.fastSeek ? function() {
	video.fastSeek( scrub.valueAsNumber / fps );
} : function() {
	video.currentTime = scrub.valueAsNumber / fps;
}

function pause() {
	video.pause();
	sync.scrub = false;
}

function play() {
	sync.scrub = true;

	video.play();
}

function playPause() {
	if ( ! video.paused ) {
		pause();
	} else {
		play()
	}
}

function setVolume() {
	video.volume = volume.valueAsNumber;
}

function setSpeed() {
	if ( rate.validity.valid ) {
		video.playbackRate = rate.valueAsNumber;
	}
}

video.preservesPitch = true;
video.webkitPreservesPitch = true;
video.mozPreservesPitch = true;

video.addEventListener( 'click', playPause );

scrub.addEventListener( 'mousedown', pause );
scrub.addEventListener( 'input', seek );

volume.addEventListener( 'change', setVolume );

rate.addEventListener( 'change', setSpeed );


function animate() {
	if ( sync.scrub ) {
		setScrub();
	}
	if ( syncPlayback.checked || video.paused ) {
		videoToCanvas();
	}

	requestAnimationFrame( animate );
}

animate();
