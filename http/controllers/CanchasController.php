<?php

namespace App\Controllers;

use App\Models\Cancha;
use App\Models\Estado;
use App\Models\FotoCancha;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

class CanchasController
{
    private const CONTENT_TYPE_JSON = 'application/json';
    private const MSG_NOT_FOUND = 'Cancha no encontrada';
    private const MSG_INVALID_ID = 'El parámetro id_cancha debe ser un entero válido';
    // Upload directory for cancha photos (changed to img-cancha as requested)
    private const UPLOAD_DIR = __DIR__ . '/../../public/assets/img/img-cancha/';

    public function index(Request $request, Response $response): Response
    {
        try {
            $canchas = Cancha::with(['tipoDeporte', 'estado'])
            ->orderBy('id_cancha', 'asc')
            ->paginate(10);

            $data = collect($canchas->items())->map(function ($cancha) {
                return [
                    'id_cancha' => $cancha->id_cancha,
                    'nombre' => $cancha->nombre,
                    'ubicacion' => $cancha->ubicacion,
                    'id_tipo_deporte' => $cancha->id_tipo_deporte,
                    'tipo_deporte' => $cancha->tipoDeporte->nombre ?? null,
                    'id_estado' => $cancha->id_estado,
                    'estado' => $cancha->estado->nombre ?? null,
                ];
            });

            $response->getBody()->write(json_encode([
                'data' => $data,
                'pagination' => [
                    'total' => $canchas->total(),
                    'per_page' => $canchas->perPage(),
                    'current_page' => $canchas->currentPage(),
                    'last_page' => $canchas->lastPage(),
                    'from' => $canchas->firstItem(),
                    'to' => $canchas->lastItem(),
                ]
            ]));
            return $response->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        } catch (\Throwable $e) {
            $response->getBody()->write(json_encode([
                'message' => 'Ocurrió un error al obtener las canchas',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        }
    }

    public function show(Request $request, Response $response): Response
    {
        try {
            $query = $request->getQueryParams();
            $id = (int) ($query['id_cancha'] ?? 0);
            
            if ($id <= 0) {
                $payload = json_encode(['message' => self::MSG_INVALID_ID]);
                $response->getBody()->write($payload);
                return $response->withStatus(400)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
            }

            $cancha = Cancha::with(['tipoDeporte', 'fotos'])
                ->findOrFail($id);
            
            $data = [
                'id_cancha' => $cancha->id_cancha,
                'nombre' => $cancha->nombre,
                'id_tipo_deporte' => $cancha->id_tipo_deporte,
                'tipo_deporte' => $cancha->tipoDeporte->nombre ?? null,
                'ubicacion' => $cancha->ubicacion,
                'precio' => $cancha->precio_hora,
                'descripcion' => $cancha->descripcion,
                'condiciones_uso' => $cancha->condiciones_uso,
                'coordenadas' => $cancha->coordenada,
                'fotos' => $cancha->fotos,
            ];
            
            $payload = json_encode(['data' => $data]);
            $response->getBody()->write($payload);
            return $response->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        } catch (ModelNotFoundException $e) {
            $payload = json_encode(['message' => self::MSG_NOT_FOUND]);
            $response->getBody()->write($payload);
            return $response->withStatus(404)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        } catch (\Throwable $e) {
            $payload = json_encode([
                'message' => 'Ocurrió un error al obtener la cancha',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
            ]);
            $response->getBody()->write($payload);
            return $response->withStatus(500)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        }
    }

    public function update(Request $request, Response $response): Response
    {
        try {
            $body = (array) ($request->getParsedBody() ?? []);
            $id = (int) ($body['id_cancha'] ?? 0);
            
            if ($id <= 0) {
                $payload = json_encode(['message' => self::MSG_INVALID_ID]);
                $response->getBody()->write($payload);
                return $response->withStatus(400)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
            }

            $cancha = Cancha::findOrFail($id);
            $cancha->update($body);

            $cancha->load(['tipoDeporte', 'fotos']);

            $data = [
                'id_cancha' => $cancha->id_cancha,
                'nombre' => $cancha->nombre,
                'id_tipo_deporte' => $cancha->id_tipo_deporte,
                'tipo_deporte' => $cancha->tipoDeporte->nombre ?? null,
                'ubicacion' => $cancha->ubicacion,
                'precio' => $cancha->precio_hora,
                'descripcion' => $cancha->descripcion,
                'condiciones_uso' => $cancha->condiciones_uso,
                'coordenadas' => $cancha->coordenada,
                'fotos' => $cancha->fotos,
            ];

            $payload = json_encode([
                'message' => 'Cancha actualizada exitosamente',
                'data' => $data,
            ]);
            $response->getBody()->write($payload);
            return $response->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        } catch (ModelNotFoundException $e) {
            $payload = json_encode(['message' => self::MSG_NOT_FOUND]);
            $response->getBody()->write($payload);
            return $response->withStatus(404)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        } catch (\Throwable $e) {
            $payload = json_encode([
                'message' => 'Ocurrió un error al actualizar la cancha',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
            ]);
            $response->getBody()->write($payload);
            return $response->withStatus(500)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        }
    }

    public function store(Request $request, Response $response): Response
    {
        try {
            $body = (array) ($request->getParsedBody() ?? []);
            if (!isset($body['id_estado'])) {
                $body['id_estado'] = Estado::ACTIVO;
            }

            $cancha = Cancha::create($body);

            $cancha->load(['tipoDeporte', 'fotos']);

            $data = [
                'id_cancha' => $cancha->id_cancha,
                'nombre' => $cancha->nombre,
                'id_tipo_deporte' => $cancha->id_tipo_deporte,
                'tipo_deporte' => $cancha->tipoDeporte->nombre ?? null,
                'ubicacion' => $cancha->ubicacion,
                'precio' => $cancha->precio_hora,
                'descripcion' => $cancha->descripcion,
                'condiciones_uso' => $cancha->condiciones_uso,
                'coordenadas' => $cancha->coordenada,
                'fotos' => $cancha->fotos,
            ];

            $payload = json_encode([
                'message' => 'Cancha creada exitosamente',
                'data' => $data,
            ]);
            $response->getBody()->write($payload);
            return $response->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        } catch (\Throwable $e) {
            $payload = json_encode([
                'message' => 'Ocurrió un error al crear la cancha',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
            ]);
            $response->getBody()->write($payload);
            return $response->withStatus(500)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        }
    }

    public function cambiarEstado(Request $request, Response $response): Response
    {
        try {
            $query = $request->getQueryParams();
            $id = (int) ($query['id_cancha'] ?? 0);
            
            if ($id <= 0) {
                $payload = json_encode(['message' => self::MSG_INVALID_ID]);
                $response->getBody()->write($payload);
                return $response->withStatus(400)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
            }

            $cancha = Cancha::findOrFail($id);
            
            // Toggle estado: si está activo pasa a inactivo, si está inactivo pasa a activo
            $nuevoEstado = $cancha->id_estado == Estado::ACTIVO ? Estado::INACTIVO : Estado::ACTIVO;
            $cancha->update(['id_estado' => $nuevoEstado]);

            $mensaje = $nuevoEstado == Estado::ACTIVO ? 'Cancha activada exitosamente' : 'Cancha desactivada exitosamente';
            $payload = json_encode([
                'message' => $mensaje,
                'data' => [
                    'id_cancha' => $cancha->id_cancha,
                    'id_estado' => $cancha->id_estado,
                    'estado' => $cancha->estado->nombre ?? null,
                ]
            ]);
            $response->getBody()->write($payload);
            return $response->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        } catch (ModelNotFoundException $e) {
            $payload = json_encode(['message' => self::MSG_NOT_FOUND]);
            $response->getBody()->write($payload);
            return $response->withStatus(404)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        } catch (\Throwable $e) {
            $payload = json_encode([
                'message' => 'Ocurrió un error al cambiar el estado de la cancha',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
            ]);
            $response->getBody()->write($payload);
            return $response->withStatus(500)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        }
    }

    /**
     * Procesa un array de archivos de fotos y los guarda físicamente y en la BD
     * @param int $idCancha
     * @param array $fotos Array de UploadedFileInterface
     */
    private function procesarFotos(int $idCancha, array $fotos): void
    {
        if (!is_dir(self::UPLOAD_DIR)) {
            mkdir(self::UPLOAD_DIR, 0755, true);
        }

        foreach ($fotos as $index => $foto) {
            if ($foto->getError() === UPLOAD_ERR_OK) {
                $extension = pathinfo($foto->getClientFilename(), PATHINFO_EXTENSION);
                $nombreArchivo = $idCancha . '_' . time() . '_' . $index . '.' . $extension;
                $rutaDestino = self::UPLOAD_DIR . $nombreArchivo;
                
                $foto->moveTo($rutaDestino);
                
                FotoCancha::create([
                    'id_cancha' => $idCancha,
                    'url_foto' => '/public/assets/img/img-cancha/' . $nombreArchivo,
                ]);
            }
        }
    }

    /**
     * Endpoint helper: almacena fotos para una cancha existente (subida separada)
     */
    public function storeFotos(Request $request, Response $response): Response
    {
        try {
            $body = (array) ($request->getParsedBody() ?? []);
            $query = $request->getQueryParams();
            $id = (int) ($body['id_cancha'] ?? $query['id_cancha'] ?? 0);

            if ($id <= 0) {
                $payload = json_encode(['message' => 'Falta el id_cancha o es inválido']);
                $response->getBody()->write($payload);
                return $response->withStatus(400)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
            }

            $cancha = Cancha::find($id);
            if (!$cancha) {
                $payload = json_encode(['message' => 'Cancha no encontrada']);
                $response->getBody()->write($payload);
                return $response->withStatus(404)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
            }

            $uploadedFiles = $request->getUploadedFiles();
            if (empty($uploadedFiles['fotos'])) {
                $payload = json_encode(['message' => 'No se enviaron archivos']);
                $response->getBody()->write($payload);
                return $response->withStatus(400)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
            }

            $this->procesarFotos($cancha->id_cancha, $uploadedFiles['fotos']);

            $cancha->load('fotos');

            $payload = json_encode(['message' => 'Fotos subidas correctamente', 'data' => $cancha->fotos]);
            $response->getBody()->write($payload);
            return $response->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        } catch (\Throwable $e) {
            $payload = json_encode([
                'message' => 'Ocurrió un error al subir las fotos',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
            ]);
            $response->getBody()->write($payload);
            return $response->withStatus(500)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        }
    }
    
    /**
     * Eliminar una foto de cancha por id_foto
     * Método: DELETE /api/v1/canchas/fotos?id_foto=123
     */
    public function deleteFoto(Request $request, Response $response): Response
    {
        try {
            $query = $request->getQueryParams();
            $id = (int) ($query['id_foto'] ?? 0);

            if ($id <= 0) {
                $payload = json_encode(['message' => 'Falta el id_foto o es inválido']);
                $response->getBody()->write($payload);
                return $response->withStatus(400)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
            }

            $foto = FotoCancha::find($id);
            if (!$foto) {
                $payload = json_encode(['message' => 'Foto no encontrada']);
                $response->getBody()->write($payload);
                return $response->withStatus(404)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
            }

            // Eliminar archivo físico si existe
            $url = $foto->url_foto; // ejemplo: /public/assets/img/img-cancha/filename.jpg
            $relative = ltrim($url, '/');
            $filePath = __DIR__ . '/../../' . $relative;
            if (is_file($filePath)) {
                @unlink($filePath);
            }

            $foto->delete();

            $payload = json_encode(['message' => 'Foto eliminada correctamente', 'data' => ['id_foto' => $id]]);
            $response->getBody()->write($payload);
            return $response->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        } catch (\Throwable $e) {
            $payload = json_encode([
                'message' => 'Ocurrió un error al eliminar la foto',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
            ]);
            $response->getBody()->write($payload);
            return $response->withStatus(500)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        }
    }
}
