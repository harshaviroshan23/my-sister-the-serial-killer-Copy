
const pages = {
  home: document.getElementById("homePage"),
  detail: document.getElementById("detailPage"),
  episodes: document.getElementById("episodesPage"),
  player: document.getElementById("playerPage")
};

const intro = document.getElementById("intro");
const app = document.getElementById("app");
const introVideo = document.getElementById("introVideo");

const startButton = document.getElementById("startExperience");
const skipButton = document.getElementById("skipIntro");

const homeAudio = document.getElementById("homeAudio");
const seriesAudio = document.getElementById("seriesAudio");
const episodeAudio = document.getElementById("episodeAudio");

const episodeGrid = document.getElementById("episodeGrid");

const playPauseButton = document.getElementById("playPauseButton");
const rewindButton = document.getElementById("rewindButton");
const forwardButton = document.getElementById("forwardButton");
const fullscreenButton = document.getElementById("fullscreenButton");

const storyStage = document.getElementById("storyStage");
const storyProgress = document.getElementById("storyProgress");
const storyProgressFill = document.getElementById("storyProgressFill");

const allStoryScenes = document.querySelectorAll(".story-scene");
const allSceneVideos = document.querySelectorAll(".scene-video");

let currentEpisode = 0;
let activeSceneIndex = -1;
let introStarted = false;
let isDraggingProgress = false;

let subtitleTrackElement = null;
let subtitleTextTrack = null;
let subtitlesEnabled = true;


// PLAYER BAR DESIGN

storyStage.style.position = "relative";

const playerBarStyles = document.createElement("style");

playerBarStyles.textContent = `
  .story-stage {
    position: relative;
  }

  .player-bottom-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 100;
    padding: 30px 22px 14px;
    box-sizing: border-box;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.96),
      rgba(0, 0, 0, 0.72) 65%,
      transparent
    );
    opacity: 1;
    transition: opacity 0.25s ease;
  }

  .player-bottom-bar .story-progress {
    position: relative;
    width: 100%;
    height: 4px;
    margin: 0 0 13px;
    padding: 0;
    border: none;
    border-radius: 0;
    background: rgba(255, 255, 255, 0.35);
    cursor: pointer;
    overflow: visible;
    touch-action: none;
  }

  .player-bottom-bar .story-progress:hover {
    height: 6px;
  }

  .player-bottom-bar .story-progress-fill {
    height: 100%;
    width: 0%;
    background: #e50914;
    border-radius: 0;
    position: relative;
  }

  .player-bottom-bar .story-progress-fill::after {
    content: "";
    position: absolute;
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #e50914;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .player-bottom-bar .story-progress:hover .story-progress-fill::after,
  .player-bottom-bar .story-progress:active .story-progress-fill::after {
    opacity: 1;
  }

  .player-control-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .player-controls-left,
  .player-controls-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .player-bottom-bar .player-controls {
    display: contents;
  }

  .player-bottom-bar button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 34px;
    min-height: 34px;
    padding: 5px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: white;
    font-size: 17px;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.2s ease, transform 0.2s ease;
  }

  .player-bottom-bar button:hover {
    color: #e50914;
    transform: scale(1.08);
  }

  .player-bottom-bar #playPauseButton {
    font-size: 23px;
  }

  .player-bottom-bar #rewindButton,
  .player-bottom-bar #forwardButton {
    font-size: 15px;
  }

  .player-volume-control {
    display: flex;
    align-items: center;
    gap: 9px;
    color: white;
  }

  .player-volume-control input {
    width: 75px;
    height: 4px;
    accent-color: #e50914;
    cursor: pointer;
  }

  .player-time {
    color: rgba(255,255,255,0.85);
    font-size: 12px;
    white-space: nowrap;
    font-family: Arial, sans-serif;
  }

  .player-bottom-bar #subtitleToggleButton {
    position: static !important;
    display: inline-flex;
    min-width: 38px;
    padding: 6px 9px;
    border: 1px solid rgba(255,255,255,0.65);
    border-radius: 3px;
    background: transparent;
    color: white;
    font-size: 12px;
  }

  .player-bottom-bar #subtitleToggleButton:hover {
    border-color: #e50914;
  }

  .player-bottom-bar #fullscreenButton {
    font-size: 22px;
  }

  .player-bottom-bar .player-controls button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  @media (max-width: 600px) {
    .player-bottom-bar {
      padding: 22px 12px 9px;
    }

    .player-controls-left,
    .player-controls-right {
      gap: 8px;
    }

    .player-volume-control input {
      width: 48px;
    }

    .player-time {
      font-size: 10px;
    }

    .player-bottom-bar button {
      min-width: 28px;
      min-height: 30px;
      font-size: 15px;
    }
  }

  .story-stage:fullscreen {
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
    border-radius: 0;
    background: #000;
  }

  .story-stage:fullscreen .player-bottom-bar {
    padding: 35px 35px 20px;
  }
`;

