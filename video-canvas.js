const fps = 24;

const video = document.querySelector( 'video#video1' );
const video2 = document.querySelector( 'video#video2' );
const canvas = document.querySelector( 'canvas#video' );
const cache = document.querySelector( 'canvas#cache' );

const playButton = document.querySelector( 'button#play' );
const scrub = document.querySelector( 'input#scrub' );
const frames = document.querySelector( 'datalist#frames' );
const volume = document.querySelector( 'input#volume' );
const rate = document.querySelector( 'input#rate' );
const syncPlayback = document.querySelector( 'input#sync-playback' );
const syncVideo1 = document.querySelector( 'input[value="video"]' );
const ghosting = document.querySelector( 'input#ghosting' );
const clearCacheButton = document.querySelector( 'button#clear-cache' );

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

function clearCache() {
	canvasCache = [];
}

function cacheFrame() {
	let frame = Math.floor( video.currentTime * fps );
	if ( ! canvasCache[ frame ]) {
		let c1 = document.createElement( 'canvas' );
		c1.width = canvas.width;
		c1.height = canvas.height;
		let c2 = c1.getContext( '2d' );
		c2.drawImage( syncVideo1.checked ? video : video2, 0, 0, canvas.width, canvas.height );
		canvasCache[ frame ] = c1;
	}
}

function ghost(frame, min, max, opacity) {
	ctx2.globalAlpha = opacity;
	let a = Math.min(min, max);
	let b = Math.max(min, max);

	for ( let i = a; i <= b; i++ ) {
		let f1 = (frame + i) % canvasCache.length;
		let f2 = (frame - i);
		if ( f2 < 0 ) {
			f2 = canvasCache.length - f2;
		}
		if ( canvasCache[ f2 ] ) {
			ctx2.drawImage( canvasCache[ f2 ], 0, 0, cache.width, cache.height );
		}
		if ( canvasCache[ f1 ] ) {
			ctx2.drawImage( canvasCache[ f1 ], 0, 0, cache.width, cache.height );
		}
	}

}

function videoToCanvas() {
	let frame = Math.floor( video.currentTime * fps );
	if ( canvasCache[ frame ] ) {
		cache.classList.remove( 'missing' );
		ctx2.globalAlpha = 1;
		ctx2.drawImage( canvasCache[ frame ], 0, 0, cache.width, cache.height );
		// ghosting
		if ( ghosting.checked ) {
			ghost( frame, 2, 2, 0.3 );
			ghost( frame, 4, 4, 0.1 );
		}
	} else {
		cache.classList.add( 'missing' );
		cacheFrame();
	}
	ctx.drawImage( syncVideo1.checked ? video : video2, 0, 0, canvas.width, canvas.height );
}

function initScrub() {
	scrub.max = Math.ceil( video.duration * fps );
	for (let i = 1; i < scrub.max; i++) {
		let option = document.createElement( 'option' );
		option.value = i;
		frames.appendChild( option );
	}
}

function setScrub() {
	scrub.value = Math.floor( video.currentTime * fps );
}

let seek = video.fastSeek ? function() {
	video.fastSeek( scrub.valueAsNumber / fps );
	video2.fastSeek( scrub.valueAsNumber / fps );
} : function() {
	video.currentTime = scrub.valueAsNumber / fps;
	video2.currentTime = scrub.valueAsNumber / fps;
}

function pause() {
	video.pause();
	video2.pause();
	sync.scrub = false;
}

function play() {
	sync.scrub = true;

	video.play();
	video2.play();
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

playButton.addEventListener( 'click', playPause );
video.addEventListener( 'click', playPause );
video2.addEventListener( 'click', playPause );
canvas.addEventListener( 'click', playPause );
cache.addEventListener( 'click', playPause );

scrub.addEventListener( 'mousedown', pause );
scrub.addEventListener( 'input', seek );

volume.addEventListener( 'change', setVolume );

rate.addEventListener( 'change', setSpeed );

clearCacheButton.addEventListener( 'click', clearCache );

function animate() {
	if ( sync.scrub ) {
		setScrub();
	}
	if ( syncPlayback.checked || video.paused ) {
		videoToCanvas();
	}
	if ( ! scrub.max && video.duration ) {
		initScrub();
	}

	requestAnimationFrame( animate );
}

animate();
