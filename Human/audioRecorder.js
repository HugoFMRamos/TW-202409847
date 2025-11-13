let audioIN = { audio: true };

navigator.mediaDevices.getUserMedia(audioIN)
  .then(function (mediaStreamObj) {
    let start = document.getElementById('btnStart');
    let stop = document.getElementById('btnStop');
    let playAudio = document.getElementById('audioPlay');
    let mediaRecorder = new MediaRecorder(mediaStreamObj);

    let dataArray = [];

    start.addEventListener('click', function () {
      dataArray = [];
      mediaRecorder.start();
      console.log("Recording started");
    });

    stop.addEventListener('click', function () {
      mediaRecorder.stop();
      console.log("Recording stopped");
    });

    mediaRecorder.ondataavailable = function (ev) {
      dataArray.push(ev.data);
    };

    mediaRecorder.onstop = function () {
      let audioData = new Blob(dataArray, { type: 'audio/mp3;' });
      let audioSrc = window.URL.createObjectURL(audioData);
      playAudio.src = audioSrc;
    };
  })
  .catch(function (err) {
    console.error(err.name, err.message);
  });