document.head.appendChild(playerBarStyles);


// BUILD BOTTOM BAR

const playerBottomBar = document.createElement("div");
playerBottomBar.className = "player-bottom-bar";

const controlRow = document.createElement("div");
controlRow.className = "player-control-row";

const leftControls = document.createElement("div");
leftControls.className = "player-controls-left";

const rightControls = document.createElement("div");
rightControls.className = "player-controls-right";

const originalControls = document.querySelector(".player-controls");

// Move the existing controls into the new bottom bar.
if (originalControls) {
  leftControls.appendChild(rewindButton);
  leftControls.appendChild(playPauseButton);
  leftControls.appendChild(forwardButton);
  rightControls.appendChild(fullscreenButton);
  originalControls.remove();
}

// Volume control
const volumeControl = document.createElement("div");
volumeControl.className = "player-volume-control";

const volumeIcon = document.createElement("span");
volumeIcon.textContent = "🔊";
volumeIcon.style.fontSize = "16px";

const volumeSlider = document.createElement("input");
volumeSlider.type = "range";
volumeSlider.min = "0";
volumeSlider.max = "1";
volumeSlider.step = "0.05";
volumeSlider.value = String(episodeAudio.volume);
volumeSlider.setAttribute("aria-label", "Volume");

volumeControl.appendChild(volumeIcon);
volumeControl.appendChild(volumeSlider);

// Timestamp
const timeDisplay = document.createElement("span");
timeDisplay.className = "player-time";
timeDisplay.textContent = "00:00 / 00:00";

leftControls.appendChild(volumeControl);
leftControls.appendChild(timeDisplay);

// Put the progress bar above the controls.
controlRow.appendChild(leftControls);
controlRow.appendChild(rightControls);

playerBottomBar.appendChild(storyProgress);
playerBottomBar.appendChild(controlRow);

storyStage.appendChild(playerBottomBar);

// Keep the old controls container out of the layout.
if (originalControls) {
  originalControls.style.display = "none";
}


// TIME FORMAT

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    seconds = 0;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function updateTimeDisplay() {
  const current = formatTime(episodeAudio.currentTime);
  const duration = formatTime(episodeAudio.duration);

  timeDisplay.textContent = `${current} / ${duration}`;
}


// VOLUME CONTROL

volumeSlider.addEventListener("input", () => {
  episodeAudio.volume = Number(volumeSlider.value);

  if (episodeAudio.volume === 0) {
    volumeIcon.textContent = "🔇";
  } else if (episodeAudio.volume < 0.5) {
    volumeIcon.textContent = "🔉";
  } else {
    volumeIcon.textContent = "🔊";
  }
});

volumeIcon.style.cursor = "pointer";

volumeIcon.addEventListener("click", () => {
  if (episodeAudio.volume > 0) {
    episodeAudio.dataset.previousVolume = episodeAudio.volume;
    episodeAudio.volume = 0;
  } else {
    episodeAudio.volume = Number(
      episodeAudio.dataset.previousVolume || 1
    );
  }

  volumeSlider.value = String(episodeAudio.volume);

  volumeIcon.textContent = episodeAudio.volume === 0
    ? "🔇"
    : episodeAudio.volume < 0.5
      ? "🔉"
      : "🔊";
});


