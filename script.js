
const pages = {
  home: document.getElementById("homePage"),
  detail: document.getElementById("detailPage"),
  episodes: document.getElementById("episodesPage"),
  player: document.getElementById("playerPage")
};

const intro = document.getElementById("intro");
const app = document.getElementById("app");
const introVideo = document.getElementById("introVideo");

const homeAudio = document.getElementById("homeAudio");
const seriesAudio = document.getElementById("seriesAudio");

let currentEpisode = 0;

function showPage(pageName) {
  Object.values(pages).forEach(page => {
    page.classList.add("hidden");
  });

  pages[pageName].classList.remove("hidden");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function stopAudio(audio) {
  audio.pause();
  audio.currentTime = 0;
}

function playAudio(audio) {
  audio.play().catch(() => {
    console.log("Audio requires user interaction.");
  });
}

// INTRO

function enterWebsite() {
  intro.classList.add("hidden");
  app.classList.remove("hidden");

  playAudio(homeAudio);
  showPage("home");
}

document.getElementById("startExperience")
  .addEventListener("click", enterWebsite);

document.getElementById("skipIntro")
  .addEventListener("click", enterWebsite);

introVideo.addEventListener("ended", () => {
  document.getElementById("startExperience").style.display = "block";
});

// SERIES NAVIGATION

function openSeries() {
  stopAudio(homeAudio);
  playAudio(seriesAudio);
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
  button.addEventListener("click", () => showPage("detail"));
});

document.getElementById("viewEpisodes")
  .addEventListener("click", () => showPage("episodes"));

document.querySelectorAll("[data-go-episodes]").forEach(button => {
  button.addEventListener("click", () => showPage("episodes"));
});

// EPISODES

const episodeGrid = document.getElementById("episodeGrid");

const defaultEpisodes = [
  {
    title: "The Story — Part 1",
    description: "Meet the sisters and enter their world."
  },
  {
    title: "The Story — Part 2",
    description: "The story continues."
  },
  {
    title: "The Story — Part 3",
    description: "Discover what happens next."
  },
  {
    title: "The Climax",
    description: "The turning point of the story."
  },
  {
    title: "How It Should Have Ended",
    description: "An alternative ending."
  },
  {
    title: "My Feedback",
    description: "My personal thoughts about the book."
  },
  {
    title: "The Team",
    description: "Meet the people behind this presentation."
  }
];

function getEpisodes() {
  return typeof episodes !== "undefined"
    ? episodes
    : defaultEpisodes;
}

function createEpisodes() {
  episodeGrid.innerHTML = "";

  getEpisodes().forEach((episode, index) => {
    const card = document.createElement("article");

    card.className = "episode-card";

    card.innerHTML = `
      <div class="episode-thumbnail">
        ▶
      </div>

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

function openEpisode(index) {
  currentEpisode = index;

  const episode = getEpisodes()[index];

  document.getElementById("playerEpisodeNumber").textContent =
    `EPISODE ${String(index + 1).padStart(2, "0")}`;

  document.getElementById("playerTitle").textContent =
    episode.title;

  document.getElementById("playerDescription").textContent =
    episode.description;

  showPage("player");
}

createEpisodes();

// INITIAL STATE

showPage("home");
