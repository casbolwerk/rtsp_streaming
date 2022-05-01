let dumpfMP4 = false;

let fmp4Data;

let latestInitSegment;

function startRecord(hls) {
	// start recording
	console.log('recording is true')
	dumpfMP4 = true;
}

function stopRecord() {
	// stop recording and download mp4 of current array
	console.log('stopping recording')
	dumpfMP4 = false;
	console.log('downloading buffer')
	createfMP4('video')
	return false;
}

function setupGlobals() {
	self.fmp4Data = fmp4Data = {
		audio: [],
		video: [],
	};
	self.createfMP4 = createfMP4;
}

function startHLS() {
  
	console.log('starting HLS')
	var hlsConfig = {backBufferLength: 0}
	var video = document.getElementById('video');
	var videoSrc = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

	setupGlobals();
	self.hls = hls = new Hls(hlsConfig);

	hls.loadSource(videoSrc);
	hls.attachMedia(video);

	hls.on(Hls.Events.BUFFER_APPENDING, function (eventName, data) {
		console.log(data)
		// console.log('buffer appending')
		if (dumpfMP4) {
			console.log('dumpfMP4')
			console.log(data.data)
			fmp4Data[data.type].push(new Uint8Array([...data.data]));
		}
	});

	hls.on(Hls.Events.FRAG_PARSING_INIT_SEGMENT, function (eventName, data) {
		console.log("HLS Player Frag Parsing Init Segment")
		if (data && data.tracks && data.tracks.video && data.tracks.video.initSegment)
		{
			latestInitSegment = data.tracks.video.initSegment
			console.log("saved init segment " + this.latestInitSegment.length + " bytes")
		}
	});

	hls.on(Hls.Events.FRAG_PARSED, function (eventName, data) {
		console.log('FRAG PARSED')
		console.log(data)
		// fmp4Data['video'].push(data.tracks.video);
		// fmp4Data['audio'].push(data.tracks.audio);
	});

	hls.on(Hls.Events.FRAG_PARSING_DATA, function (eventName, data) {
		console.log('FRAG PARSING NOW')
		console.log(data)
		// fmp4Data['video'].push(data.tracks.video);
		// fmp4Data['audio'].push(data.tracks.audio);
	});
}

function createfMP4(type) {
	if (fmp4Data[type].length) {
		console.log(fmp4Data[type])
		const blob = new Blob([arrayConcat(fmp4Data[type])], {
			type: 'video/mp4',
		});
		const filename = type + '-' + new Date().toISOString() + '.mp4';
		self.saveAs(blob, filename);
		// $('body').append('<a download="hlsjs-' + filename + '" href="' + self.URL.createObjectURL(blob) + '">Download ' + filename + ' track</a><br>');
	} else if (!dumpfMP4) {
		console.error(
			'Check "Dump transmuxed fMP4 data" first to make appended media available for saving.'
		);
	}
}

function arrayConcat(inputArray) {
	// Get the total length of all arrays.
	let length = 0;
	inputArray.forEach(item => {
	length += item.length;
	});

	// Create a new array with total length and merge all source arrays.
	let mergedArray = new Uint8Array(length);
	let offset = 0;
	inputArray.forEach(item => {
	mergedArray.set(item, offset);
	offset += item.length;
	});

	// reduce length of merged array to remove any trailing 0s
	while (mergedArray[mergedArray.length - 1] === 0) {
	mergedArray.pop();
	}

	return mergedArray;
}

function saveAs(blob, filename) {
    // create save as popup that saves the mp4 file
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}