// SUBTITLE DISPLAY

const subtitleDisplay = document.createElement("div");
subtitleDisplay.id = "subtitleDisplay";

Object.assign(subtitleDisplay.style, {
  position: "absolute",
  bottom: "13%",
  left: "5%",
  right: "5%",
  zIndex: "50",
  color: "#ffffff",
  fontSize: "clamp(14px, 2vw, 22px)",
  fontWeight: "600",
  textAlign: "center",
  lineHeight: "1.5",
  textShadow: "2px 2px 5px #000000, -2px -2px 5px #000000",
  background: "rgba(0, 0, 0, 0.55)",
  padding: "8px 14px",
  borderRadius: "5px",
  pointerEvents: "none",
  display: "none"
});

storyStage.appendChild(subtitleDisplay);


// SUBTITLE BUTTON

const subtitleToggleButton = document.createElement("button");

subtitleToggleButton.id = "subtitleToggleButton";
subtitleToggleButton.textContent = "CC ON";
subtitleToggleButton.title = "Toggle subtitles";

rightControls.insertBefore(
  subtitleToggleButton,
  fullscreenButton
);


function renderSubtitleCue() {
  if (!subtitlesEnabled || !subtitleTextTrack) {
    subtitleDisplay.style.display = "none";
    return;
  }

  const activeCues = subtitleTextTrack.activeCues;

  if (!activeCues || activeCues.length === 0) {
    subtitleDisplay.textContent = "";
    subtitleDisplay.style.display = "none";
    return;
  }

  subtitleDisplay.textContent = activeCues[0].text;
  subtitleDisplay.style.display = "block";
}


function setupSubtitles(index) {
  if (subtitleTrackElement) {
    subtitleTrackElement.remove();
    subtitleTrackElement = null;
    subtitleTextTrack = null;
  }

  subtitleDisplay.textContent = "";
  subtitleDisplay.style.display = "none";

  if (index !== 2) {
    subtitleToggleButton.style.display = "none";
    return;
  }

  subtitlesEnabled = true;

  subtitleToggleButton.textContent = "CC ON";
  subtitleToggleButton.style.display = "inline-flex";

  subtitleTrackElement = document.createElement("track");

  subtitleTrackElement.kind = "captions";
  subtitleTrackElement.label = "English";
  subtitleTrackElement.srclang = "en";
  subtitleTrackElement.src = "assets/episode3.vtt";

  subtitleTrackElement.addEventListener("load", () => {
    if (subtitleTrackElement && subtitleTrackElement.track) {
      subtitleTextTrack = subtitleTrackElement.track;
      subtitleTextTrack.mode = "hidden";

      renderSubtitleCue();
    }
  });

  subtitleTrackElement.addEventListener("error", () => {
    console.error("Could not load Episode 3 subtitles.");
  });

  episodeAudio.appendChild(subtitleTrackElement);

  subtitleTextTrack = subtitleTrackElement.track;
  subtitleTextTrack.mode = "hidden";

  subtitleTextTrack.oncuechange = renderSubtitleCue;
}


subtitleToggleButton.addEventListener("click", () => {
  subtitlesEnabled = !subtitlesEnabled;

  subtitleToggleButton.textContent = subtitlesEnabled
    ? "CC ON"
    : "CC OFF";

  renderSubtitleCue();
});


// EPISODE DATA

const defaultEpisodes = [
  {
    title: "The Story — Part 1",
    description: "Meet the sisters and enter their world.",
    audio: "assets/episode1.wav"
  },
  {
    title: "The Story — Part 2",
    description: "The story continues.",
    audio: "assets/episode2.wav"
  },
  {
    title: "The Story — Part 3",
    description: "Discover what happens next.",
    audio: "assets/episode3.wav"
  },
  {
    title: "The Climax",
    description: "The turning point of the story.",
    audio: ""
  },
  {
    title: "How It Should Have Ended",
    description: "An alternative ending.",
    audio: ""
  },
  {
    title: "My Feedback",
    description: "My personal thoughts about the book.",
    audio: ""
  },
  {
    title: "The Team",
    description: "Meet the people behind this presentation.",
    audio: ""
  }
];

