<?php

namespace Paw\App\Controllers;

use Paw\App\Models\Fases;
use Paw\App\Models\TipoProducto;

class FasesController extends BaseController
{
    public function __construct()
    {
        parent::__construct();
    }

    public function index($request)
    {
        $tipo_productos = TipoProducto::getAll();

        parent::showView('admfases.view.twig', [
            'tipo_productos' => $tipo_productos
        ]);
    }


    public function getFases($request) {
        $params = [];

        if (isset($request->tipo_producto_id))
            $params["tipo_producto_id"] = $request->tipo_producto_id;

        $fases = Fases::getAll($params);

        $ret = [];
        foreach($fases as $fase) {
            $ret[$fase->id] = [
                "id" => $fase->id,
                "nombre" => $fase->nombre,
                "tipo_producto_id" => $fase->tipo_producto_id,
                "atributos" => $fase->atributos
            ];
        }
        
        echo json_encode(['status' => 'success', 'data' => $ret]);
    }

    public function createFase($request) {
        // Creamos la nueva fase (el número de orden se maneja en el modelo)
        $fase = Fases::create($request->fase_nombre, $request->tipo_producto_id);
    
        if ($fase) {
            $ret = [
                "id" => $fase->id,
                "nombre" => $fase->nombre,
                "tipo_producto_id" => $fase->tipo_producto_id,
                "atributos" => $fase->atributos,
                "numero_orden" => $fase->numero_orden // Añadimos el número de orden al resultado
            ];
            echo json_encode(['status' => 'success', 'data' => $ret]);
        } else {
            echo json_encode(['status' => 'error']);
        }
    }

    public function deleteFase($request) {
        $faseId = $request->fase_id; // Obtener el ID de la fase
        $fase = Fases::getById($faseId); // Buscar la fase en la base de datos
    
        if ($fase) {
            $fase->delete(); // Llamar al método delete en el modelo
            echo json_encode(['success' => true, 'message' => 'Fase eliminada correctamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Fase no encontrada']);
        }
    }

    public function updateFase($request) {
        $fase = Fases::getById($request->fase_id);
    
        if ($fase) {
            // Actualizamos el número de orden de la fase
            if (isset($request->numero_orden)) {
                $fase->numero_orden = $request->numero_orden;
            }
    
            // Agregar nuevo campo a los atributos
            if (isset($request->nuevo_campo) && is_array($request->nuevo_campo)) {
                $nombreCampo = $request->nuevo_campo['nombre'];
                $numOrden = $request->nuevo_campo['num_orden'];
                $tipoCampo = $request->nuevo_campo['tipo'];
    
                // Decodificar los atributos JSON existentes
                $atributos = json_decode($fase->atributos, true);
    
                // Añadir el nuevo campo con la estructura solicitada
                $atributos[$nombreCampo] = [
                    'num_orden' => $numOrden,
                    'tipo' => $tipoCampo,
                    'valor' => '' // Puedes añadir un valor por defecto aquí si es necesario
                ];
    
                // Volver a codificar los atributos como JSON
                $fase->atributos = json_encode($atributos);
            }
    
            // Guardar la fase actualizada
            $fase->save();
    
            echo json_encode(['success' => true, 'message' => 'Fase actualizada correctamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Fase no encontrada']);
        }
    }
    
    
    public function deleteCampo($request) {
        $faseId = $request->fase_id;
        $campo = $request->campo;
    
        // Obtener la fase por su ID
        $fase = Fases::getById($faseId);
        if (!$fase) {
            echo json_encode(['success' => false, 'message' => 'Fase no encontrada']);
            return;
        }
    
        // Eliminar el campo del JSON
        $atributos = json_decode($fase->atributos, true) ?? [];
        if (isset($atributos[$campo])) {
            unset($atributos[$campo]);
            $fase->atributos = json_encode($atributos); // Guardar el nuevo JSON sin el campo
            $fase->save();
            echo json_encode(['success' => true, 'message' => 'Campo eliminado correctamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Campo no encontrado']);
        }
    }

    public function getAttributes($request) {
        $faseId = $request->fase_id;
    
        // Obtener la fase por su ID
        $fase = Fases::getById($faseId);
        if ($fase) {
            echo json_encode(['success' => true, 'atributos' => json_decode($fase->atributos, true), 'numero_orden' => $fase->numero_orden]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Fase no encontrada']);
        }
    }
}