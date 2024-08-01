<?php
// Para crear el archivo beats.js
// Ejecute este script reemplazando los nombres de los archivos por los suyos
// Se creará una versión Base64 de los MP3 y se incluirá en "beats.js"
$list = [
    "sonido1.mp3",
    "sonido2.mp3",
    "sonido3.mp3",
    "sonido4.mp3",
    "sonido5.mp3",
    "sonido6.mp3",
    "sonido7.mp3",
    "sonido8.mp3",
    "sonido9.mp3",
];
$b64 = [];
$b64[] = '// Sonidos MP3->base64';
$b64[] = 'let base64Beat=[];';
for ($i=0; $i < count($list); $i++) { 
    $b64[] = 'base64Beat.push("data:audio/mpeg;base64,'.base64_encode( file_get_contents( $list[$i] ) ).'");';
}
file_put_contents("beats.js",implode("\n",$b64));
?>