<?php
// router.php - usado con el servidor embebido de PHP
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$file = __DIR__ . $path;

// Si el archivo existe en el sistema de ficheros, dejar que el servidor lo sirva
if ($path !== '/' && file_exists($file) && is_file($file)) {
    return false;
}

// En caso contrario, pasar la petición al front controller
require __DIR__ . '/index.php';
