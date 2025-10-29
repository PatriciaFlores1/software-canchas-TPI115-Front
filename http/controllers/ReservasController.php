<?php

namespace App\Controllers;

use App\Models\Reserva;
use App\Models\Estado;
use App\Models\HorarioDisponible;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use DateTime;

class ReservasController
{
    private const CONTENT_TYPE_JSON = 'application/json';
    private const MSG_NOT_FOUND = 'Reserva no encontrada';
    private const MSG_INVALID_ID = 'El parámetro id_reserva debe ser un entero válido';

    public function index(Request $request, Response $response): Response
    {
        try {
            $reservas = Reserva::with(['usuario', 'cancha', 'estado', 'pago'])
                ->orderBy('id_reserva', 'desc')
                ->paginate(10);

            $data = collect($reservas->items())->map(function ($reserva) {
                return [
                    'id_reserva' => $reserva->id_reserva,
                    'usuario' => $reserva->usuario->nombre ?? null,
                    'id_usuario' => $reserva->id_usuario,
                    'cancha' => $reserva->cancha->nombre ?? null,
                    'id_cancha' => $reserva->id_cancha,
                    'estado' => $reserva->estado->nombre ?? null,
                    'id_estado' => $reserva->id_estado,
                    'fecha_inicio' => $reserva->fecha_inicio,
                    'fecha_fin' => $reserva->fecha_fin,
                    'nombre_cliente' => $reserva->nombre_cliente,
                ];
            });

            $response->getBody()->write(json_encode([
                'data' => $data,
                'pagination' => [
                    'total' => $reservas->total(),
                    'per_page' => $reservas->perPage(),
                    'current_page' => $reservas->currentPage(),
                    'last_page' => $reservas->lastPage(),
                    'from' => $reservas->firstItem(),
                    'to' => $reservas->lastItem(),
                ]
            ]));
            return $response->withHeader('Content-Type', self::CONTENT_TYPE_JSON);

        } catch (\Throwable $e) {
            return $this->errorResponse($response, 'Ocurrió un error al obtener las reservas', $e);
        }
    }

    public function show(Request $request, Response $response): Response
    {
        try {
            $query = $request->getQueryParams();
            $id = (int) ($query['id_reserva'] ?? 0);

            if ($id <= 0) {
                return $this->badRequest($response, self::MSG_INVALID_ID);
            }

            $reserva = Reserva::with(['usuario', 'cancha', 'estado', 'pago'])->findOrFail($id);

            $data = [
                'id_reserva' => $reserva->id_reserva,
                'id_usuario' => $reserva->id_usuario,
                'usuario' => $reserva->usuario->nombre ?? null,
                'id_cancha' => $reserva->id_cancha,
                'cancha' => $reserva->cancha->nombre ?? null,
                'fecha_inicio' => $reserva->fecha_inicio,
                'fecha_fin' => $reserva->fecha_fin,
                'id_estado' => $reserva->id_estado,
                'estado' => $reserva->estado->nombre ?? null,
                'nombre_cliente' => $reserva->nombre_cliente,
                'nombre_cancha' => $reserva->nombre_cancha,
                'pago' => $reserva->pago,
            ];

            $response->getBody()->write(json_encode(['data' => $data]));
            return $response->withHeader('Content-Type', self::CONTENT_TYPE_JSON);

        } catch (ModelNotFoundException $e) {
            return $this->notFound($response, self::MSG_NOT_FOUND);
        } catch (\Throwable $e) {
            return $this->errorResponse($response, 'Ocurrió un error al obtener la reserva', $e);
        }
    }

private function validarDisponibilidadReserva(int $idCancha, DateTime $inicio, DateTime $fin, ?int $idReservaExcluir = null): ?string
    {
        // Validaciones básicas
        $ahora = new DateTime();
        if ($inicio < $ahora) return 'La fecha de inicio debe ser futura';
        if (($fin->getTimestamp() - $inicio->getTimestamp()) / 3600 < 1) return 'La duración mínima de la reserva es 1 hora';

        $fecha = $inicio->format('Y-m-d');
        $diaSemana = (int)$inicio->format('N');

        // Horarios activos del día
        $horarios = HorarioDisponible::where('id_cancha', $idCancha)
            ->where('dia_semana', $diaSemana)
            ->where('id_estado', Estado::ACTIVO)
            ->get();
        if ($horarios->isEmpty()) return 'No hay horarios disponibles para ese día';

        // Reservas activas del día
        $reservas = Reserva::where('id_cancha', $idCancha)
            ->where('id_estado', Estado::ACTIVO)
            ->whereDate('fecha_inicio', '<=', $fecha)
            ->whereDate('fecha_fin', '>=', $fecha)
            ->orderBy('fecha_inicio')
            ->get();

        error_log("HORARIOS para cancha $idCancha y dia $diaSemana:");
        foreach ($horarios as $h) {
            error_log(" - horario: [$h->hora_inicio] a [$h->hora_fin]");
        }
        error_log("RESERVAS activas ese dia:");
        foreach ($reservas as $r) {
            error_log(" - reserva: {$r->fecha_inicio} - {$r->fecha_fin}");
        }


        // Calcular bloques disponibles
        $bloquesDisponibles = [];
        foreach ($horarios as $horario) {
            /*
            $horaInicioStr = trim($horario->hora_inicio);
            $horaFinStr = trim($horario->hora_fin);

            $inicioHorario = preg_match('/\d{4}-\d{2}-\d{2}/', $horaInicioStr) ? new DateTime($horaInicioStr) : new DateTime("$fecha $horaInicioStr");
            $finHorario = preg_match('/\d{4}-\d{2}-\d{2}/', $horaFinStr) ? new DateTime($horaFinStr) : new DateTime("$fecha $horaFinStr");
            */
            $inicioHorario = new DateTime("$fecha {$horario->hora_inicio}");
            $finHorario    = new DateTime("$fecha {$horario->hora_fin}");
            
            $bloques = [[$inicioHorario, $finHorario]];

            foreach ($reservas as $reserva) {
                $reservaInicio = new DateTime($reserva->fecha_inicio);
                $reservaFin = new DateTime($reserva->fecha_fin);

                $nuevosBloques = [];
                foreach ($bloques as [$bInicio, $bFin]) {
                    if ($reservaFin <= $bInicio || $reservaInicio >= $bFin) {
                        $nuevosBloques[] = [$bInicio, $bFin];
                    } else {
                        if ($bInicio < $reservaInicio) $nuevosBloques[] = [$bInicio, $reservaInicio];
                        if ($reservaFin < $bFin) $nuevosBloques[] = [$reservaFin, $bFin];
                    }
                }
                $bloques = $nuevosBloques;
            }

            foreach ($bloques as [$bInicio, $bFin]) {
                $bloquesDisponibles[] = [$bInicio, $bFin];
            }
        }

        // Validar que la reserva encaje en algún bloque disponible
        foreach ($bloquesDisponibles as [$bInicio, $bFin]) {
            if ($inicio >= $bInicio && $fin <= $bFin) {
                $query = Reserva::where('id_cancha', $idCancha)
                    ->where('id_estado', Estado::ACTIVO)
                    ->where(function ($q) use ($inicio, $fin) {
                        $q->whereBetween('fecha_inicio', [$inicio, $fin])
                          ->orWhereBetween('fecha_fin', [$inicio, $fin])
                          ->orWhere(function ($q2) use ($inicio, $fin) {
                              $q2->where('fecha_inicio', '<=', $inicio)
                                 ->where('fecha_fin', '>=', $fin);
                          });
                    });

                if ($idReservaExcluir) $query->where('id_reserva', '!=', $idReservaExcluir);
                if ($query->exists()) return 'Ya existe una reserva activa en ese horario para la cancha';
                
                return null; // Todo ok
            }
        }

        return 'La reserva no se encuentra dentro del horario permitido para ese día';
    }


