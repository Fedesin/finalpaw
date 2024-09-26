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

        $this->email = $username;
        $this->password = password_hash($password, PASSWORD_BCRYPT);
        $this->rol_id = $rol_id;
        $this->last_login = date('Y-m-d H:i:s');

        return $this->save();
    }

    public function updatePassword($newPassword)
    {
        $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
        try {
            $this->password = $hashedPassword;
            $this->save();

            return true;
        } catch(Exception $e){
            throw new Exception($e->getMessage());
        }    
    }

    public function verifyPassword($password)
    {
        return password_verify($password, $this->fields['password']);
    }
}