<?php
use Slim\App;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

return function (App $app) {

    $app->post('/api/v1/login', function (Request $request, Response $response) {

        $data = $request->getParsedBody();
        $user = $data['user'] ?? '';
        $pass = $data['pass'] ?? '';

        if ($user === 'admin' && $pass === '1234') {
            $result = ['status' => 'ok', 'message' => 'Login correcto'];
        } else {
            $result = ['status' => 'error', 'message' => 'Credenciales inválidas'];
        }

        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json');
    });
};
