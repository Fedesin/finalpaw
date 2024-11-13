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
    public function viewLote($request)
    {
        $lote = Lote::getById($request->id);
        if (!$lote) {
            throw new \Exception("Lote no encontrado con ID " . $request->id);
        }
        $producto = Producto::getById($lote->producto_id);
        //var_dump($lote->atributos);
        //die();
        $encargado_produccion = User::getById($lote->encargado_produccion_id);
        $encargado_limpieza = User::getById($lote->encargado_limpieza_id);
        $supervisor = User::getById($lote->supervisor_id);
        $fase_actual = Fases::getById($lote->fase_actual);
        parent::showView('viewDataLote.view.twig', [
            'lote' => $lote,
            'producto' => $producto,
            'atributos'=> json_decode($lote->atributos, true),
            'encargado_produccion' => $encargado_produccion,
            'encargado_limpieza' => $encargado_limpieza,
            'supervisor' => $supervisor,
            'fase_actual'=> $fase_actual
        ]);
    }

    function viewCargar($request) {

        $lote = Lote::getById($request->id);

        if (!$lote) {
            throw new \Exception("Lote no encontrado con ID " . $request->id);
        }

        if (!$lote->producto) {
            throw new \Exception("Producto no encontrado para el lote con ID " . $request->id);
        }

        $fase = Fases::get([
            'tipo_producto_id' => $lote->producto->tipo_producto_id,
            'id' => $lote->fase_actual
        ]);

        // Obtener la siguiente fase, si existe
        $next_fase = Fases::getNextFase($fase->id); // Método que obtiene la siguiente fase
        parent::showView('viewcargar.view.twig', [
            'next_fase' => $next_fase,
            'lote' => $lote,
            'fase' => $fase,
            'atributos' => json_decode($fase->atributos, true)
        ]);
    }


    function pasarFase($request) {
        $lote = Lote::getById($request->id_lote);
        

        if ($lote) {
            $lote->fase_actual = $request->next_fase_id;
            $lote->save();
            // Establecer el tipo de contenido como JSON
            header('Content-Type: application/json');

            // Responder con un mensaje de éxito en formato JSON
            echo json_encode(['success' => true, 'message' => 'Fase actualizada correctamente']);
            } else {
            // Si no se encuentra el lote, también responder en formato JSON
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Lote no encontrado']);
        }
    }

    public function updateAttributes($request) {
        // Verificar si se ha proporcionado el id_lote
        if (!isset($request->id_lote)) {
            echo json_encode(['success' => false, 'message' => 'ID de lote no proporcionado']);
            return;
        }
    
        // Obtener el lote por su ID
        $lote = Lote::getById($request->id_lote);
    
        if ($lote) {
            // Decodificar los atributos actuales del lote (en formato JSON), o iniciar con un array vacío si está en null
            $atributos = $lote->atributos !== null ? json_decode($lote->atributos, true) : [];
    
            // Obtener los datos de la fase del request
            $fase_id = isset($request->id_fase) ? $request->id_fase : null;
            $fase_nombre = isset($request->fase_nombre) ? $request->fase_nombre : null;
    
            // Verificar si los atributos existen en el request y son un array
            if (isset($request->atributos) && is_array($request->atributos)) {
    
                // Buscar si la fase ya existe en el JSON de atributos
                $fase_existente = false;
    
                // Recorrer las fases ya existentes en los atributos
                foreach ($atributos as &$fase) {
                    if (isset($fase['id_fase']) && $fase['id_fase'] == $fase_id) {
                        // Si la fase existe, actualizamos sus atributos
                        $fase_existente = true;
                        foreach ($request->atributos as $key => $atributo) {
                            // Si el atributo ya existe, actualizamos el valor
                            if (isset($fase['atributos'][$key])) {
                                $fase['atributos'][$key]['valor'] = $atributo['valor'];
                            } else {
                                // Si no existe, agregamos el nuevo atributo
                                $fase['atributos'][$key] = [
                                    'num_orden' => $atributo['num_orden'],
                                    'tipo' => $atributo['tipo'],
                                    'valor' => $atributo['valor']
                                ];
                            }
                        }
                        break;
                    }
                }
    
                // Si la fase no existe, la agregamos como nueva fase
                if (!$fase_existente) {
                    $atributos[] = [
                        'id_fase' => $fase_id,
                        'nombre_fase' => $fase_nombre,
                        'atributos' => []
                    ];
    
                    // Agregar los atributos proporcionados
                    foreach ($request->atributos as $key => $atributo) {
                        $atributos[count($atributos) - 1]['atributos'][$key] = [
                            'num_orden' => $atributo['num_orden'],
                            'tipo' => $atributo['tipo'],
                            'valor' => $atributo['valor']
                        ];
                    }
                }
    
                // Convertir los atributos actualizados a JSON y asignar al lote
                $lote->atributos = json_encode($atributos);
    
                // Guardar los cambios en la base de datos
                $lote->save();
    
                // Responder con un mensaje de éxito
                echo json_encode(['success' => true, 'message' => 'Atributos actualizados correctamente']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Atributos no proporcionados o formato incorrecto']);
            }
        } else {
            // Responder con un mensaje de error si el lote no se encontró
            echo json_encode(['success' => false, 'message' => 'Lote no encontrado']);
        }
    }
    
    
    
    
    

}
