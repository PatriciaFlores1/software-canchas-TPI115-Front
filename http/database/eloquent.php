<?php

use Illuminate\Database\Capsule\Manager as Capsule;
use Illuminate\Pagination\Paginator;

$rootPath = dirname(__DIR__, 2);

if (class_exists(\Dotenv\Dotenv::class)) {
    \Dotenv\Dotenv::createImmutable($rootPath)->safeLoad();
}

$host      = $_ENV['DB_HOST'] ?? 'localhost';
$port      = $_ENV['DB_PORT'] ?? 3306;
$database  = $_ENV['DB_DATABASE'] ?? 'sistema_reserva';
$username  = $_ENV['DB_USERNAME'] ?? 'root';
$password  = $_ENV['DB_PASSWORD'] ?? '';
$charset   = $_ENV['DB_CHARSET'] ?? 'utf8';
$collation = $_ENV['DB_COLLATION'] ?? 'utf8_unicode_ci';
$prefix    = $_ENV['DB_PREFIX'] ?? '';

$capsule = new Capsule();

$capsule->addConnection([
    'driver'    => 'mysql',
    'host'      => $host,
    'port'      => (int) $port,
    'database'  => $database,
    'username'  => $username,
    'password'  => $password,
    'charset'   => $charset,
    'collation' => $collation,
    'prefix'    => $prefix,
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

Paginator::currentPathResolver(function () {
    return strtok($_SERVER['REQUEST_URI'], '?');
});

Paginator::currentPageResolver(function ($pageName = 'page') {
    return $_GET[$pageName] ?? 1;
});
