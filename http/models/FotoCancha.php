<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FotoCancha extends Model
{
    protected $table = 'fotos_cancha';
    protected $primaryKey = 'id_foto';
    public $timestamps = true;

    protected $fillable = ['id_cancha', 'url_foto'];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function cancha()
    {
        return $this->belongsTo(Cancha::class, 'id_cancha');
    }
}
