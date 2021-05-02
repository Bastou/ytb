// Import css modules
import "../css/main.css";
import initSearchView from "./views/search";
import {
  getUrlParam,
  getSiteConfig,
  setCursorWaiting,
  fetchMultipleYtb,
  getDurationString,
  fetchSingleYtb,
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

let apiBaseUrlsList = [];
let apiBaseUrlsSingle = [];

(async function init() {
  const siteConfig = await getSiteConfig(SITE_CONFIG_PATH);
  apiBaseUrlsList = [siteConfig["base_url_list"], siteConfig["base_urls"][0]];
  apiBaseUrlsSingle = [
    siteConfig["base_url_single"],
    siteConfig["base_urls"][0],
  ];
  initViews();

  // call update api config from backend when home
  if (isViewType(EViewTypes.SEARCH)) {
    navigator.sendBeacon(window.location.origin + SITE_UPDATE_CONFIG_ENDPOINT);
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

  try {
    fetchMultipleYtb(
      `${API_ENDPOINT_ROOT}/search?q="${searchString}"`,
      apiBaseUrlsList
    ).then((response) => {
      setCursorWaiting(false);
      fillList(response.body);
    });
  } catch (error) {
    fillList([]);
  }

  function fillList(list) {
    // if empty
    if (list.length === 0) {
      ulNode.innerHTML = `<h2>No videos found. Try to reload.</h2>`;
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

function createSingleVideoView(iterationCount = 0) {
  if (iterationCount > 1) return;
  const videoNode = document.getElementById("video");
  const videoWrapperNode = document.getElementById("videoWrapper");
  const videoID = getUrlParam("id");
  // reverse on odd count
  const baseApiUrls =
    iterationCount % 2 === 0 ? apiBaseUrlsSingle : apiBaseUrlsSingle.reverse();

  setCursorWaiting();

  fetchMultipleYtb(
    `${API_ENDPOINT_ROOT}/videos/${videoID}`,
    baseApiUrls
  ).then((response) => {
    setCursorWaiting(false);
    fillVideo(response.body);
  });

  function fillVideo(result) {
    const content = document.createElement("div");
    const videoData = getVideoDataByResolution(
      result.formatStreams,
      VIDEO_RESOLUTIONS
    );
    if (!videoData) return console.error("No video data");
    videoNode.src = videoData.url;
    videoNode.play();
    videoNode.onerror = () => {
      content.innerHTML = `<p>Video not found</p>`;
      // Retry only a second time to catch with a different api
      createSingleVideoView(iterationCount + 1);
    };

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
