<?php
namespace App\Controllers;

use App\Models\HorarioDisponible;
use App\Models\Cancha;
use App\Models\Estado;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

class HorariosController
{
    private const CONTENT_TYPE_JSON = 'application/json';

    /**
     * Guarda uno o varios horarios para una cancha.
     * Espera JSON: { id_cancha: int, horarios: [{ dia_semana, hora_inicio, hora_fin }, ...] }
     */
    public function store(Request $request, Response $response): Response
    {
        try {
            $body = (array) ($request->getParsedBody() ?? []);
            $query = $request->getQueryParams();
            $idCancha = (int) ($body['id_cancha'] ?? $query['id_cancha'] ?? 0);

            if ($idCancha <= 0) {
                $payload = json_encode(['message' => 'Falta el id_cancha o es inválido']);
                $response->getBody()->write($payload);
                return $response->withStatus(400)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
            }

            $cancha = Cancha::find($idCancha);
            if (!$cancha) {
                $payload = json_encode(['message' => 'Cancha no encontrada']);
                $response->getBody()->write($payload);
                return $response->withStatus(404)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
            }

            $items = $body['horarios'] ?? null;
            $created = [];

            // Helper: parse time string to timestamp
            $toTs = function ($t) {
                // Accept HH:MM or HH:MM:SS
                $t = trim((string) $t);
                // If contains only HH:MM, append :00
                if (preg_match('/^\d{1,2}:\d{2}$/', $t)) $t .= ':00';
                return strtotime($t);
            };

            // Load all existing horarios for this cancha once (we'll filter by day)
            $existingAll = HorarioDisponible::where('id_cancha', $idCancha)->get()->toArray();

            // Collect created in this request (to check intra-request overlaps)
            $created = [];

            $processSingle = function ($dia, $inicio, $fin) use (&$created, $existingAll, $toTs, $idCancha, $response) {
                $dia = trim((string) $dia);
                $inicioTs = $toTs($inicio);
                $finTs = $toTs($fin);
                if ($inicioTs === false || $finTs === false) {
                    return ['error' => "Formato de hora inválido para $dia: $inicio - $fin"];
                }
                if ($inicioTs >= $finTs) {
                    return ['error' => "La hora de inicio debe ser menor que la hora de fin para $dia"];
                }

                // Check against existing (same dia_semana)
                foreach ($existingAll as $ex) {
                    if (trim((string) ($ex['dia_semana'] ?? '')) !== $dia) continue;
                    $exInicio = $toTs($ex['hora_inicio'] ?? '');
                    $exFin = $toTs($ex['hora_fin'] ?? '');
                    if ($exInicio === false || $exFin === false) continue;
                    // exact duplicate
                    if ($inicioTs === $exInicio && $finTs === $exFin) {
                        return ['error' => "Horario duplicado para $dia: $inicio - $fin (existe id {$ex['id_horario']})"];
                    }
                    // overlap: inicio < exFin && fin > exInicio
                    if ($inicioTs < $exFin && $finTs > $exInicio) {
                        return ['error' => "Horario se solapa para $dia: $inicio - $fin (conflicta con id {$ex['id_horario']} {$ex['hora_inicio']}-{$ex['hora_fin']})"];
                    }
                }

                // Check against already-created in this request
                foreach ($created as $c) {
                    if (trim((string) ($c['dia_semana'] ?? '')) !== $dia) continue;
                    $cInicio = $toTs($c['hora_inicio']);
                    $cFin = $toTs($c['hora_fin']);
                    if ($inicioTs === $cInicio && $finTs === $cFin) {
                        return ['error' => "Horario duplicado en la petición para $dia: $inicio - $fin"];
                    }
                    if ($inicioTs < $cFin && $finTs > $cInicio) {
                        return ['error' => "Horario en la petición se solapa para $dia: $inicio - $fin (conflicta con otro horario agregado en la misma petición)"];
                    }
                }

                // All clear: create and add to created list
                $hd = HorarioDisponible::create([
                    'id_cancha' => $idCancha,
                    'dia_semana' => $dia,
                    'hora_inicio' => $inicio,
                    'hora_fin' => $fin,
                    'id_estado' => Estado::ACTIVO,
                ]);
                $created[] = $hd->toArray();
                return ['ok' => true];
            };

            if (is_array($items)) {
                foreach ($items as $it) {
                    $dia = $it['dia_semana'] ?? $it['dia'] ?? null;
                    $inicio = $it['hora_inicio'] ?? $it['inicio'] ?? null;
                    $fin = $it['hora_fin'] ?? $it['fin'] ?? null;
                    if (!$dia || !$inicio || !$fin) continue;

                    $resCheck = $processSingle($dia, $inicio, $fin);
                    if (isset($resCheck['error'])) {
                        $payload = json_encode(['message' => $resCheck['error']]);
                        $response->getBody()->write($payload);
                        return $response->withStatus(400)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
                    }
                }
            } else {
                // intentar leer un único horario en body plano
                $dia = $body['dia'] ?? $body['dia_semana'] ?? null;
                $inicio = $body['inicio'] ?? $body['hora_inicio'] ?? null;
                $fin = $body['fin'] ?? $body['hora_fin'] ?? null;
                if ($dia && $inicio && $fin) {
                    $resCheck = $processSingle($dia, $inicio, $fin);
                    if (isset($resCheck['error'])) {
                        $payload = json_encode(['message' => $resCheck['error']]);
                        $response->getBody()->write($payload);
                        return $response->withStatus(400)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
                    }
                }
            }

            $payload = json_encode(['message' => 'Horarios guardados', 'data' => $created]);
            $response->getBody()->write($payload);
            return $response->withStatus(201)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        } catch (ModelNotFoundException $e) {
            $payload = json_encode(['message' => 'Cancha no encontrada']);
            $response->getBody()->write($payload);
            return $response->withStatus(404)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        } catch (\Throwable $e) {
            $payload = json_encode([
                'message' => 'Ocurrió un error al guardar los horarios',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
            ]);
            $response->getBody()->write($payload);
            return $response->withStatus(500)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        }
    }

