
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
    audio: ""
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

  // Stop videos belonging to other episodes.
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

  resetStoryScenes();

  showPage("player");

  if (episode.audio) {
    episodeAudio.src = episode.audio;
    episodeAudio.load();

    playAudio(episodeAudio);
  } else {
    episodeAudio.removeAttribute("src");
    episodeAudio.load();
  }

  updatePlayButton();
}


// AUDIO EVENTS

episodeAudio.addEventListener("timeupdate", updateStoryScenes);

episodeAudio.addEventListener("loadedmetadata", () => {
  resetStoryScenes();
  updateStoryScenes();
});

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


// FULLSCREEN

fullscreenButton.addEventListener("click", async () => {
  try {
    if (!document.fullscreenElement) {
      await pages.player.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (error) {
    console.error("Fullscreen error:", error);
  }
});

document.addEventListener("fullscreenchange", () => {
  fullscreenButton.textContent = document.fullscreenElement
    ? "⛶ Exit Fullscreen"
    : "⛶ Fullscreen";
});


// INITIALISE WEBSITE

createEpisodes();
resetStoryScenes();
updatePlayButton();
