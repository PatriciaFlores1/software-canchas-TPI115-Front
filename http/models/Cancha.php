<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cancha extends Model
{
    protected $table = 'canchas';
    protected $primaryKey = 'id_cancha';
    public $timestamps = true;

    protected $fillable = [
        'precio_hora',
        'ubicacion',
        'coordenada',
        'condiciones_uso',
        'id_estado',
        'nombre',
        'descripcion',
        'id_tipo_deporte',
    ];

    protected $casts = [
        'precio_hora' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function estado()
    {
        return $this->belongsTo(Estado::class, 'id_estado');
    }

    public function tipoDeporte()
    {
        return $this->belongsTo(TipoDeporte::class, 'id_tipo_deporte');
    }

    public function fotos()
    {
        return $this->hasMany(FotoCancha::class, 'id_cancha');
    }

    public function horarios()
    {
        return $this->hasMany(HorarioDisponible::class, 'id_cancha');
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'id_cancha');
    }

    public function propietarios()
    {
        return $this->belongsToMany(Usuario::class, 'propietarios', 'id_cancha', 'id_usuario');
    }
}