    public function disponibilidad(Request $request, Response $response): Response
    {
        try {
            $query = $request->getQueryParams();
            $idCancha = (int)($query['id_cancha'] ?? 0);
            $fecha = $query['fecha'] ?? null;

            if ($idCancha <= 0 || !$fecha) return $this->badRequest($response, 'Debe proporcionar id_cancha y fecha');

            $fechaObj = new DateTime($fecha);
            $diaSemana = (int)$fechaObj->format('N');

            $horarios = HorarioDisponible::where('id_cancha', $idCancha)
                ->where('dia_semana', $diaSemana)
                ->where('id_estado', Estado::ACTIVO)
                ->get();

            $reservas = Reserva::where('id_cancha', $idCancha)
                ->where('id_estado', Estado::ACTIVO)
                ->whereDate('fecha_inicio', '<=', $fecha)
                ->whereDate('fecha_fin', '>=', $fecha)
                ->orderBy('fecha_inicio')
                ->get();

            $disponibles = [];
            foreach ($horarios as $horario) {
                $horaInicioStr = trim($horario->hora_inicio);
                $horaFinStr = trim($horario->hora_fin);

                $inicioHorario = preg_match('/\d{4}-\d{2}-\d{2}/', $horaInicioStr) ? new DateTime($horaInicioStr) : new DateTime("$fecha $horaInicioStr");
                $finHorario = preg_match('/\d{4}-\d{2}-\d{2}/', $horaFinStr) ? new DateTime($horaFinStr) : new DateTime("$fecha $horaFinStr");

                $bloques = [[$inicioHorario, $finHorario]];

                foreach ($reservas as $reserva) {
                    $reservaInicio = new DateTime($reserva->fecha_inicio);
                    $reservaFin = new DateTime($reserva->fecha_fin);

                    $nuevosBloques = [];
                    foreach ($bloques as [$bInicio, $bFin]) {
                        if ($reservaFin <= $bInicio || $reservaInicio >= $bFin) {
                            $nuevosBloques[] = [$bInicio, $bFin];
                        } else {
                            if ($bInicio < $reservaInicio) $nuevosBloques[] = [$bInicio, $reservaInicio];
                            if ($reservaFin < $bFin) $nuevosBloques[] = [$reservaFin, $bFin];
                        }
                    }
                    $bloques = $nuevosBloques;
                }

                foreach ($bloques as [$bInicio, $bFin]) {
                    $disponibles[] = [
                        'hora_inicio' => $bInicio->format('H:i'),
                        'hora_fin' => $bFin->format('H:i'),
                    ];
                }
            }

            $response->getBody()->write(json_encode([
                'id_cancha' => $idCancha,
                'fecha' => $fecha,
                'disponible' => $disponibles
            ]));

            return $response->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        } catch (\Throwable $e) {
            return $this->errorResponse($response, 'Ocurrió un error al consultar la disponibilidad', $e);
        }
    }


