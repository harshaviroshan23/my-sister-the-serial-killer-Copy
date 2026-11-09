
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

const storyScenes = document.querySelectorAll(".story-scene");
const storyProgressFill = document.getElementById("storyProgressFill");

let currentEpisode = 0;
let introStarted = false;

const defaultEpisodes = [
  { title: "The Story — Part 1", description: "Meet the sisters and enter their world." },
  { title: "The Story — Part 2", description: "The story continues." },
  { title: "The Story — Part 3", description: "Discover what happens next." },
  { title: "The Climax", description: "The turning point of the story." },
  { title: "How It Should Have Ended", description: "An alternative ending." },
  { title: "My Feedback", description: "My personal thoughts about the book." },
  { title: "The Team", description: "Meet the people behind this presentation." }
];

function getEpisodes() {
  return typeof episodes !== "undefined" ? episodes : defaultEpisodes;
}

function showPage(pageName) {
  Object.values(pages).forEach(page => page.classList.add("hidden"));
  pages[pageName].classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

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
  playPauseButton.textContent = episodeAudio.paused ? "▶" : "❚❚";
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
    introStarted = false;
  }
}

function enterWebsite() {
  introVideo.pause();
  stopAudio(seriesAudio);

  intro.classList.add("hidden");
  app.classList.remove("hidden");

  showPage("home");
  playAudio(homeAudio);
}

startButton.addEventListener("click", startIntro);
skipButton.addEventListener("click", enterWebsite);
introVideo.addEventListener("ended", enterWebsite);

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

    card.addEventListener("click", () => openEpisode(index));
    episodeGrid.appendChild(card);
  });
}

// CINEMATIC SCENES

function resetStoryScenes() {
  storyScenes.forEach((scene, index) => {
    scene.classList.toggle("active", index === 0);
  });

  storyProgressFill.style.width = "0%";
}

function updateStoryScenes() {
  if (!Number.isFinite(episodeAudio.duration) || episodeAudio.duration <= 0) {
    return;
  }

  const progress = Math.min(
    episodeAudio.currentTime / episodeAudio.duration,
    1
  );

  let activeScene = Math.min(
    Math.floor(progress * storyScenes.length),
    storyScenes.length - 1
  );

  storyScenes.forEach((scene, index) => {
    scene.classList.toggle("active", index === activeScene);
  });

  storyProgressFill.style.width = `${progress * 100}%`;
}

// OPEN EPISODES

function openEpisode(index) {
  stopAudio(homeAudio);
  stopAudio(episodeAudio);

  currentEpisode = index;

  const episode = getEpisodes()[index];

  document.getElementById("playerEpisodeNumber").textContent =
    `EPISODE ${String(index + 1).padStart(2, "0")}`;

  document.getElementById("playerTitle").textContent = episode.title;
  document.getElementById("playerDescription").textContent = episode.description;

  resetStoryScenes();
  showPage("player");

  if (episode.audio) {
    episodeAudio.src = episode.audio;
    episodeAudio.load();
    playAudio(episodeAudio);
  }

  updatePlayButton();
}

// AUDIO EVENTS

episodeAudio.addEventListener("timeupdate", updateStoryScenes);

episodeAudio.addEventListener("loadedmetadata", () => {
  resetStoryScenes();
});

episodeAudio.addEventListener("play", updatePlayButton);
episodeAudio.addEventListener("pause", updatePlayButton);

episodeAudio.addEventListener("ended", () => {
  updatePlayButton();
  storyProgressFill.style.width = "100%";
  storyScenes.forEach((scene, index) => {
    scene.classList.toggle("active", index === storyScenes.length - 1);
  });
});

// PLAYER CONTROLS

playPauseButton.addEventListener("click", () => {
  if (!episodeAudio.src) return;

  if (episodeAudio.paused) {
    playAudio(episodeAudio);
  } else {
    episodeAudio.pause();
  }

  updatePlayButton();
});

rewindButton.addEventListener("click", () => {
  episodeAudio.currentTime = Math.max(0, episodeAudio.currentTime - 10);
});

forwardButton.addEventListener("click", () => {
  if (Number.isFinite(episodeAudio.duration)) {
    episodeAudio.currentTime = Math.min(
      episodeAudio.duration,
      episodeAudio.currentTime + 10
    );
  }
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

// INITIALISE

createEpisodes();
resetStoryScenes();
updatePlayButton();
