<?php

// Get base config string
$baseConfigString = file_get_contents("./site-config.json");

// Echo index 
$html = file_get_contents('./home/index.html');
echo $html;

?>
<script>
    window.__siteConfig = <?= $baseConfigString ?>
</script>