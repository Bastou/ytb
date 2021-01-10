// Import css modules
import "../css/main.css";
import search from "./search.js";

// NOTE : sources https://github.com/iv-org/invidious
const API_BASE_URL_LIST = "https://yewtu.be"; // OR invidious.048596.xyz,
const API_BASE_URL_VIDEO = "https://invidious.zapashcanon.fr"; // OR //search?q="Cyprien école"
const API_ENDPOINT_ROOT = "/api/v1/"; //search?q="Cyprien école"
const apiBaseUrlList = [
  "https://invidious.tube",
  "https://invidious.zapashcanon.fr",
  "https://yewtu.be",
  "https://invidious.fdn.fr"
];
let defaultBaseUrl = API_BASE_URL_LIST;


(function init() {
  //checkApi(apiBaseUrlList, "search?q=cat", 0);
})();

// TODO: test api url and select first working

// FIXME
function checkApi(urlList, testEnpoint, urlIndex) {

  // check array entry exist at urlIndex
  if(!urlList[urlIndex]) return;

  const currentUrl = urlList[urlIndex];

  console.log("-----------");
  console.log("testing " + currentUrl + API_ENDPOINT_ROOT + testEnpoint, urlIndex);
  return fetch(currentUrl + API_ENDPOINT_ROOT + testEnpoint).then(
    function (response) {
      var contentType = response.headers.get("content-type");
      console.log({ response });
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json().then(function (data) {
          // if json returned but not data return test next url
          console.log({ ok: response.ok, body: data });
          if(!data || data.length === 0) {
            return checkApi(apiBaseUrlList, testEnpoint, urlIndex+1);
          } 
          console.log('Working url : ', currentUrl)
          return currentUrl;
        });
      } else {
        console.log("Oops, there's no JSON!");
        console.log("status", response.status);
        // if no json test next url
        return checkApi(apiBaseUrlList, testEnpoint, urlIndex+1);
        //return { status: response.status };
      }
    }
  );
}

// search
if (document.getElementById("form")) {
  search();
}

// list
if (document.getElementById("list")) {
  const ulNode = document.getElementById("list");
  const searchString = getUrlParam("q");

  // checkApi(apiBaseUrlList, `search?q=${searchString}`, 0).then(url => {
  //   defaultBaseUrl = url;
  //   fetchYtb(`search?q="${searchString}"`).then((response) => {
  //     fillList(response.body);
  //   });
  // });
  
  fetchYtb(`search?q="${searchString}"`, API_BASE_URL_LIST).then((response) => {
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

// Video
if (document.getElementById("video")) {
  const videoNode = document.getElementById("video");
  const videoWrapperNode = document.getElementById("videoWrapper");
  const videoID = getUrlParam("id");
  // checkApi(apiBaseUrlList, `videos/${videoID}`, 0).then(url => {
  //   defaultBaseUrl = url;
  //   fetchYtb(`videos/${videoID}`).then((response) => {
  //     console.log("response", response);
  //     fillVideo(response.body);
  //   });
  // });
  fetchYtb(`videos/${videoID}`, API_BASE_URL_VIDEO).then((response) => {
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

function fetchYtb(endpoints, baseUrl = API_BASE_URL_LIST) {
  const searchReq = `${baseUrl}${API_ENDPOINT_ROOT}${endpoints}`; //search?q="${searchString}"`;
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
