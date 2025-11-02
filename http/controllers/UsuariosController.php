<?php
namespace App\Controllers;

use App\Models\Usuario;
use App\Models\Rol;
use App\Models\Estado;
use Illuminate\Database\QueryException;
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

        // Validaciones básicas
        $required = ['nombre', 'apellido', 'email', 'password'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                $response->getBody()->write(json_encode(['error' => "Falta el campo $field"]));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }
        }

        // Establecer valores por defecto para rol/estado si no se envían
        $data['id_rol'] = isset($data['id_rol']) && $data['id_rol'] !== '' ? (int)$data['id_rol'] : 1;
        $data['id_estado'] = isset($data['id_estado']) && $data['id_estado'] !== '' ? (int)$data['id_estado'] : 1;

        // Email único
        if (Usuario::where('email', $data['email'])->exists()) {
            $response->getBody()->write(json_encode(['error' => 'El correo ya está registrado']));
            return $response->withStatus(409)->withHeader('Content-Type', 'application/json');
        }

        // Validar rol y estado existen; si el id enviado no existe, intentar con el id por defecto 1
        if (!Rol::find($data['id_rol'])) {
            $data['id_rol'] = 1;
        }

        if (!Estado::find($data['id_estado'])) {
            $data['id_estado'] = 1;
        }

        // Si aun así el rol/estado por defecto no existen, devolver error
        if (!Rol::find($data['id_rol'])) {
            $response->getBody()->write(json_encode(['error' => 'Rol inválido y rol por defecto no encontrado (id=1)']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }

        if (!Estado::find($data['id_estado'])) {
            $response->getBody()->write(json_encode(['error' => 'Estado inválido y estado por defecto no encontrado (id=1)']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }

        // Hashear contraseña
        $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT);

        try {
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
        } catch (QueryException $e) {
            // Capturar errores de integridad referencial u otros errores de SQL
            $response->getBody()->write(json_encode(['error' => 'Error al crear usuario en la base de datos', 'details' => $e->getMessage()]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['error' => 'Error interno', 'details' => $e->getMessage()]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode([
            'message' => 'Usuario creado correctamente',
            'id_usuario' => $usuario->id_usuario
        ]));

        return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
    }

    public function update(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody();
        $uploadedFiles = $request->getUploadedFiles();

        $id = $data['id_usuario'] ?? null;

        if (!$id) {
            $response->getBody()->write(json_encode(['error' => 'Falta el parámetro id_usuario']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $usuario = Usuario::find($id);
        if (!$usuario) {
            $response->getBody()->write(json_encode(['error' => 'Usuario no encontrado']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }


        // Si se envía cambio de contraseña, requerir current_password y verificarla
        if (!empty($data['password'])) {
            $current = $data['current_password'] ?? '';
            if (empty($current) || !password_verify($current, $usuario->password)) {
                $response->getBody()->write(json_encode(['error' => 'Contraseña actual inválida']));
                return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
            }

            $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
            // limpiar current_password del array antes de guardar
            unset($data['current_password']);
        } else {
            unset($data['password']);
            unset($data['current_password']);
        }

        // Procesar avatar si viene en archivos subidos
        if (!empty($uploadedFiles['avatar'])) {
            $avatar = $uploadedFiles['avatar'];
            if (is_array($avatar)) {
                $avatar = $avatar[0];
            }

            if ($avatar && $avatar->getError() === UPLOAD_ERR_OK) {
                $uploadDir = __DIR__ . '/../../public/assets/img/usuarios/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }
                $ext = pathinfo($avatar->getClientFilename(), PATHINFO_EXTENSION);
                $fileName = $usuario->id_usuario . '_' . time() . '.' . $ext;
                $dest = $uploadDir . $fileName;
                $avatar->moveTo($dest);
                $data['url_foto'] = '/public/assets/img/usuarios/' . $fileName;
            }
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
            $response->getBody()->write(json_encode(['error' => 'Falta el id_usuario']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $usuario = Usuario::find($id);
        if (!$usuario) {
            $response->getBody()->write(json_encode(['error' => 'Usuario no encontrado']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $usuario->delete();

        $response->getBody()->write(json_encode(['message' => 'Usuario eliminado correctamente']));
        return $response->withHeader('Content-Type', 'application/json');
    }
}
