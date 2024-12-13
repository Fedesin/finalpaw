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

    protected $duplicadoError = '';

    public function __construct()
    {
        $this->duplicadoError = 'El usuario ya se encuentra registrado';
        parent::__construct();
    }

    public function getRol()
    {
        return Roles::getById($this->rol_id);
    }

    public function setRol($rol_id) {
        $this->rol_id = $rol_id;
        $this->save();
    }

    public function setStatus($status) {
        $this->deshabilitado = $status;
        $this->save();
    }

    public static function valid($user, $password, $touch_login)
    {
        $where = [
            "email" => $user,
            "deshabilitado" => 0
        ];
  
        try {
            $model = static::get($where);

            if(!password_verify($password, $model->fields['password']))
                throw new Exception();

            if($touch_login) {
                $model->last_login = 'NOW()';
                $model->save();
            }
        } catch(Exception $e) {
            throw new ModelNotFoundException();
        }
        
        return $model;
    }

    public static function register($username, $password, $rol_id)
    {
        $user = new self();

        $user->email = $username;
        $user->password = password_hash($password, PASSWORD_BCRYPT);
        $user->rol_id = $rol_id;
        $user->last_login = date('Y-m-d H:i:s');

        return $user->save();
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

    public function storePasswordChangeToken($token, $newPassword)
    {
        // Guarda el token y la nueva contraseña en la base de datos
        $this->password_change_token = $token;
        $this->pending_password = password_hash($newPassword, PASSWORD_DEFAULT);
        $this->save();
    }

    public static function getByPasswordChangeToken($token)
    {
        // Recupera al usuario por el token de cambio de contraseña
        $user = self::where(['password_change_token' => $token])->first();
        return $user ?: null;
    }

    public function getPendingPassword()
    {
        return $this->pending_password;
    }

    public function clearPasswordChangeToken()
    {
        $this->password_change_token = null;
        $this->pending_password = null;
        $this->save();
    }

    public static function getByEmail($email)
    {
        $where = [
            "email" => $email
        ];
    
        try {
            // Usa el método `get` de la clase base para buscar por email
            return static::get($where);
        } catch (Exception $e) {
            // Devuelve null si no se encuentra el usuario
            return null;
        }
    }

    public static function exists($email) {
        $user = self::get(['email' => $email]);
        return $user !== null;
    }

    public static function countUsersLikeEmail($email) {
        $where = [];

        if(isset($email)) {
            $where = [
                'email' => [
                    'LIKE', '%' . $email . '%'
                ]
            ];
        }

        return self::count($where);
    }

    public static function getUsersLikeEmail($email, $limit, $offset) {
        $where = [];

        if($email) {
            $where = [
                'email' => [
                    'LIKE', '%' . $email . '%'
                ]
            ];
        }

        return User::getAll($where, limit: $limit ? $limit : 'ALL', offset: $offset ? $offset : 0);
    }
}