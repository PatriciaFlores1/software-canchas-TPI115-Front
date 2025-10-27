<?php

use Slim\App;
use Slim\Routing\RouteCollectorProxy as RouteCollectorProxy;
use App\Controllers\CanchasController;
use App\Controllers\CatalogosController;

return function (App $app) {
    $app->group('/api/v1', function (RouteCollectorProxy $v1) {
        $v1->group('/canchas', function (RouteCollectorProxy $group) {
            $group->get('', CanchasController::class . ':index');
            $group->get('/detalle', CanchasController::class . ':show');
            $group->post('', CanchasController::class . ':store');
            $group->put('', CanchasController::class . ':update');
            $group->patch('/estado', CanchasController::class . ':cambiarEstado');
        });

        $v1->group('/catalogos', function (RouteCollectorProxy $group) {
            $group->get('/tipos-deporte', CatalogosController::class . ':tiposDeporte');
            $group->get('/estados', CatalogosController::class . ':estados');
        });

        $v1->group('/reservas', function (RouteCollectorProxy $group) {
            // endpoints de reservas por agregar
        });

        $v1->group('/usuarios', function (RouteCollectorProxy $group) {
            // endpoints de usuarios por agregar
        });
    });

    (require_once __DIR__ . '/../http/controllers/login.php')($app);
};
