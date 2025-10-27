<?php

use Slim\App;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

return function (App $app) {
    // Páginas principales
    $app->get('/', function (Request $request, Response $response) {
        return renderView($response, 'index.html');
    });

    $app->get('/login', function (Request $request, Response $response) {
        return renderView($response, 'authentication/login.html');
    });

    $app->get('/registro', function (Request $request, Response $response) {
        return renderView($response, 'authentication/registro.html');
    });

    // Catch-all para vistas en /view (no intercepta /api/...)
    $app->get('/{path:.*}', function (Request $request, Response $response, array $args) {
        $path = $args['path'] ?? '';

        if ($path !== '' && strpos($path, 'api/') === 0) {
            $response->getBody()->write('404 Not Found');
            return $response->withStatus(404);
        }

        $viewPath = $path === '' ? 'index.html' : $path;
        return renderView($response, $viewPath);
    });
};
