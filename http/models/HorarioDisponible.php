<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HorarioDisponible extends Model
{
    protected $table = 'horarios_disponibles';
    protected $primaryKey = 'id_horario';
    public $timestamps = true;

    protected $fillable = [
        'id_cancha',
        'dia_semana',
        'hora_inicio',
        'hora_fin',
        'id_estado',
    ];

    protected $casts = [
        /*'hora_inicio' => 'datetime:H:i:s',
        'hora_fin' => 'datetime:H:i:s',*/
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function cancha()
    {
        return $this->belongsTo(Cancha::class, 'id_cancha');
    }

    public function estado()
    {
        return $this->belongsTo(Estado::class, 'id_estado');
    }
}
