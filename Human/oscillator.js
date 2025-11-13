let isPlaying = false;
let micSource = null;
let pixelRatio, sizeOnScreen, segmentWidth;

const canvas = document.getElementById("canvas"),
	c = canvas.getContext("2d"),
	ac = new AudioContext(),
	powerBtn = document.getElementById("powerBtn"),
	analyser = new AnalyserNode(ac, { smoothingTimeConstant: 1, fftSize: 2048 }),
	dataArray = new Uint8Array(analyser.frequencyBinCount);

const resizeCanvas = () => {
	pixelRatio = window.devicePixelRatio || 1;
	sizeOnScreen = canvas.getBoundingClientRect();
	canvas.width = sizeOnScreen.width * pixelRatio;
	canvas.height = 300 * pixelRatio; // same as CSS height
	canvas.style.width = "100%";
	canvas.style.height = "300px";

	c.fillStyle = "#181818";
	c.fillRect(0, 0, canvas.width, canvas.height);
	c.strokeStyle = "#ff0000ff";
	c.beginPath();
	c.moveTo(0, canvas.height / 2);
	c.lineTo(canvas.width, canvas.height / 2);
	c.stroke();
};

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let drawAnimation;

navigator.mediaDevices.getUserMedia({ audio: true })
  .then(function (mediaStreamObj) {
    micSource = ac.createMediaStreamSource(mediaStreamObj);
    console.log("Microphone connected!");
  })
  .catch(function (err) {
    console.error(err.name, err.message);
  });

powerBtn.addEventListener("click", async () => {
  if (!isPlaying) {
    if (!micSource) {
      console.warn("Microphone not ready yet!");
      return;
    }

	if (ac.state === "suspended") {
      await ac.resume();
      console.log("AudioContext resumed");
    }

    micSource.connect(analyser);

    draw();
    powerBtn.innerHTML = "Turn Off";
    document.getElementById("led").classList.add("on");
    console.log("Microphone visualizer started.");
  } else {
    if (micSource) micSource.disconnect();
    analyser.disconnect();
    cancelAnimationFrame(drawAnimation);
    powerBtn.innerHTML = "Turn On";
    document.getElementById("led").classList.remove("on");
    console.log("Microphone visualizer stopped.");
  }
  isPlaying = !isPlaying;
});


const draw = () => {
	analyser.getByteTimeDomainData(dataArray);
	segmentWidth = canvas.width / analyser.frequencyBinCount;
	c.fillStyle = "#181818";
	c.fillRect(0, 0, canvas.width, canvas.height);
	c.beginPath();
	c.moveTo(0, canvas.height / 2);
	for (let i = 0; i < analyser.frequencyBinCount; i++) {
		let x = i * segmentWidth;
		let v = dataArray[i] / 128.0;
		let y = (v * canvas.height) / 2;
		c.lineTo(x, y);
	}
	c.strokeStyle = "#ff0000ff";
	c.stroke();
	drawAnimation = requestAnimationFrame(draw);
};
