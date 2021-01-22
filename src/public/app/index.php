<?php

/* TODO : 
 - Get site_config.json {'base_list_url':, 'base_single_url'}
 - Test base list url
 - If url : error or not json or empty or timeout 
    - Check next url in array
        - If url error repeat above
        - Else register in list url
 - Test base single url (same steps)
 - 
*/
//$baseConfig = file_get_contents($url);


// Create http context
$ctx = stream_context_create(array(
    'http' =>
    array(
        'timeout' => 800,  //1200 Seconds is 20 Minutes
    )
));

define("API_BASE", "/api/v1/");
define("API_LIST_TEST_ENDPOINT", "search?q=cat");

// Get local config file
$baseConfigString = file_get_contents("./site-config.json");
$baseConfig = json_decode($baseConfigString, true);

$newConfig = $baseConfig;

/**
 * Test api
 */
function testApi($baseTestUrl, $endpoint)
{
    $urlToTest = $baseTestUrl . API_BASE . $endpoint;

    echo 'Full Url to test ' . $urlToTest . '<br />';

    if (!file_exists($urlToTest)) {

        $apiContentListString = file_get_contents($urlToTest);
        $apiContentList = json_decode($apiContentListString, true);

        echo '$apiContentList ';
        print_r($apiContentList);
        echo '<br />';

        // if get array and not empty select url
        if (isset($apiContentList) && !empty($apiContentList)) {

            // noerror
            print('Sucessfully GET data from JSON stream<br />');

            // Update config if new url
            return $baseTestUrl;
        }
    } else {

        // error
        print('Error with stream');
        return false;
    }
};

/**
 * Test api url lists
 */
function testApiUrls($urlList, $endPoint, $index)
{
    if($index > 4) die();

    $urlToTest = $urlList[$index];
    echo 'testApiUrls N°' . $index . ' with url ' . $urlToTest . ' and endpoint "', $endPoint . '" <br />';
    $validUrl = testApi($urlToTest, $endPoint);

    echo $validUrl ? 'is Valid url ' : 'is not Valid url' .  "<br />";
    if ($validUrl) {
        return $validUrl;
    } else if ($index < count($urlList)) {
        return testApiUrls($urlList, API_LIST_TEST_ENDPOINT, $index + 1);
    } else {
        // no valid url
        mail('bastien.cornier@gmail.com', 'ytb Alert : no valids url', '');
        return false;
    }
};

$baseUrlsForListing = array_merge((array)$baseConfig["base_url_list"], (array)$baseConfig["base_urls"]);
$validListUrl = testApiUrls($baseUrlsForListing, API_LIST_TEST_ENDPOINT, 0);

echo '$validListUrl' . $validListUrl;

//$rightUrl = $testApi($baseConfig["base_urls"], $baseConfig["base_url_list"], API_LIST_TEST_ENDPOINT);

if($validListUrl !== $baseConfig["base_url_list"]) {
    $newConfig["base_url_list"] = $validListUrl;
}

$configDiff = array_diff($baseConfig, $newConfig);

var_dump($configDiff);

// if config updated update json file
if(!empty($configDiff)) {
//Write new config
$fp = fopen('site-config.json', 'w');
fwrite($fp, json_encode($newConfig));
fclose($fp);
}

// Test fetch from url


// Write new config
// $configContent = array (
//     "base_url_list"  => "https://invidious.048596.xyz",
//     "base_url_single"  => "https://invidious.048596.xyz"
// );
// $fp = fopen('site-config.json', 'w');
// fwrite($fp, json_encode($configContent));
// fclose($fp);




// function file_exists_timeout($file, $timeout)
// {
//     // try with both, as i mentioned in comment
//     // this is just a shot :( maybe it will works for you
//     ini_set('default_socket_timeout', $timeout);
//     stream_set_timeout($file, $timeout);

//     $file = fopen($file, 'r');
//     if ($file) {
//         fclose($file);
//         return true;
//     } else {
//         return false;
//     }
// }
