<?php 
    $points = $_POST["points"];
    $name = strip_tags(trim($_POST["name"]));
    $ip = $_SERVER["REMOTE_ADDR"];
    $time = date("j.n.y \k\l\o G.i");

    $name = str_replace("|", " ", $name);

    $file = fopen("records.dat","a");
    fwrite($file, $points."|".$name."|".$ip."|".$time."\n");
    fclose($file);
    
    echo "written";
?>