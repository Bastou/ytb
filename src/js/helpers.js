/**
 * Helpers methods
 * 
 * 
 */

/**
 * get config file for site api and data
 * @param {string} path 
 * @returns 
 */
export function getSiteConfig(path) {
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

/**
 * helper for getting url parameters in url
 * @param {string} paramKey 
 * @returns 
 */
export function getUrlParam(paramKey) {
  return new URLSearchParams(window.location.search).get(paramKey);
}

/**
 * Fetch helper for invidious youtube api
 * @param {string} endpoints 
 * @param {string} baseUrl 
 * @returns {Promise}
 */
export function fetchYtb(endpoints, baseUrl = '') {
  const searchReq = `${baseUrl}${endpoints}`;

  return fetch(searchReq).then(function (response) {
    var contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return response.json().then(function (data) {
        return { ok: response.ok, body: data };
      });
    } else {
      console.error("Oops, there's no JSON!");
      return { status: response.status };
    }
  });
}

/**
 * Helper to get a duration from seconds formated in (mm:ss)
 * @param {number} seconds 
 * @returns 
 */
export function getDurationString(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (minutes > 0 ? minutes + ":" : "") + remainingSeconds;
}

/**
 * Set cursor css has wait or initial
 * @param {boolean} value
 */
export function setCursorWaiting(value = true) {
  document.body.style.cursor = value ? "wait" : "";
}
