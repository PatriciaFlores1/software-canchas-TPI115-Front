<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Estado extends Model
{
    protected $table = 'estados';
    protected $primaryKey = 'id_estado';
    public $timestamps = true;

    // Constantes para IDs de estados
    public const ACTIVO = 1;
    public const INACTIVO = 2;
    public const PENDIENTE = 3;

    protected $fillable = ['nombre', 'color'];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function usuarios()
    {
        return $this->hasMany(Usuario::class, 'id_estado');
    }

    public function canchas()
    {
        return $this->hasMany(Cancha::class, 'id_estado');
    }

    public function horarios()
    {
        return $this->hasMany(HorarioDisponible::class, 'id_estado');
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'id_estado');
    }

    public function otps()
    {
        return $this->hasMany(Otp::class, 'id_estado');
    }

    public function sesiones()
    {
        return $this->hasMany(Sesion::class, 'id_estado');
    }
}
