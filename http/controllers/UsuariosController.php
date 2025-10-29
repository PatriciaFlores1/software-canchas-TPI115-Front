<?php
namespace App\Controllers;

use App\Models\Usuario;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class UsuariosController
{
    public function index(Request $request, Response $response): Response
    {
        $usuarios = Usuario::with(['rol', 'estado'])->get();
        $response->getBody()->write(json_encode($usuarios));
        return $response->withHeader('Content-Type', 'application/json');
    }

public function show(Request $request, Response $response): Response
{
    $params = $request->getQueryParams();
    $id = $params['id_usuario'] ?? null;

    if (!$id) {
        $response->getBody()->write(json_encode([
            'error' => 'Falta el parámetro id_usuario'
        ]));

        return $response->withHeader('Content-Type', 'application/json')
                        ->withStatus(400);
    }

    $usuario = Usuario::with(['rol', 'estado'])->find($id);

    if (!$usuario) {
        $response->getBody()->write(json_encode([
            'error' => 'Usuario no encontrado'
        ]));

        return $response->withHeader('Content-Type', 'application/json')
                        ->withStatus(404);
    }

    $response->getBody()->write(json_encode($usuario));

    return $response->withHeader('Content-Type', 'application/json')
                    ->withStatus(200);
}


    public function store(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody();

        if (isset($data['password'])) {
            $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
        }

        $usuario = Usuario::create([
            'nombre' => $data['nombre'] ?? null,
            'apellido' => $data['apellido'] ?? null,
            'email' => $data['email'] ?? null,
            'password' => $data['password'] ?? null,
            'telefono' => $data['telefono'] ?? null,
            'id_rol' => $data['id_rol'] ?? null,
            'id_estado' => $data['id_estado'] ?? null,
            'url_foto' => $data['url_foto'] ?? null,
        ]);

        $response->getBody()->write(json_encode([
            'message' => 'Usuario creado correctamente',
            'id_usuario' => $usuario->id_usuario
        ]));

        return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
    }

    public function update(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody();
        $id = $data['id_usuario'] ?? null;

        if (!$id) {
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json')
                ->write(json_encode(['error' => 'Falta el parámetro id_usuario']));
        }

        $usuario = Usuario::find($id);
        if (!$usuario) {
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json')
                ->write(json_encode(['error' => 'Usuario no encontrado']));
        }

        if (isset($data['password']) && $data['password'] !== '') {
            $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
        } else {
            unset($data['password']);
        }

        $usuario->update($data);

        $response->getBody()->write(json_encode([
            'message' => 'Usuario actualizado correctamente'
        ]));

        return $response->withHeader('Content-Type', 'application/json');
    }

    public function destroy(Request $request, Response $response): Response
    {
        $params = $request->getQueryParams();
        $id = $params['id_usuario'] ?? null;

        if (!$id) {
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json')
                ->write(json_encode(['error' => 'Falta el id_usuario']));
        }

        $usuario = Usuario::find($id);
        if (!$usuario) {
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json')
                ->write(json_encode(['error' => 'Usuario no encontrado']));
        }

        $usuario->delete();

        return $response->withHeader('Content-Type', 'application/json')
            ->write(json_encode(['message' => 'Usuario eliminado correctamente']));
    }
}
