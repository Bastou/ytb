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
 *
 * @param {string} endpoints
 * @param {string[]} baseUrls
 * @returns {Promise<Object>}
 */
export async function fetchMultipleYtb(endpoints, baseUrls = []) {
  let result;
  for (let i = 0; i < baseUrls.length; i++) {
    const baseUrl = baseUrls[i];
    result = await fetchSingleYtb(endpoints, baseUrl);
    if (result) {
      break;
    }
  }
  return result;
}

/**
 * Fetch helper for invidious youtube api
 * @param {string} endpoints
 * @param {string} baseUrl
 * @returns {Promise}
 */
export async function fetchSingleYtb(endpoints, baseUrl = "") {
  try {
    const requestUrl = `${baseUrl}${endpoints}`;

    const response = await fetchWithTimeout(requestUrl, {
      timeout: 4000,
    });

    const bodyData = await response.json();
    return { ok: response.ok, body: bodyData };
  } catch (error) {
    console.log(`Error: ${error.name}`);
    return null;
  }
}

/**
 * A fetch with a timeout included
 * @param {string} url
 * @param {Object} options
 * @returns
 */
async function fetchWithTimeout(url, options) {
  const { timeout = 8000 } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(url, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);

  return response;
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
