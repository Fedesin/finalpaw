<?php

namespace Paw\App\Controllers;

use Paw\App\Models\Lote;
use Paw\App\Models\Producto;
use Paw\App\Models\Fases;
use Paw\App\Models\User; // Asegúrate de incluir el modelo User
use Paw\App\Controllers\PageController;

class LotesController extends BaseController
{
    
    public function __construct()
    {
        parent::__construct();
    }
    public function createLote($request)
    {
        $producto = Producto::getById($request->producto_id);
        $fase = Fases::get(['tipo_producto_id' => $producto->tipo_producto_id], 'numero_orden', 'ASC');


        $data = [
            'numero' => $request->numero,
            'supervisor_id' => $request->supervisor_id,
            'encargado_produccion_id' => $request->encargado_produccion_id,
            'encargado_limpieza_id' => $request->encargado_limpieza_id,
            'producto_id' => $request->producto_id,
            'fase_actual'=> $fase->id
        ];

        // Llamamos al método create del modelo Lote
        $lote = Lote::create($data);
        
    }
}
