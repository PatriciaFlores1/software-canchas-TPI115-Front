<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoDeporte extends Model
{
    protected $table = 'tipos_deporte';
    protected $primaryKey = 'id_tipo_deporte';
    public $timestamps = true;

    protected $fillable = ['nombre'];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function canchas()
    {
        return $this->hasMany(Cancha::class, 'id_tipo_deporte');
    }
}
