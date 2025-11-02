<?php

namespace App\Controllers;

use App\Models\Usuario;
use App\Models\Otp;
use App\Models\Estado;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

class AuthController
{
    private const CONTENT_TYPE_JSON = 'application/json';
    private const OTP_LENGTH = 6;
    private const OTP_TTL_MIN = 15; // minutos
    private const OTP_MAX_PER_WINDOW = 3;
    private const OTP_WINDOW_MIN = 30; // minutos

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
                // Rate limit: contar OTPs generados en la ventana reciente
                $windowStart = (new \DateTime())->modify('-' . self::OTP_WINDOW_MIN . ' minutes')->format('Y-m-d H:i:s');
                $recent = Otp::where('id_usuario', $usuario->id_usuario)
                    ->where('created_at', '>=', $windowStart)
                    ->count();

                if ($recent >= self::OTP_MAX_PER_WINDOW) {
                    $response->getBody()->write(json_encode(['message' => 'Demasiadas solicitudes. Intenta de nuevo más tarde.']));
                    return $response->withStatus(429)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
                }

                $otpCode = $this->generateOtp();
                $vencimiento = (new \DateTime())->modify('+' . self::OTP_TTL_MIN . ' minutes')->format('Y-m-d H:i:s');

                Otp::create([
                    'id_usuario' => $usuario->id_usuario,
                    'otp' => $otpCode,
                    'vencimiento' => $vencimiento,
                    'id_estado' => Estado::PENDIENTE,
                ]);

                // Envío de correo
                $subject = 'Recuperación de contraseña - Código OTP';
                $message = "Tu código OTP para recuperar la contraseña es: {$otpCode}\n\nVálido por " . self::OTP_TTL_MIN . " minutos.";

                try {
                    $mail = new PHPMailer(true);
                    // Server settings
                    $mail->isSMTP();
                    $mail->Host = $_ENV['SMTP_HOST'] ?? '';
                    $mail->SMTPAuth = ($_ENV['SMTP_AUTH'] ?? 'true') === 'true';
                    $mail->Username = $_ENV['SMTP_USER'] ?? '';
                    $mail->Password = $_ENV['SMTP_PASS'] ?? '';
                    $mail->SMTPSecure = $_ENV['SMTP_SECURE'] ?? PHPMailer::ENCRYPTION_STARTTLS;
                    $mail->Port = (int) ($_ENV['SMTP_PORT'] ?? 587);

                    // From
                    $from = $_ENV['MAIL_FROM'] ?? 'no-reply@example.com';
                    $fromName = $_ENV['MAIL_FROM_NAME'] ?? 'Canchas SV';
                    $mail->setFrom($from, $fromName);
                    $mail->addAddress($email);

                    // Content
                    $mail->isHTML(false);
                    $mail->Subject = $subject;
                    $mail->Body    = $message;

                    $mail->send();
                } catch (\Throwable $e) {
                    // Fallback a mail() si PHPMailer falla
                    @mail($email, $subject, $message);
                }
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

            // Validación mínima de contraseña
            if (strlen($password) < 8 || !preg_match('/[0-9]/', $password) || !preg_match('/[A-Za-z]/', $password)) {
                $response->getBody()->write(json_encode(['message' => 'La contraseña debe tener al menos 8 caracteres e incluir letras y números']));
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
