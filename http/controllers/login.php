<?php
require_once __DIR__ . '/../database/conexion.php';

use Slim\App;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Infrastructure\Persistence\Database;

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

    $app->get('/api/v1/canchas/index', function (Request $request, Response $response) {
        $result = ['status' => 'ok', 'data' => []];

        try {
            // Si tu proyecto usa composer autoload, asegúrate de incluirlo en la bootstrap de la app.
            $db = new Database();
            $conn = $db->getConnection();

            $stmt = $conn->query('SELECT * FROM cancha');
            $rows = $stmt->fetchAll();

            $result['data'] = $rows;
        } catch (Exception $e) {
            $result = ['status' => 'error', 'message' => 'holaaaaaaa' . $e->getMessage()];
        }

        $response->getBody()->write(json_encode($result, JSON_UNESCAPED_UNICODE));
        return $response->withHeader('Content-Type', 'application/json');
    });

};
