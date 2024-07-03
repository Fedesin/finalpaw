<?php

namespace Paw\App\Models;

use Exception;
use Paw\Core\Exceptions\ModelNotFoundException;

class User extends Model
{
    protected static $table = 'usuarios';

    protected $fields = [
        "email" => null,
        "password" => null,
        "rol" => null,
        "created_at" => null,
        "last_login" => null,
    ];

    protected $hidden = [
        "password"
    ];

    public static function valid($user, $password)
    {
        $where = [
            "email" => $user
        ];
  
        try {
            $model = static::get($where);

            if(!password_verify($password, $model->fields['password']))
                throw new Exception();
        } catch(Exception $e) {
            throw new ModelNotFoundException();
        }
        
        return $model;
    }


    public function register($username, $password, $rol_id)
    {
        // Verificar si el QueryBuilder está inicializado en el modelo base (Model.php)
        if (!$this->queryBuilder) {
            throw new Exception("QueryBuilder no inicializado en User.");
        }

        // Obtener el QueryBuilder configurado en el modelo base (Model.php)
        $qb = $this->queryBuilder;

        // Construir la inserción con los datos proporcionados
        $lastInsertId = $qb->insert(static::$table)
            ->values([
                'email' => $username,
                'password' => password_hash($password, PASSWORD_BCRYPT),
                'rol_id' => $rol_id,
                'last_login' => 'NOW()' // Considera si es necesario, de lo contrario, manéjalo de otra manera
            ])
            ->execute();

        return $lastInsertId;
    }
   
}