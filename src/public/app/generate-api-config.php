<?php

// CONFIG
ini_set("default_socket_timeout", 10);

// CONSTANTS
define("DEBUG", false);
define("API_BASE", "/api/v1/");
define("API_LIST_TEST_ENDPOINT", "search?q=cat");
define("API_SINGLE_TEST_ENDPOINT", "videos/hY7m5jjJ9mM");

// Get local config file
// https://instances.invidio.us/
$baseConfigString = file_get_contents("../site-config.json");
$baseConfig = json_decode($baseConfigString, true);

$newConfig = $baseConfig;


// ---------------------------------------------- Test api videos listing

debugLog(
    "Test api listing",
    "=========================="
);



$baseUrlsForListing = array_merge((array)$baseConfig["base_url_list"], (array)$baseConfig["base_urls"]);
$validListUrl = testApiUrls($baseUrlsForListing, API_LIST_TEST_ENDPOINT, 0);



if ($validListUrl !== $baseConfig["base_url_list"]) {
    $newConfig["base_url_list"] = $validListUrl;
}



// ---------------------------------------------- Test api single video

debugLog(
    "Test api single",
    "=========================="
);

$baseUrlsForSingle = array_merge((array)$baseConfig["base_url_single"], (array)$baseConfig["base_urls"]);
$validSingleUrl = testApiUrls($baseUrlsForSingle, API_SINGLE_TEST_ENDPOINT, 0);

if ($validSingleUrl !== $baseConfig["base_url_single"]) {
    $newConfig["base_url_single"] = $validSingleUrl;
}

// ---------------------------------------------- Update json config file


if ($baseConfig !== $newConfig) {
    writeApiConfig($newConfig);
    debugLog("==========================");
    debugLog('Update config with single url : ' . $validSingleUrl);
    debugLog('Update config with list url : ' . $validListUrl);
    echo json_encode($newConfig);
} else {
    echo 'Invidious api already working. No need to update.';
}

// ---------------------------------------------- UTILS


/**
 * Test api
 * @return boolean|string
 */
function testApi($baseTestUrl, $endpoint)
{
    $urlToTest = $baseTestUrl . API_BASE . $endpoint;


    debugLog('Full Url to test ' . $urlToTest);

    if (!file_exists($urlToTest)) {

        $apiContentListString = @file_get_contents($urlToTest);
        $apiContentList = json_decode($apiContentListString, true);

        // if get array and not empty select url
        if (isset($apiContentList) && !empty($apiContentList)) {

            // noerror
            debugLog('Sucessfully GET data from JSON stream');

            // Update config if new url
            return $baseTestUrl;
        }
    } else {

        // error
        debugLog('Error with stream');
        return false;
    }
};

/**
 * Test api url lists
 */
function testApiUrls($urlList, $endPoint, $index)
{

    $urlToTest = $urlList[$index];
    debugLog('testApiUrls N°' . $index . ' with url ' . $urlToTest . ' and endpoint ' . $endPoint);

    $validUrl = testApi($urlToTest, $endPoint);

    if ($validUrl) {
        return $validUrl;
    } else if ($index < count($urlList) - 1) {
        return testApiUrls($urlList, API_LIST_TEST_ENDPOINT, $index + 1);
    } else {
        // no valid url
        mail('bastien.cornier@gmail.com', 'ytb Alert : no more valids url for api', '');
        return false;
    }
};

function writeApiConfig($config)
{
    $config['updated_date'] = date("D M j G:i:s T Y");
    $fp = fopen('../site-config.json', 'w');
    fwrite($fp, json_encode($config));
    fclose($fp);
}

function debugLog($content, $after = '')
{
    if (!DEBUG) return;

    echo "<br />";
    echo $content;
    echo "<br />";
    echo $after;
    echo "<br />";
}
