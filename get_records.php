<?php
    $file = fopen("./records.dat","r");
    while (!feof($file)) {
        echo fgets($file);
    }
    fclose($file);
?>