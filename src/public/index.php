<?php

// include app
include('./app/app.php');

// Echo index 
$html= file_get_contents('./home/index.html');
echo $html;

?>
<script>
    window.__siteConfig = <?= json_encode($newConfig) ?>
</script>