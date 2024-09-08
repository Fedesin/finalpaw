<?php

namespace Paw\App\Models;

use Exception;
use Paw\Core\Exceptions\ModelNotFoundException;

class Roles extends Model
{
    protected static $table = 'roles';

    protected $fields = [
        "nombre" => null
    ];
}