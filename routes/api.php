<?php

use Slim\App;
use Slim\Routing\RouteCollectorProxy as RouteCollectorProxy;
use App\Controllers\CanchasController;
use App\Controllers\CatalogosController;
use App\Controllers\ReservasController;
use App\Controllers\PropietariosController;
use App\Controllers\UsuariosController;

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
            $group->get('', ReservasController::class . ':index');
            $group->get('/detalle', ReservasController::class . ':show');
            $group->post('', ReservasController::class . ':store');
            $group->put('', ReservasController::class . ':update');
            $group->patch('/estado', ReservasController::class . ':cambiarEstado');
            $group->get('/disponibilidad', [ReservasController::class, 'disponibilidad']);

        });

        $v1->group('/usuarios', function (RouteCollectorProxy $group) {
            $group->get('', UsuariosController::class . ':index');
            $group->get('/detalle', UsuariosController::class . ':show');
            $group->post('', UsuariosController::class . ':store');
            $group->put('', UsuariosController::class . ':update');
            $group->patch('/estado', UsuariosController::class . ':cambiarEstado');
        });

        $v1->group('/propietarios', function (RouteCollectorProxy $group) {
            $group->get('', PropietariosController::class . ':index');
            $group->get('/detalle', PropietariosController::class . ':show');
            $group->post('', PropietariosController::class . ':store');
            $group->put('', PropietariosController::class . ':update');
        });


    });

    (require_once __DIR__ . '/../http/controllers/login.php')($app);
};
