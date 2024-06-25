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

    public function register($email, $password)
    {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $createdAt = date('Y-m-d H:i:s');

        try {
            // Verificar si el usuario ya existe
            $where = [
                "email" => $email
            ];
            $existingUser = $this->queryBuilder->select(static::$table, $where);
            
            if ($existingUser) {
                throw new Exception("El correo electrónico ya está registrado");
            }

            // Insertar el nuevo usuario
            $data = [
                'email' => $email,
                'password' => $hashedPassword,
                'created_at' => $createdAt
            ];
            $this->queryBuilder->insert(static::$table, $data);

        } catch (Exception $e) {
            throw new Exception("Error al registrar usuario: " . $e->getMessage());
        }

        return true;
    }
}