    public function store(Request $request, Response $response): Response
    {
        try {
            $body = (array)($request->getParsedBody() ?? []);

            if (!isset($body['id_usuario'], $body['id_cancha'], $body['fecha_inicio'], $body['fecha_fin'])) {
                return $this->badRequest($response, 'Faltan campos obligatorios: id_usuario, id_cancha, fecha_inicio, fecha_fin');
            }

            $inicio = new DateTime($body['fecha_inicio']);
            $fin = new DateTime($body['fecha_fin']);

            $error = $this->validarDisponibilidadReserva((int)$body['id_cancha'], $inicio, $fin);
            if ($error) return $this->badRequest($response, $error);

            $body['id_estado'] = $body['id_estado'] ?? Estado::ACTIVO;
            $reserva = Reserva::create($body);
            $reserva->load(['usuario', 'cancha', 'estado', 'pago']);

            $response->getBody()->write(json_encode([
                'message' => 'Reserva creada exitosamente',
                'data' => $reserva,
            ]));

            return $response->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        } catch (\Throwable $e) {
            return $this->errorResponse($response, 'Ocurrió un error al crear la reserva', $e);
        }
    }


    public function update(Request $request, Response $response): Response
    {
        try {
            $body = (array)($request->getParsedBody() ?? []);
            $id = (int)($body['id_reserva'] ?? 0);

            if ($id <= 0) return $this->badRequest($response, 'ID de reserva inválido');

            $reserva = Reserva::findOrFail($id);

            if (isset($body['fecha_inicio'], $body['fecha_fin'])) {
                $inicio = new DateTime($body['fecha_inicio']);
                $fin = new DateTime($body['fecha_fin']);

                $error = $this->validarDisponibilidadReserva($reserva->id_cancha, $inicio, $fin, $reserva->id_reserva);
                if ($error) return $this->badRequest($response, $error);
            }

            $reserva->update($body);
            $reserva->load(['usuario', 'cancha', 'estado', 'pago']);

            $response->getBody()->write(json_encode([
                'message' => 'Reserva actualizada exitosamente',
                'data' => $reserva,
            ]));

            return $response->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        } catch (ModelNotFoundException $e) {
            return $this->notFound($response, self::MSG_NOT_FOUND);
        } catch (\Throwable $e) {
            return $this->errorResponse($response, 'Ocurrió un error al actualizar la reserva', $e);
        }
    }



    public function cambiarEstado(Request $request, Response $response): Response
    {
        try {
            $query = $request->getQueryParams();
            $id = (int) ($query['id_reserva'] ?? 0);

            if ($id <= 0) {
                return $this->badRequest($response, self::MSG_INVALID_ID);
            }

            $reserva = Reserva::findOrFail($id);
            $nuevoEstado = $reserva->id_estado == Estado::ACTIVO ? Estado::INACTIVO : Estado::ACTIVO;
            $reserva->update(['id_estado' => $nuevoEstado]);
            $reserva->load('estado');

            $payload = json_encode([
                'message' => $nuevoEstado == Estado::ACTIVO
                    ? 'Reserva activada exitosamente'
                    : 'Reserva desactivada exitosamente',
                'data' => [
                    'id_reserva' => $reserva->id_reserva,
                    'id_estado' => $reserva->id_estado,
                    'estado' => $reserva->estado->nombre ?? null,
                ]
            ]);

            $response->getBody()->write($payload);
            return $response->withHeader('Content-Type', self::CONTENT_TYPE_JSON);

        } catch (ModelNotFoundException $e) {
            return $this->notFound($response, self::MSG_NOT_FOUND);
        } catch (\Throwable $e) {
            return $this->errorResponse($response, 'Ocurrió un error al cambiar el estado de la reserva', $e);
        }
    }

    private function badRequest(Response $response, string $message): Response
    {
        $response->getBody()->write(json_encode(['message' => $message]));
        return $response->withStatus(400)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
    }

    private function notFound(Response $response, string $message): Response
    {
        $response->getBody()->write(json_encode(['message' => $message]));
        return $response->withStatus(404)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
    }

    private function errorResponse(Response $response, string $message, \Throwable $e): Response
    {
        $payload = json_encode([
            'message' => $message,
            'error' => $e->getMessage(),
            'line' => $e->getLine(),
        ]);
        $response->getBody()->write($payload);
        return $response->withStatus(500)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
    }
}
