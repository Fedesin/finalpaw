<?php

namespace Paw\App\Controllers;

use Paw\App\Models\Lote;
use Paw\App\Models\Producto;
use Paw\App\Models\User; // Asegúrate de incluir el modelo User

class LotesController extends BaseController
{
    // Método para crear un lote
    public function createLote($request)
    {
        $data = [
            'numero' => $request->numero,
            'supervisor_id' => $request->supervisor_id,
            'encargado_produccion_id' => $request->encargado_produccion_id,
            'encargado_limpieza_id' => $request->encargado_limpieza_id,
            'producto_id' => $request->producto_id
        ];

        // Llamamos al método create del modelo Lote
        $lote = Lote::create($data);

        return json_encode([
            'success' => true,
            'message' => 'Lote creado con éxito',
            'data' => $lote
        ]);
    }
}
