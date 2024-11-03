<?php

namespace Paw\App\Models;

use Paw\Core\Database\QueryBuilder;
use Paw\Core\Database\ConnectionBuilder;

class Producto extends Model
{
    protected static $table = 'productos';

    protected $fields = [
        "nombre" => null,
        "tipo_producto_id" => null
    ];

    // Método para obtener el tipo de producto asociado a este producto
    public function tipoProducto()
    {
        return TipoProducto::getById($this->tipo_producto_id);
    }

    // Crear producto con nombre y tipo_producto_id
    public static function create($nombre, $tipo_producto_id) {
        $producto = new Producto();
        $producto->nombre = $nombre;
        $producto->tipo_producto_id = $tipo_producto_id;

        // Guardar el nuevo producto en la base de datos
        $producto->save();

        return $producto;
    }
}