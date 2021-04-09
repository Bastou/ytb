// Import css modules
import "../css/main.css";
import initSearchView from "./views/search.js";

// NOTE : sources https://github.com/iv-org/invidious

let apiBaseUrlList;
let apiBaseUrlSingle;
const API_ENDPOINT_ROOT = "/api/v1/";
const SITE_CONFIG_PATH = "/site-config.json";

(async function init() {
  const siteConfig = await getSiteConfig(SITE_CONFIG_PATH);
  apiBaseUrlList = siteConfig["base_url_list"];
  apiBaseUrlSingle = siteConfig["base_url_single"];
  initViews();
})();

// -- VIEWS

function initViews() {
  // search
  if (document.getElementById("form")) {
    initSearchView();
  }

  // list
  if (document.getElementById("list")) {
    createListView();
  }

  // Video
  if (document.getElementById("video")) {
    createSingleVideoView();
  }
}

// TODO : make separate module
function createListView() {
  const ulNode = document.getElementById("list");
  const searchString = getUrlParam("q");

  fetchYtb(`search?q="${searchString}"`, apiBaseUrlList).then((response) => {
    console.log("e", response);
    fillList(response.body);
  });

  function fillList(list) {
    console.log("ulNode", ulNode);

    // if empty
    if (list.length === 0) {
      console.log("no videos");
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
      }" />
      <p>${getDurationString(result.lengthSeconds)}</p>
      </div>
      <div class="info">
        <h2 class="videoTitle">${result.title}</h2>
        <p class="videoSubtitle">${result.author} - ${result.publishedText}</p>
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

  fetchYtb(`videos/${videoID}`, apiBaseUrlSingle).then((response) => {
    console.log("response", response);
    fillVideo(response.body);
  });

  function fillVideo(result) {
    videoNode.src = result.formatStreams[1]
      ? result.formatStreams[1].url
      : result.formatStreams[0].url;
    videoNode.play();

    const content = document.createElement("div");
    content.innerHTML = `
  <h2 class="videoDetailTitle">${result.title}</h2>
  <p class="videoSubtitle">${result.author} - ${result.publishedText}</p>
  <p class="desc">${result.descriptionHtml}</p>`;
    videoWrapperNode.appendChild(content);
  }
}

// -- HELPERS

function getSiteConfig(path) {
  return fetch("/site-config.json").then(function (response) {
    var contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return response.json();
    } else {
      console.error(
        "Oops, there's no JSON!, error status : " + response.status
      );
      return { status: response.status };
    }
  });
}

function getUrlParam(paramKey) {
  return new URLSearchParams(window.location.search).get(paramKey);
}

function fetchYtb(endpoints, baseUrl = apiBaseUrlList) {
  const searchReq = `${baseUrl}${API_ENDPOINT_ROOT}${endpoints}`;
  console.log({ searchReq });
  return fetch(searchReq).then(function (response) {
    var contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return response.json().then(function (data) {
        return { ok: response.ok, body: data };
      });
    } else {
      console.log("Oops, there's no JSON!");
      return { status: response.status };
    }
  });
}

function getDurationString(seconds) {
  console.log(seconds);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  console.log("minutes", minutes);
  console.log("remainingSeconds", remainingSeconds);
  return (minutes > 0 ? minutes + ":" : "") + remainingSeconds;
}
