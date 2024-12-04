<?php

namespace Paw\App\Models;

use Paw\Core\Database\QueryBuilder;
use Paw\Core\Database\ConnectionBuilder;

class Fases extends Model
{
    protected static $table = 'fases';

    protected $fields = [
        "id" => null,
        "nombre" => null,
        "tipo_producto_id" => null,
        "atributos" => null,
        "numero_orden" => null
    ];

    // Relación con el tipo de producto
    public function getTipoProducto() {
        return TipoProducto::getById($this->tipo_producto_id);
    }

    // Crear fase con nombre, tipo_producto_id y numero_orden
    public static function create($nombre, $tipo_producto_id, $numero_orden = null) {
        $fase = new Fases();
        
        // Inicializamos los atributos como un JSON vacío
        $fase->atributos = "[]";

        if (is_null($numero_orden)) {
            // Obtener el número de orden más alto para el tipo de producto
            $qb = new QueryBuilder(ConnectionBuilder::getInstance());
            $maxOrder = $qb->select('fases', ['tipo_producto_id' => $tipo_producto_id], 'numero_orden', 'DESC', 1);
            
            // Si hay fases, se asigna el siguiente número de orden, de lo contrario 1
            $fase->numero_orden = isset($maxOrder[0]) ? $maxOrder[0]['numero_orden'] + 1 : 1;
        } else {
            $fase->numero_orden = $numero_orden; // Usar el número de orden pasado como parámetro si existe
        }

        $fase->nombre = $nombre;
        $fase->tipo_producto_id = $tipo_producto_id;

        $fase->save();

        return $fase;
    }

    public static function getNextFase($currentFaseId) {
        // Obtener el orden de la fase actual
        $fase = self::getById($currentFaseId); // Asumimos que este método obtiene la fase por su ID
        if (!$fase) {
            return null; // Si no se encuentra la fase, retornar null
        }

        // Ahora, buscamos la siguiente fase según el orden
        $nextFase = self::get([
            'numero_orden' => ['>', $fase->numero_orden]  // Condición: numero_orden mayor que el de la fase actual
        ], 'numero_orden', 'ASC', 1); // Ordenamos por numero_orden en orden ascendente y limitamos a 1 resultado
        
        if (!$nextFase) {
            return null; // Si no se encuentra la fase, retornar null
        }

        return $nextFase;
    }

    public function updateOrden($nuevo_orden) {
        if($this->numero_orden > $nuevo_orden) {
            $this->queryBuilder->increment(static::$table, 'numero_orden', [
                ['numero_orden', '>=', $nuevo_orden],
                ['numero_orden', '<', $this->numero_orden]
            ]);
        } else if ($this->numero_orden < $nuevo_orden) {
            $this->queryBuilder->decrement(static::$table, 'numero_orden', [
                ['numero_orden', '<=', $nuevo_orden],
                ['numero_orden', '>', $this->numero_orden]
            ]);
        }

        $this->numero_orden = $nuevo_orden;
        $this->save();
    }

    public function addAtributo($atributo) {
        $atributos = json_decode($this->atributos);

        $atributos[] = $atributo;

        $this->atributos = json_encode($atributos);
        $this->save();
    }
}