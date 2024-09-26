<?php

namespace Paw\App\Models;

use Exception;
use Paw\Core\Exceptions\ModelNotFoundException;

class TipoProducto extends Model
{
    protected static $table = 'tipo_producto';

    protected $fields = [
        "nombre" => null
    ];
}