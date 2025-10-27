<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Propietario extends Model
{
    protected $table = 'propietarios';
    protected $primaryKey = 'id_propietario';
    public $timestamps = true;

    protected $fillable = ['id_usuario', 'id_cancha'];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

    public function cancha()
    {
        return $this->belongsTo(Cancha::class, 'id_cancha');
    }
}
