<?php

namespace App\Controllers;

use App\Models\Usuario;
use App\Models\Otp;
use App\Models\Estado;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

class AuthController
{
    private const CONTENT_TYPE_JSON = 'application/json';
    private const OTP_LENGTH = 6;
    private const OTP_TTL_MIN = 15; // minutos

    public function forgot(Request $request, Response $response): Response
    {
        try {
            $body = (array) ($request->getParsedBody() ?? []);
            $email = trim(strtolower($body['email'] ?? ''));

            if (empty($email)) {
                $response->getBody()->write(json_encode(['message' => 'Email es requerido']));
                return $response->withStatus(400)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
            }

            // Buscar usuario (si existe)
            $usuario = Usuario::whereRaw('LOWER(email) = ?', [$email])->first();

            // Generar OTP y persistir solo si hay usuario
            if ($usuario) {
                $otpCode = $this->generateOtp();
                $vencimiento = (new \DateTime())->modify('+' . self::OTP_TTL_MIN . ' minutes')->format('Y-m-d H:i:s');

                Otp::create([
                    'id_usuario' => $usuario->id_usuario,
                    'otp' => $otpCode,
                    'vencimiento' => $vencimiento,
                    'id_estado' => Estado::PENDIENTE,
                ]);

                // Envío de correo (simple). Puedes reemplazar con PHPMailer si deseas.
                $subject = 'Recuperación de contraseña - Código OTP';
                $message = "Tu código OTP para recuperar la contraseña es: {$otpCode}\n\nVálido por " . self::OTP_TTL_MIN . " minutos.";
                // @mail — no bloquear si falla
                @mail($email, $subject, $message);
            }

            // Respuesta genérica (no confirmar existencia del email)
            $response->getBody()->write(json_encode(['message' => 'Si existe una cuenta con ese email, recibirás instrucciones para recuperar tu contraseña.']));
            return $response->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        } catch (\Throwable $e) {
            $response->getBody()->write(json_encode(['message' => 'Error al procesar la solicitud', 'error' => $e->getMessage()]));
            return $response->withStatus(500)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        }
    }

    public function verifyOtp(Request $request, Response $response): Response
    {
        try {
            $body = (array) ($request->getParsedBody() ?? []);
            $email = trim(strtolower($body['email'] ?? ''));
            $otp = trim($body['otp'] ?? '');

            if (empty($email) || empty($otp)) {
                $response->getBody()->write(json_encode(['message' => 'Email y OTP son requeridos']));
                return $response->withStatus(400)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
            }

            $usuario = Usuario::whereRaw('LOWER(email) = ?', [$email])->first();
            if (!$usuario) {
                $response->getBody()->write(json_encode(['message' => 'OTP inválido o vencido']));
                return $response->withStatus(400)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
            }

            $registro = Otp::where('id_usuario', $usuario->id_usuario)
                ->where('otp', $otp)
                ->where('id_estado', Estado::PENDIENTE)
                ->where('vencimiento', '>=', date('Y-m-d H:i:s'))
                ->first();

            if (!$registro) {
                $response->getBody()->write(json_encode(['message' => 'OTP inválido o vencido']));
                return $response->withStatus(400)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
            }

            // Marcar OTP como usado
            $registro->update(['id_estado' => Estado::INACTIVO]);

            $response->getBody()->write(json_encode(['message' => 'OTP verificado']));
            return $response->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        } catch (\Throwable $e) {
            $response->getBody()->write(json_encode(['message' => 'Error al verificar OTP', 'error' => $e->getMessage()]));
            return $response->withStatus(500)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        }
    }

    public function reset(Request $request, Response $response): Response
    {
        try {
            $body = (array) ($request->getParsedBody() ?? []);
            $email = trim(strtolower($body['email'] ?? ''));
            $otp = trim($body['otp'] ?? '');
            $password = $body['password'] ?? '';

            if (empty($email) || empty($otp) || empty($password)) {
                $response->getBody()->write(json_encode(['message' => 'Email, OTP y nueva contraseña son requeridos']));
                return $response->withStatus(400)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
            }

            $usuario = Usuario::whereRaw('LOWER(email) = ?', [$email])->first();
            if (!$usuario) {
                $response->getBody()->write(json_encode(['message' => 'OTP inválido o vencido']));
                return $response->withStatus(400)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
            }

            $registro = Otp::where('id_usuario', $usuario->id_usuario)
                ->where('otp', $otp)
                ->where('id_estado', Estado::PENDIENTE)
                ->where('vencimiento', '>=', date('Y-m-d H:i:s'))
                ->first();

            if (!$registro) {
                $response->getBody()->write(json_encode(['message' => 'OTP inválido o vencido']));
                return $response->withStatus(400)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
            }

            // Actualizar contraseña
            $usuario->password = password_hash($password, PASSWORD_DEFAULT);
            $usuario->save();

            // Invalidar OTPs pendientes para ese usuario
            Otp::where('id_usuario', $usuario->id_usuario)->where('id_estado', Estado::PENDIENTE)->update(['id_estado' => Estado::INACTIVO]);

            $response->getBody()->write(json_encode(['message' => 'Contraseña cambiada correctamente']));
            return $response->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        } catch (\Throwable $e) {
            $response->getBody()->write(json_encode(['message' => 'Error al resetear contraseña', 'error' => $e->getMessage()]));
            return $response->withStatus(500)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        }
    }

    private function generateOtp(): string
    {
        $min = (int) pow(10, self::OTP_LENGTH - 1);
        $max = (int) pow(10, self::OTP_LENGTH) - 1;
        return (string) random_int($min, $max);
    }
}
