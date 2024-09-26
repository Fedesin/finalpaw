<?php

namespace Paw\App\Models;

use Paw\App\Models\Roles;
use Exception;
use Paw\Core\Exceptions\ModelNotFoundException;

class User extends Model
{
    protected static $table = 'usuarios';

    protected $fields = [
        "email" => null,
        "password" => null,
        "rol_id" => null,
        "created_at" => null,
        "last_login" => null,
        "deshabilitado" => null
    ];

    protected $hidden = [
        "password"
    ];


    public function getRol()
    {
        return Roles::getById($this->rol_id);
    }

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
        // Verificar si el QueryBuilder está inicializado
        if (!$this->queryBuilder) {
            throw new Exception("QueryBuilder no inicializado en User.");
        }

        // Insertar el usuario
        $lastInsertId = $this->queryBuilder->insert(static::$table, [
            'email' => $username,
            'password' => password_hash($password, PASSWORD_BCRYPT),
            'rol_id' => $rol_id,
            'last_login' => date('Y-m-d H:i:s')
        ]);

        return $lastInsertId;
    }

    public function applyChangePassword($newPassword)
    {
        // Hash de la nueva contraseña
        $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

        // Actualizar la contraseña del usuario en la base de datos
        $this->queryBuilder->update(static::$table, [
            'password' => $hashedPassword,
        ], ['id' => $this->id]);

        // Actualizar el campo 'password' en el objeto actual
        $this->fields['password'] = $hashedPassword;

        return true; // Devolver true en caso de éxito
    }

    public function verifyPassword($password)
    {
        // Verificar si la contraseña ingresada coincide con el hash almacenado
        return password_verify($password, $this->fields['password']);
    }
}