<?php

namespace Paw\App\Controllers;

use Paw\App\Models\Lote;
use Paw\App\Models\Producto;
use Paw\App\Models\Fases;
use Paw\App\Models\User;
use Paw\Core\Session;

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
            'fase_actual'=> $fase->id,
            'tipo_producto_id' => $producto->tipo_producto_id
        ];

        $attrs = [];

        try {
            $lote = Lote::create($data);

            $attrs = [
                'error' => false,
                'message' => 'El lote ha sido creado correctamente'
            ];            
        } catch(\Exception $e) {
            $error = 'Usuario o contraseña incorrecto';

            $attrs = [
                "error" => true,
                "fields" => $data
            ];
        }

        $session = Session::getInstance();

        $session->admLotesData = $attrs;

        $this->redirect('/admlotes');
    }

    public function getAll()
    {
        $lotes = Lote::getAll();
        $response = [];

        foreach ($lotes as $lote) {
            $producto = Producto::getById($lote->producto_id);
            $response[] = [
                'id' => $lote->id,
                'numero' => $lote->numero,
                'producto' => [
                    'nombre' => $producto->nombre
                ]
            ];
        }

        echo json_encode(['lotes' => $response]);
    }

    function viewCargar($request) {
        $lote = Lote::getById($request->id);

        $fase = Fases::get([
            'tipo_producto_id' => $lote->producto->tipo_producto_id,
            'id' => $lote->fase_actual
        ]);

        parent::showView('viewcargar.view.twig', [
            'lote' => $lote,
            'fase' => $fase,
            'atributos' => json_decode($fase->atributos, true)
        ]);
    }

    public function updateAttributes($request) {
        // Obtener el lote por su ID
        $lote = Lote::getById($request->id_lote);
    
        if ($lote) {
            // Decodificar los atributos actuales del lote (en formato JSON)
            $atributos = json_decode($lote->atributos, true);
    
            // Recorremos cada atributo enviado en el formulario
            foreach ($request->atributos as $key => $atributo) {
                // Verificar si el atributo ya existe en los atributos del lote
                if (isset($atributos[$key])) {
                    // Si existe, actualizamos el valor según el tipo
                    $atributos[$key]['valor'] = $atributo['valor'];
                } else {
                    // Si no existe, añadimos un nuevo atributo con la información proporcionada
                    $atributos[$key] = [
                        'num_orden' => $atributo['num_orden'],
                        'tipo' => $atributo['tipo'],
                        'valor' => $atributo['valor']
                    ];
                }
            }
    
            // Convertir los atributos actualizados a JSON y guardar en el lote
            $lote->atributos = json_encode($atributos);
    
            // Guardar los cambios en la base de datos
            $lote->save();
    
            // Responder con un mensaje de éxito
            echo json_encode(['success' => true, 'message' => 'Atributos actualizados correctamente']);
        } else {
            // Responder con un mensaje de error si el lote no se encontró
            echo json_encode(['success' => false, 'message' => 'Lote no encontrado']);
        }
    }
    

}
