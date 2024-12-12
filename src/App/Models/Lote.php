<?php

namespace Paw\App\Models;

use Paw\Core\Database\QueryBuilder;
use Paw\Core\Database\ConnectionBuilder;
use Paw\App\Models\Producto;
use Paw\App\Models\Fases;
use Paw\App\Models\User;

class Lote extends Model
{
    protected static $table = 'lotes';

    protected $fields = [
        "numero" => null,
        "fecha" => null,
        "fase_actual" => null,
        "supervisor_id" => null,
        "encargado_produccion_id" => null,
        "encargado_limpieza_id" => null,
        "producto_id" => null,
        'atributos' => null
    ];

    public function getProducto()
    {
        return Producto::getById($this->producto_id);
    }

    public function getFase()
    {
        return Fases::getById($this->fase_actual);
    }

    public function getEncargado_Produccion()
    {
        return User::getById($this->encargado_produccion_id);
    }

    public function getEncargado_Limpieza()
    {
        return User::getById($this->encargado_limpieza_id);
    }

    public function getSupervisor()
    {
        return User::getById($this->supervisor_id);
    }

    // Método para crear un nuevo lote
    public static function create($data) {
        $lote = new self();
        $lote->numero = $data['numero'];
        $lote->fecha = date('Y-m-d H:i:s'); // Por ejemplo, guardamos la fecha actual
        $lote->fase_actual = $data['fase_actual'] ?? null; // Ajustar según sea necesario

        if($lote->fase_actual)
            $lote->atributos = json_encode([
                $lote->fase->nombre => json_decode($lote->fase->atributos, true)
            ]);

        $lote->supervisor_id = $data['supervisor_id'];
        $lote->encargado_produccion_id = $data['encargado_produccion_id'];
        $lote->encargado_limpieza_id = $data['encargado_limpieza_id'];
        $lote->producto_id = $data['producto_id'];

        $lote->save();
        return $lote;
    }

    public function pasarFase() {
        $this->fase_actual = $this->fase->next_fase->id;

        $atributos = json_decode($this->atributos, true);
        $atributos[$this->fase->nombre] = json_decode($this->fase->atributos, true);

        $this->atributos = json_encode($atributos);
        $this->save();
    }

    public static function filtrarPorUsuario($user_id) {
        $where = [
            'OR' => [
                ['supervisor_id', '=', $user_id],
                ['encargado_produccion_id', '=', $user_id],
                ['encargado_limpieza_id', '=', $user_id]
            ]
        ];

        return self::getAll($where);
    }
}
