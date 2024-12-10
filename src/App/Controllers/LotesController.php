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

        parent::showView('viewDataLote.view.twig', [
            'lote' => $lote
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

        parent::showView('viewcargar.view.twig', [
            'lote' => $lote,
            'next_fase' => $lote->fase->next_fase
        ]);
    }


    function pasarFase($request) {
        $lote = Lote::getById($request->id_lote);

        if ($lote) {
            $lote->pasarFase();

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
            $atributos = $lote->atributos ? json_decode($lote->atributos, true) : [];

            $atributosActualizados = array_map(function($ele) use($request) {
                return [
                    'nombre' => $ele['nombre'],
                    'tipo' => $ele['tipo'],
                    'valor' => $request->{str_replace(" ", "_", $ele['nombre'])}
                ];
            }, $atributos[$lote->fase->nombre]);

            $atributos[$request->fase_nombre] = $atributosActualizados;

            // Convertir los atributos actualizados a JSON y asignar al lote
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

    public function getUltimaProduccion($request) {
        // Validar si el producto_id está presente en la solicitud
        if (!isset($request->producto_id)) {
            echo json_encode([
                'success' => false,
                'message' => 'El ID del producto no fue proporcionado.'
            ]);
            return;
        }
    
        $productoId = $request->producto_id;
    
        // Buscar el último lote asociado al producto por su número, ordenado de manera descendente
        $ultimoLote = Lote::get(['producto_id' => $productoId], 'numero', 'DESC');
    
        if ($ultimoLote) {
            // Devolver el último número de producción encontrado
            echo json_encode([
                'success' => true,
                'ultimo_numero' => $ultimoLote->numero
            ]);
        } else {
            // Si no se encontró ningún lote, devolver 0 como número inicial
            echo json_encode([
                'success' => true,
                'ultimo_numero' => 0
            ]);
        }
    }
}
