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
    private const UPLOAD_DIR = __DIR__ . '/../../public/assets/img/canchas/';

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

            // Procesar fotos si vienen en el request
            $uploadedFiles = $request->getUploadedFiles();
            if (!empty($uploadedFiles['fotos'])) {
                $this->procesarFotos($cancha->id_cancha, $uploadedFiles['fotos']);
            }

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

            // Procesar fotos si vienen en el request
            $uploadedFiles = $request->getUploadedFiles();
            if (!empty($uploadedFiles['fotos'])) {
                $this->procesarFotos($cancha->id_cancha, $uploadedFiles['fotos']);
            }

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
                    'url_foto' => '/public/assets/img/canchas/' . $nombreArchivo,
                ]);
            }
        }
    }
    }