    /**
     * Lista horarios para una cancha
     * GET /api/v1/horarios?id_cancha=NN
     */
    public function index(Request $request, Response $response): Response
    {
        try {
            $query = $request->getQueryParams();
            $idCancha = (int) ($query['id_cancha'] ?? 0);
            if ($idCancha <= 0) {
                $payload = json_encode(['message' => 'Falta id_cancha o es inválido']);
                $response->getBody()->write($payload);
                return $response->withStatus(400)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
            }

            $items = HorarioDisponible::where('id_cancha', $idCancha)->orderBy('dia_semana')->orderBy('hora_inicio')->get();
            $response->getBody()->write(json_encode(['data' => $items]));
            return $response->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        } catch (\Throwable $e) {
            $payload = json_encode([
                'message' => 'Ocurrió un error al listar los horarios',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
            ]);
            $response->getBody()->write($payload);
            return $response->withStatus(500)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        }
    }

    /**
     * Eliminar un horario por id_horario
     * Método: DELETE /api/v1/horarios?id_horario=NN
     */
    public function delete(Request $request, Response $response): Response
    {
        try {
            $query = $request->getQueryParams();
            $id = (int) ($query['id_horario'] ?? 0);
            if ($id <= 0) {
                $payload = json_encode(['message' => 'Falta id_horario o es inválido']);
                $response->getBody()->write($payload);
                return $response->withStatus(400)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
            }

            $horario = HorarioDisponible::find($id);
            if (!$horario) {
                $payload = json_encode(['message' => 'Horario no encontrado']);
                $response->getBody()->write($payload);
                return $response->withStatus(404)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
            }

            $horario->delete();
            $payload = json_encode(['message' => 'Horario eliminado', 'data' => ['id_horario' => $id]]);
            $response->getBody()->write($payload);
            return $response->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        } catch (\Throwable $e) {
            $payload = json_encode([
                'message' => 'Ocurrió un error al eliminar el horario',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
            ]);
            $response->getBody()->write($payload);
            return $response->withStatus(500)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        }
    }
}
