<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Usuario extends Model
{
    protected $table = 'usuarios';
    protected $primaryKey = 'id_usuario';
    public $timestamps = true;

    protected $fillable = [
        'nombre',
        'apellido',
        'email',
        'password',
        'telefono',
        'id_rol',
        'id_estado',
        'url_foto',
    ];

    protected $hidden = ['password'];

    protected $casts = [
        'fecha_registro' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relaciones
    public function rol()
    {
        return $this->belongsTo(Rol::class, 'id_rol');
    }

    public function estado()
    {
        return $this->belongsTo(Estado::class, 'id_estado');
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'id_usuario');
    }

    public function sesiones()
    {
        return $this->hasMany(Sesion::class, 'id_usuario');
    }

    public function otps()
    {
        return $this->hasMany(Otp::class, 'id_usuario');
    }

    public function propietarioRelaciones()
    {
        return $this->hasMany(Propietario::class, 'id_usuario');
    }

    public function canchas()
    {
        return $this->belongsToMany(Cancha::class, 'propietarios', 'id_usuario', 'id_cancha');
    }
}
