const URL = "https://teachablemachine.withgoogle.com/models/sOau28EB6/";
  let model = null,
    webcam = null,
    maxPredictions = 0;
  let isCameraActive = false;
  let isReadingReady = 0;
  let controlPose = "Idle";
  let modelLoaded = false;
  let webcamInitialized = false;
  // const camWidth = 192 * 2;
  // const camWidth = 108 * 2;
  const camWidth = 150 * 2;
  const camHeight = 150 * 2;
  const videoContainer = document.getElementById("video-container");

  async function init() {
    try {
      const modelURL = URL + "model.json";
      const metadataURL = URL + "metadata.json";

      model = await tmPose.load(modelURL, metadataURL);
      maxPredictions = model.getTotalClasses();
      modelLoaded = true;
      updateReadyStatus();
    } catch (error) {
      console.error("Error loading model:", error);
    }
  }

  async function initWebcam() {
    try {
      if (webcam) return;
      
      videoContainer.style.width = camWidth + "px";
      videoContainer.style.height = camHeight + "px";
      const flip = true;
      webcam = new tmPose.Webcam(camWidth, camHeight, flip);
      await webcam.setup();
      await webcam.play();

      videoContainer.innerHTML = "";
      videoContainer.appendChild(webcam.canvas);

      webcam.canvas.width = camWidth;
      webcam.canvas.height = camHeight;
      webcamInitialized = true;
      updateReadyStatus();

      webcam.canvas.style.display = "none";
    } catch (error) {
      console.error("Camera error:", error);
      alert(
        "Kamera tidak didukung atau tidak diizinkan. Aplikasi akan ditutup."
      );
      window.close();
    }
  }

  function updateReadyStatus() {
    if (modelLoaded && webcamInitialized) {
      isReadingReady = 1;
      console.log("System ready:", isReadingReady);
    }
  }

  async function start() {
    if (!webcamInitialized) {
      await initWebcam();
    }

    isCameraActive = true;
    document.getElementById("video-container").style.display = "block";
    webcam.canvas.style.display = "block";
    await webcam.play();
    loop();
  }

  function stop() {
    isCameraActive = false;
    document.getElementById("video-container").style.display = "none";
    webcam.canvas.style.display = "none";
    webcam.pause();
  }

  async function loop() {
    if (!isCameraActive) return;

    // videoContainer.style.left = ((window.innerWidth / 2) - (camWidth / 2)) + "px";

    webcam.update();

    if (model) {
      const { posenetOutput } = await model.estimatePose(webcam.canvas);
      const prediction = await model.predict(posenetOutput);

      let highestConfidence = 0,
        poseRead = "Idle";
      controlPose = "Idle";

      for (let i = 0; i < maxPredictions; i++) {
        const confidence = prediction[i].probability;
        if (confidence > highestConfidence) {
          highestConfidence = confidence;
          poseRead = prediction[i].className;
        }
      }

      if (highestConfidence > 0.8 && poseRead) {
      }
      controlPose = poseRead;
    } else {
      controlPose = "Idle";
    }

    window.requestAnimationFrame(loop);
  }

  // Initialize model when page loads
  init();
  // start();