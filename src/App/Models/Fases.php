<?php

namespace Paw\App\Models;

use Exception;
use Paw\Core\Exceptions\ModelNotFoundException;

class Fases extends Model
{
    protected static $table = 'fases';

    protected $fields = [
        "nombre" => null,
        "tipo_producto_id" => null,
        "atributos" => null
    ];

    public function getTipoProducto() {
        return TipoProducto::getById($this->tipo_producto_id);
    }

    public static function create($nombre, $tipo_producto_id) {
        $fase = new Fases();

        $fase->nombre = $nombre;
        $fase->tipo_producto_id = $tipo_producto_id;
        $fase->save();

        return $fase;
    }

    // Implementar el método delete
    public function delete() {
        $this->queryBuilder->delete(static::$table, ['id' => $this->id]);
    }
}
