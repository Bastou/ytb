// Import css modules
import "../css/main.css";
import initSearchView from "./views/search";
import {
  getUrlParam,
  getSiteConfig,
  setCursorWaiting,
  fetchYtb,
  getDurationString,
} from "./helpers";

// CONSTANTS
// NOTE : sources https://github.com/iv-org/invidious
const API_ENDPOINT_ROOT = "/api/v1";
const SITE_CONFIG_PATH = "/site-config.json";
const VIDEO_RESOLUTIONS = ["360p", "480p", "720p"];
const SITE_UPDATE_CONFIG_ENDPOINT = "/app/generate-api-config.php";
const EViewTypes = Object.freeze({ SEARCH: 1, LIST: 2, SINGLE: 3 });

const viewTypeNodes = new Map([
  [EViewTypes.SEARCH, "form"],
  [EViewTypes.LIST, "list"],
  [EViewTypes.SINGLE, "video"],
]);

let apiBaseUrlList;
let apiBaseUrlSingle;

(async function init() {
  const siteConfig = await getSiteConfig(SITE_CONFIG_PATH);
  apiBaseUrlList = siteConfig["base_url_list"];
  apiBaseUrlSingle = siteConfig["base_url_single"];
  initViews();

  // call update api config from backend when home
  if (isViewType(EViewTypes.SEARCH)) {
    await fetch(
      window.location.origin + SITE_UPDATE_CONFIG_ENDPOINT
    );
  }
})();

// ------------------------------------------------------------ VIEWS

function initViews() {
  // search
  if (isViewType(EViewTypes.SEARCH)) {
    initSearchView();
  }

  // list
  if (isViewType(EViewTypes.LIST)) {
    createListView();
  }

  // Single Video
  if (isViewType(EViewTypes.SINGLE)) {
    createSingleVideoView();
  }
}

/**
 *
 * @param {EViewTypes} viewType
 * @returns
 */
function isViewType(viewType) {
  return document.getElementById(viewTypeNodes.get(viewType));
}

// TODO : make separate module
function createListView() {
  const ulNode = document.getElementById("list");
  const searchString = getUrlParam("q");

  setCursorWaiting();

  fetchYtb(
    `${API_ENDPOINT_ROOT}/search?q="${searchString}"`,
    apiBaseUrlList
  ).then((response) => {
    setCursorWaiting(false);
    fillList(response.body);
  });

  function fillList(list) {
    // if empty
    if (list.length === 0) {
      ulNode.innerHTML = `<h2>No videos found</h2>`;
      return;
    }

    const maxResults = 10;
    const listLength =
      list.listLength < maxResults ? list.listLength : maxResults;
    for (let index = 0; index < listLength; index++) {
      const result = list[index];
      const liNode = document.createElement("li");
      liNode.classList.add("videoEl");
      liNode.innerHTML = `<a class="videoLink" href="/video?id=${
        result.videoId
      }">
      <div class="thumb">
      <img src="${
        result.videoThumbnails.find((a) => a.quality === "start").url
      }" width="120"  height="90" alt="preview for ${result.title}" />
      <p>${getDurationString(result.lengthSeconds)}</p>
      </div>
      <div class="info">
        <h2 class="vidTitle">${result.title}</h2>
        <p class="vidSubTitle">${result.author} - ${result.publishedText}</p>
        <p class="desc">${result.description}</p>
      </div>
    </a>`;
      ulNode.appendChild(liNode);
    }
  }
}

function createSingleVideoView() {
  const videoNode = document.getElementById("video");
  const videoWrapperNode = document.getElementById("videoWrapper");
  const videoID = getUrlParam("id");

  setCursorWaiting();

  fetchYtb(`${API_ENDPOINT_ROOT}/videos/${videoID}`, apiBaseUrlSingle).then(
    (response) => {
      setCursorWaiting(false);
      fillVideo(response.body);
    }
  );

  function fillVideo(result) {
    const videoData = getVideoDataByResolution(
      result.formatStreams,
      VIDEO_RESOLUTIONS
    );
    if (!videoData) return console.error("No video data");
    videoNode.src = videoData.url;
    videoNode.play();

    const content = document.createElement("div");
    content.innerHTML = `
  <h2 class="vidTitle">${result.title}</h2>
  <p class="vidSubTitle">${result.author} - ${result.publishedText}</p>
  <p class="desc">${result.descriptionHtml}</p>`;
    videoWrapperNode.appendChild(content);
  }
}

function getVideoDataByResolution(videosData, video_resolutions) {
  return videosData.filter((videoData) =>
    video_resolutions.includes(videoData.resolution)
  )[0];
}
