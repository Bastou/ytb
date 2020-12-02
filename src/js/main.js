// Import css modules
import "../css/main.css";
import search from "./search.js";

const BASE_API_URL = "https://invidious.xyz/api/v1/"; //search?q="Cyprien école"

// search
if (document.getElementById("form")) {
  search();
}

// list
if (document.getElementById("list")) {
  const ulNode = document.getElementById("list");

  //const urlParams = new URLSearchParams(window.location.search);
  const searchString = getUrlParam("q");
  fetchYtb(`search?q="${searchString}"`).then((response) => {
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
      console.log("result", result);
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
          <p class="videoSubtitle">${result.author} - ${
        result.publishedText
      }</p>
          <p class="desc">${result.description}</p>
        </div>
      </a>`;
      ulNode.appendChild(liNode);
    }
  }
}

if (document.getElementById("video")) {
  const videoNode = document.getElementById("video");
  const videoWrapperNode = document.getElementById("videoWrapper");
  const videoID = getUrlParam("id");
  fetchYtb(`videos/${videoID}`).then((response) => {
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

// ytb request test
// const myRequest = "https://invidio.us/api/v1/videos/DczoaQOH7G0";
// // Do your js and import your stuf here
// fetch(myRequest).then(function (response) {
//   var contentType = response.headers.get("content-type");
//   if (contentType && contentType.indexOf("application/json") !== -1) {
//     return response.json().then(function (json) {
//       // traitement du JSON
//       console.log("json", json);
//     });
//   } else {
//     console.log("Oops, nous n'avons pas du JSON!");
//   }
// });

// HELPERS

function getUrlParam(paramKey) {
  return new URLSearchParams(window.location.search).get(paramKey);
}

function fetchYtb(endpoints) {
  const searchReq = `${BASE_API_URL}${endpoints}`; //search?q="${searchString}"`;
  // Do your js and import your stuf here
  return fetch(searchReq).then(function (response) {
    var contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return response.json().then(function (data) {
        // traitement du JSON
        //console.log("json", json);
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
