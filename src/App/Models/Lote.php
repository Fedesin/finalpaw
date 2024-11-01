<?php

namespace Paw\App\Models;

use Paw\Core\Database\QueryBuilder;
use Paw\Core\Database\ConnectionBuilder;

class Lote extends Model
{
    protected static $table = 'lotes';

    protected $fields = [
        "numero" => null,
        "fecha" => null,
        "fase_actual" => null,
        "supervisor_id" => null,
        "encargado_produccion_id" => null,
        "encargado_limpieza_id" => null,
        "producto_id" => null
    ];

    // Método para crear un nuevo lote
    public static function create($data) {
        $lote = new self();
        $lote->numero = $data['numero'];
        $lote->fecha = date('Y-m-d H:i:s'); // Por ejemplo, guardamos la fecha actual
        $lote->fase_actual = $data['fase_actual'] ?? null; // Ajustar según sea necesario
        $lote->supervisor_id = $data['supervisor_id'];
        $lote->encargado_produccion_id = $data['encargado_produccion_id'];
        $lote->encargado_limpieza_id = $data['encargado_limpieza_id'];
        $lote->producto_id = $data['producto_id'];

        $lote->save();
        return $lote;
    }
}