function getEpisodes() {
  return typeof episodes !== "undefined"
    ? episodes
    : defaultEpisodes;
}


// CURRENT EPISODE SCENES

function getCurrentScenes() {
  return storyStage.querySelectorAll(
    `.story-scene[data-episode="${currentEpisode + 1}"]`
  );
}

function getCurrentVideos() {
  return Array.from(getCurrentScenes()).map(scene =>
    scene.querySelector(".scene-video")
  ).filter(Boolean);
}


// PAGE NAVIGATION

function showPage(pageName) {
  Object.values(pages).forEach(page => {
    page.classList.add("hidden");
  });

  pages[pageName].classList.remove("hidden");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// AUDIO HELPERS

function stopAudio(audio) {
  audio.pause();
  audio.currentTime = 0;
}

function playAudio(audio) {
  audio.play().catch(error => {
    console.log("Audio playback requires interaction.", error);
  });
}

function updatePlayButton() {
  playPauseButton.textContent = episodeAudio.paused
    ? "▶"
    : "❚❚";

  playPauseButton.title = episodeAudio.paused
    ? "Play"
    : "Pause";
}


// INTRO

async function startIntro() {
  if (introStarted) return;

  introStarted = true;

  startButton.style.display = "none";
  skipButton.style.display = "block";

  introVideo.currentTime = 0;
  introVideo.muted = false;

  try {
    await introVideo.play();
  } catch (error) {
    console.error("Intro playback failed:", error);

    startButton.style.display = "block";
    skipButton.style.display = "block";

    introStarted = false;
  }
}

function enterWebsite() {
  introVideo.pause();

  intro.classList.add("hidden");
  app.classList.remove("hidden");

  stopAudio(seriesAudio);
  stopAudio(episodeAudio);

  showPage("home");

  playAudio(homeAudio);
}

startButton.addEventListener("click", startIntro);
skipButton.addEventListener("click", enterWebsite);
introVideo.addEventListener("ended", enterWebsite);


// INTRO INITIALISATION

intro.classList.remove("hidden");
app.classList.add("hidden");

startButton.style.display = "block";
skipButton.style.display = "block";


// NAVIGATION

function openSeries() {
  playAudio(homeAudio);
  showPage("detail");
}

document.querySelectorAll("[data-open-series]").forEach(button => {
  button.addEventListener("click", openSeries);
});

document.querySelectorAll("[data-go-home]").forEach(button => {
  button.addEventListener("click", () => {
    stopAudio(seriesAudio);
    stopAudio(episodeAudio);
    pauseAllSceneVideos();

    playAudio(homeAudio);
    showPage("home");
  });
});

document.querySelectorAll("[data-go-detail]").forEach(button => {
  button.addEventListener("click", () => {
    stopAudio(seriesAudio);
    playAudio(homeAudio);
    showPage("detail");
  });
});

document.getElementById("viewEpisodes").addEventListener("click", () => {
  playAudio(homeAudio);
  showPage("episodes");
});

document.querySelectorAll("[data-go-episodes]").forEach(button => {
  button.addEventListener("click", () => {
    stopAudio(episodeAudio);
    pauseAllSceneVideos();

    playAudio(homeAudio);
    showPage("episodes");
  });
});


// EPISODE CARDS

function createEpisodes() {
  episodeGrid.innerHTML = "";

  getEpisodes().forEach((episode, index) => {
    const card = document.createElement("article");

    card.className = "episode-card";

    card.innerHTML = `
      <div class="episode-thumbnail">▶</div>

      <div class="episode-info">
        <div class="episode-number">
          EPISODE ${String(index + 1).padStart(2, "0")}
        </div>

        <h3>${episode.title}</h3>

        <p>${episode.description}</p>
      </div>
    `;

    card.addEventListener("click", () => {
      openEpisode(index);
    });

    episodeGrid.appendChild(card);
  });
}


// CINEMATIC VIDEO CONTROL

function pauseAllSceneVideos() {
  allSceneVideos.forEach(video => {
    video.pause();
  });
}


function setActiveScene(index) {
  const currentScenes = getCurrentScenes();
  const currentVideos = getCurrentVideos();

  if (index < 0 || index >= currentScenes.length) {
    return;
  }

  currentScenes.forEach((scene, i) => {
    scene.classList.toggle("active", i === index);
  });

  if (activeSceneIndex === index) {
    const activeVideo = currentVideos[index];

    if (
      activeVideo &&
      !episodeAudio.paused &&
      activeVideo.paused
    ) {
      activeVideo.play().catch(error => {
        console.log("Scene video playback blocked:", error);
      });
    }

    return;
  }

  activeSceneIndex = index;

  currentVideos.forEach((video, i) => {
    if (i === index) {
      video.currentTime = 0;

      if (!episodeAudio.paused) {
        video.play().catch(error => {
          console.log("Scene video playback blocked:", error);
        });
      }
    } else {
      video.pause();
      video.currentTime = 0;
    }
  });

  allStoryScenes.forEach(scene => {
    if (scene.dataset.episode !== String(currentEpisode + 1)) {
      const video = scene.querySelector(".scene-video");

      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    }
  });
}


function resetStoryScenes() {
  activeSceneIndex = -1;

  allStoryScenes.forEach(scene => {
    scene.classList.remove("active");
  });

  storyProgressFill.style.width = "0%";
  storyProgress.setAttribute("aria-valuenow", "0");

  setActiveScene(0);
}


// UPDATE SCENES AND PROGRESS

function updateStoryScenes() {
  if (
    !Number.isFinite(episodeAudio.duration) ||
    episodeAudio.duration <= 0
  ) {
    updateTimeDisplay();
    return;
  }

  const currentScenes = getCurrentScenes();

  if (currentScenes.length === 0) return;

  const progress = Math.min(
    Math.max(episodeAudio.currentTime / episodeAudio.duration, 0),
    1
  );

  const activeScene = Math.min(
    Math.floor(progress * currentScenes.length),
    currentScenes.length - 1
  );

  setActiveScene(activeScene);

  storyProgressFill.style.width = `${progress * 100}%`;

  storyProgress.setAttribute(
    "aria-valuenow",
    String(Math.round(progress * 100))
  );

  updateTimeDisplay();
}


// INTERACTIVE PROGRESS BAR

function seekToPosition(clientX) {
  if (
    !Number.isFinite(episodeAudio.duration) ||
    episodeAudio.duration <= 0 ||
    !episodeAudio.src
  ) {
    return;
  }

  const rect = storyProgress.getBoundingClientRect();

  const position = Math.min(
    Math.max((clientX - rect.left) / rect.width, 0),
    1
  );

  episodeAudio.currentTime = position * episodeAudio.duration;

  updateStoryScenes();
}


// CLICK AND DRAG

storyProgress.addEventListener("pointerdown", event => {
  if (!episodeAudio.src || !Number.isFinite(episodeAudio.duration)) {
    return;
  }

  isDraggingProgress = true;

  storyProgress.setPointerCapture(event.pointerId);

  seekToPosition(event.clientX);
});

storyProgress.addEventListener("pointermove", event => {
  if (!isDraggingProgress) return;

  seekToPosition(event.clientX);
});

storyProgress.addEventListener("pointerup", event => {
  if (!isDraggingProgress) return;

  seekToPosition(event.clientX);

  isDraggingProgress = false;

  if (storyProgress.hasPointerCapture(event.pointerId)) {
    storyProgress.releasePointerCapture(event.pointerId);
  }
});

storyProgress.addEventListener("pointercancel", () => {
  isDraggingProgress = false;
});


// KEYBOARD SUPPORT

storyProgress.addEventListener("keydown", event => {
  if (!episodeAudio.src || !Number.isFinite(episodeAudio.duration)) {
    return;
  }

  const duration = episodeAudio.duration;
  let newTime = episodeAudio.currentTime;

  if (event.key === "ArrowRight") {
    newTime += 5;
  } else if (event.key === "ArrowLeft") {
    newTime -= 5;
  } else if (event.key === "Home") {
    newTime = 0;
  } else if (event.key === "End") {
    newTime = duration;
  } else {
    return;
  }

  event.preventDefault();

  episodeAudio.currentTime = Math.max(
    0,
    Math.min(newTime, duration)
  );

  updateStoryScenes();
});


// OPEN EPISODES

function openEpisode(index) {
  stopAudio(homeAudio);
  stopAudio(seriesAudio);
  stopAudio(episodeAudio);

  pauseAllSceneVideos();

  currentEpisode = index;

  const episode = getEpisodes()[index];

  document.getElementById("playerEpisodeNumber").textContent =
    `EPISODE ${String(index + 1).padStart(2, "0")}`;

  document.getElementById("playerTitle").textContent =
    episode.title;

  document.getElementById("playerDescription").textContent =
    episode.description;

  setupSubtitles(index);

  resetStoryScenes();

  showPage("player");

  if (episode.audio) {
    episodeAudio.src = episode.audio;
    episodeAudio.load();

    playAudio(episodeAudio);
  } else {
    episodeAudio.removeAttribute("src");
    episodeAudio.load();

    storyProgressFill.style.width = "0%";
  }

  updatePlayButton();
  updateTimeDisplay();
}


// AUDIO EVENTS

episodeAudio.addEventListener("timeupdate", updateStoryScenes);

episodeAudio.addEventListener("loadedmetadata", () => {
  resetStoryScenes();
  updateStoryScenes();
});

episodeAudio.addEventListener("durationchange", updateTimeDisplay);

episodeAudio.addEventListener("play", () => {
  updatePlayButton();

  if (activeSceneIndex < 0) {
    setActiveScene(0);
  } else {
    setActiveScene(activeSceneIndex);
  }
});

episodeAudio.addEventListener("pause", () => {
  updatePlayButton();
  pauseAllSceneVideos();
});

episodeAudio.addEventListener("ended", () => {
  updatePlayButton();

  storyProgressFill.style.width = "100%";
  storyProgress.setAttribute("aria-valuenow", "100");

  const currentScenes = getCurrentScenes();

  if (currentScenes.length > 0) {
    setActiveScene(currentScenes.length - 1);
  }

  pauseAllSceneVideos();
  updateTimeDisplay();
});


// PLAYER CONTROLS

playPauseButton.addEventListener("click", () => {
  if (!episodeAudio.src) return;

  if (episodeAudio.paused) {
    playAudio(episodeAudio);
  } else {
    episodeAudio.pause();
  }
});

rewindButton.addEventListener("click", () => {
  if (!Number.isFinite(episodeAudio.duration)) return;

  episodeAudio.currentTime = Math.max(
    0,
    episodeAudio.currentTime - 10
  );

  updateStoryScenes();
});

forwardButton.addEventListener("click", () => {
  if (!Number.isFinite(episodeAudio.duration)) return;

  episodeAudio.currentTime = Math.min(
    episodeAudio.duration,
    episodeAudio.currentTime + 10
  );

  updateStoryScenes();
});


// VIDEO-ONLY FULLSCREEN

fullscreenButton.addEventListener("click", async () => {
  try {
    if (!document.fullscreenElement) {
      await storyStage.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (error) {
    console.error("Fullscreen error:", error);
  }
});

document.addEventListener("fullscreenchange", () => {
  fullscreenButton.textContent = document.fullscreenElement
    ? "⛶"
    : "⛶";

  fullscreenButton.title = document.fullscreenElement
    ? "Exit fullscreen"
    : "Fullscreen";
});


// INITIALISE WEBSITE

createEpisodes();
resetStoryScenes();
updatePlayButton();
updateTimeDisplay();
