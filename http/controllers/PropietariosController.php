<?php
namespace App\Controllers;

use App\Models\Propietario;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class PropietariosController
{
    public function index(Request $request, Response $response): Response
    {
        $propietarios = Propietario::with(['usuario', 'cancha'])->get();
        $response->getBody()->write(json_encode($propietarios));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function show(Request $request, Response $response): Response
    {
        $params = $request->getQueryParams();
        $id = $params['id'] ?? null;

        if (!$id) {
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json')
                ->write(json_encode(['error' => 'Falta el parámetro id']));
        }

        $propietario = Propietario::with(['usuario', 'cancha'])->find($id);
        if (!$propietario) {
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json')
                ->write(json_encode(['error' => 'Propietario no encontrado']));
        }

        $response->getBody()->write(json_encode($propietario));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function store(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody();

        $propietario = Propietario::create($data);

        $response->getBody()->write(json_encode([
            'message' => 'Propietario creado correctamente',
            'id' => $propietario->id_propietario
        ]));

        return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
    }

    public function update(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody();
        $id = $data['id_propietario'] ?? null;

        if (!$id) {
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json')
                ->write(json_encode(['error' => 'Falta el ID']));
        }

        $propietario = Propietario::find($id);
        if (!$propietario) {
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json')
                ->write(json_encode(['error' => 'Propietario no encontrado']));
        }

        $propietario->update($data);

        $response->getBody()->write(json_encode([
            'message' => 'Propietario actualizado correctamente'
        ]));

        return $response->withHeader('Content-Type', 'application/json');
    }

    public function destroy(Request $request, Response $response): Response
    {
        $params = $request->getQueryParams();
        $id = $params['id'] ?? null;

        if (!$id) {
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json')
                ->write(json_encode(['error' => 'Falta el ID']));
        }

        $propietario = Propietario::find($id);
        if (!$propietario) {
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json')
                ->write(json_encode(['error' => 'No encontrado']));
        }

        $propietario->delete();

        return $response->withHeader('Content-Type', 'application/json')
            ->write(json_encode(['message' => 'Eliminado correctamente']));
    }
}
