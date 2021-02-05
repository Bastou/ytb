<?php

define("DEBUG", false);
define("API_BASE", "/api/v1/");
define("API_LIST_TEST_ENDPOINT", "search?q=cat");
define("API_SINGLE_TEST_ENDPOINT", "videos/hY7m5jjJ9mM");

// Get local config file
// https://instances.invidio.us/
$baseConfigString = file_get_contents("./site-config.json");
$baseConfig = json_decode($baseConfigString, true);

$newConfig = $baseConfig;

//Test api videos listing
debugLog("");
debugLog("Test api listing");
debugLog("==========================");
debugLog("");

$baseUrlsForListing = array_merge((array)$baseConfig["base_url_list"], (array)$baseConfig["base_urls"]);
$validListUrl = testApiUrls($baseUrlsForListing, API_LIST_TEST_ENDPOINT, 0);

if ($validListUrl !== $baseConfig["base_url_list"]) {
    $newConfig["base_url_list"] = $validListUrl;
}


debugLog("");
debugLog("Test api single");
debugLog("==========================");
debugLog("");

// Test api single video
$baseUrlsForSingle = array_merge((array)$baseConfig["base_url_single"], (array)$baseConfig["base_urls"]);
$validSingleUrl = testApiUrls($baseUrlsForSingle, API_SINGLE_TEST_ENDPOINT, 0);

if ($validSingleUrl !== $baseConfig["base_url_single"]) {
    $newConfig["base_url_single"] = $validSingleUrl;
}

// if config updated update json file
if ($baseConfig !== $newConfig) {
    writeApiConfig($newConfig);
    debugLog("");
    debugLog("==========================");
    debugLog('Update config with single url : ' . $validSingleUrl);    
    debugLog('Update config with list url : ' . $validListUrl);    
}


// ---------------------------------------------- UTILS


/**
 * Test api
 */
function testApi($baseTestUrl, $endpoint)
{
    $urlToTest = $baseTestUrl . API_BASE . $endpoint;

    debugLog("");
    debugLog('Full Url to test ' . $urlToTest);

    if (!file_exists($urlToTest)) {

        $apiContentListString = @file_get_contents($urlToTest);
        $apiContentList = json_decode($apiContentListString, true);

        // if get array and not empty select url
        if (isset($apiContentList) && !empty($apiContentList)) {

            // noerror
            debugLog('Sucessfully GET data from JSON stream<br />');

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
    debugLog('testApiUrls N°' . $index . ' with url ' . $urlToTest . ' and endpoint "', $endPoint);
    $validUrl = testApi($urlToTest, $endPoint);

    debugLog($validUrl ? 'is Valid url ' : 'is not Valid url');
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
    $fp = fopen('site-config.json', 'w');
    fwrite($fp, json_encode($config));
    fclose($fp);
}

function debugLog($content)
{
    if (!DEBUG) return;

    echo $content;
    echo "<br />";
}
