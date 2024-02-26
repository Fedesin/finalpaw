<?php

namespace Paw\App\Models;

use Exception;
use Paw\Core\Exceptions\ModelNotFoundException;

class User extends Model
{
    protected static $table = 'usuario';

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
}