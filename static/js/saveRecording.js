var arrayRecord = [];
var dataStream = [];
var recording = false;
let fmp4Data;

function arrayConcat(inputArray) {
    // concat array by creating array that goes from start to end of selected frames
    var totalLength = inputArray.reduce( function(prev,cur) { return prev+cur.length} ,0);
    var result = new Uint8Array(totalLength);
    var offset = 0;
    inputArray.forEach(function(element) {
        result.set(element, offset);
        offset += element.length;
    });
    console.log(result)
    console.log(typeof result)
    return result;
}

function downloadMP4(data) {
    // create blob from array of frames and save it to client pc
    console.log('downloading...');
    console.log(data)
    var blob = new Blob([arrayConcat(data)], {type: 'video/mp4'});
    var filename = 'video-' + new Date().toISOString() + '.mp4';
    saveAs(blob,filename);
    arrayRecord = [];
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

function stopRecord() {
    // stop recording and download mp4 of current array
    console.log('stopping recording')
    recording = false;
    console.log(dataStream)
    console.log('downloading buffer')
    downloadMP4(dataStream);
    return false;
}

function startRecord(hls) {
    // start recording
    console.log('recording is true')
    recording = true;
}

function createfMP4(type) {
    console.log('createfMP4')
    if (fmp4Data[type].length) {
      const blob = new Blob([arrayConcat(fmp4Data[type])], {
        type: 'application/octet-stream',
      });
      const filename = type + '-' + new Date().toISOString() + '.mp4';
      self.saveAs(blob, filename);
      // $('body').append('<a download="hlsjs-' + filename + '" href="' + self.URL.createObjectURL(blob) + '">Download ' + filename + ' track</a><br>');
    } else if (!recording) {
      console.error(
        'Check "Dump transmuxed fMP4 data" first to make appended media available for saving.'
      );
    }
  }

function startHLS() {
    // start stream by attaching the video to hls and starting stream video
    console.log('starting HLS')
    var config = {backBufferLength: 0}
    var hls = new Hls(config);
    var video = document.getElementById('video');
    var videoSrc = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
    hls.attachMedia(video);
    hls.loadSource(videoSrc);
    // var dataStream = {'video': [], 'audio': []};
    // var startStream = {'video': [], 'audio': []};
    this.fragments = [];
    self.fmp4Data = fmp4Data = {
      audio: [],
      video: [],
    };

    // when stream ready, start pushing to recording array
    // manifest is video source that is only fired once
    hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
        console.log('manifest parsed')
    });

    // on loading new buffer, add frames to array if recording
    // buffer is added frequently, to preprocess video before it is played
    // hls.on(Hls.Events.BUFFER_APPENDING, function (event, data) {
    //     if (recording == true) {
    //         console.log('pushing buffer video data to array...');
    //         console.log(data);
    //         console.log(data.data);
    //         startStream[data.type].push(data.data);
    //         arrayRecord.push({hls: hls, data: startStream});
    //         console.log(data.type);
    //         console.log(data.data);
    //         dataStream[data.type].push(data.data);
    //         recording = false;
    //     }
    // });

    hls.on(Hls.Events.BUFFER_APPENDING, function (event, data) {
        console.log('buffer appended')
        console.log(recording)
        if (recording) {
            try {
                console.log('pushing data')
                fmp4Data[data.type].push(data.data);
            }
            catch(err) {
                console.log(err.message)
            }
        }
    });
    // hls.on(Hls.Events.FRAG_CHANGED, (event, data) => {
    //     console.log('frag changed')
        
    //     if (recording == true) {
    //         try {
    //             console.log(data.frag.sn)
    //             let recdata = this.fragments[data.frag.sn]
    //             console.log(recdata)
    //             console.log(recdata.frag)
    //             let dataToRecord = recdata.tracks.video.initSegment
    //             console.log(dataToRecord)
    //             this.dataStream.push(new Uint8Array(dataToRecord))
    //         }
    //         catch(err) {
    //             console.log(err.message)
    //         }
    //     }
    // });
    // hls.on(Hls.Events.FRAG_PARSING_INIT_SEGMENT, (event, data) => {
    //     console.log("HLS Player Frag Parsing Data")
    //     //console.log("Data = " + inspect(data))
    //     this.fragments[data.frag.sn]=data
    //     console.log("saved sn(" + data.frag.sn + ") - fragment")
    // })

    // hls.on(Hls.Events.FRAG_CHANGED, (event, data) => {
    //     console.log("HLS Player Frag Changed")
    //     //console.log("Data = " + inspect(data))
    //     if (recording) {
    //         console.log("pushing video data to array...")
    //         let recdata = fragments[data.frag.sn]
    //         let dataToRecord = [...recdata.moov]
    //         dataStream.push(dataToRecord);
    //         arrayRecord.push({hls: hls, data: dataStream});
    //         console.log("recording video data sn(" + data.frag.sn+ ") " + dataToRecord.length + " bytes  ...")
    //     }
    // })
    // hls.on(Hls.Events.FRAG_PARSING_INIT_SEGMENT, (event, data) => {
    //     console.log("HLS Player Frag Parsing Data")
    //     //console.log("Data = " + inspect(data))
    //     fragments[data.frag.sn]=data
    //     console.log("saved sn(" + data.frag.sn + ") - fragment")
    // })
    
    arrayRecord.push({hls: hls, data: dataStream});
    video.onended = function (e) { stopRecord() };
}
