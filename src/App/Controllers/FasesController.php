<?php

namespace Paw\App\Controllers;

use Paw\App\Models\Fases;
use Paw\App\Models\TipoProducto;
use Paw\Core\Exceptions\ModelNotFoundException;

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

        $fases = Fases::getAll($params, 'numero_orden');

        $ret = [];
        foreach($fases as $fase) {
            $ret[] = [
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
                "atributos" => $fase->atributos
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
            // Actualizar el número de orden de la fase si está presente
            if (isset($request->numero_orden)) {
                $fase->updateOrden($request->numero_orden);
//                $fase->numero_orden = $request->numero_orden;
            }
    
            // Si estamos editando un campo existente
            if (isset($request->editar_campo)) {
                $atributos = json_decode($fase->atributos, true);
                $campoOriginal = $request->editar_campo['original'];
                
                if (isset($atributos[$campoOriginal])) {
                    // Actualizar el campo con los nuevos valores
                    unset($atributos[$campoOriginal]); // Eliminar el nombre original
                    $atributos[$request->editar_campo['nuevo_nombre']] = [
                        'num_orden' => $request->editar_campo['num_orden'],
                        'tipo' => $request->editar_campo['tipo'],
                        'valor' => "" // Mantener vacío o puedes usar el valor que se necesite
                    ];
                    $fase->atributos = json_encode($atributos);
                }
            }
    
            // Si estamos agregando un nuevo campo
            if (isset($request->nuevo_campo)) {
                $atributos = json_decode($fase->atributos, true);
                
                // Añadir el nuevo campo
                $nuevoCampoNombre = $request->nuevo_campo['nombre'];
                $atributos[$nuevoCampoNombre] = [
                    'num_orden' => $request->nuevo_campo['num_orden'],
                    'tipo' => $request->nuevo_campo['tipo'],
                    'valor' => "" // Inicializar con un valor vacío o puedes usar otro valor por defecto
                ];
                $fase->atributos = json_encode($atributos);
            }
    
            // Guardar los cambios en la fase
            $fase->save();
    
            echo json_encode(['success' => true, 'message' => 'Fase actualizada correctamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Fase no encontrada']);
        }
    }
    
    public function deleteCampo($request) {
        $faseId = $request->fase_id;
        $attrIndex = $request->attrIndex;
    
        // Obtener la fase por su ID
        $fase = Fases::getById($faseId);
        if (!$fase) {
            echo json_encode(['success' => false, 'message' => 'Fase no encontrada']);
            return;
        }

        if($fase->deleteAtributo($attrIndex)) {
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

    public function addAttribute($request)
    {
        $faseId = $request->fase_id;

        $fase = Fases::getById($faseId);
        if ($fase) {
            $fase->addAtributo([
                "nombre" => $request->nombre,
                "tipo" => $request->tipo,
                "valor" => ""
            ]);

            $campos = json_decode($fase->atributos);
            echo json_encode(['success' => true, 'atributos' => end($campos)]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Fase no encontrada']);
        }
    }

    public function updateAttribute($request) {
        $fase = Fases::getById($request->fase_id);

        if (!$fase) {
            echo json_encode(['success' => false, 'message' => 'Fase no encontrada']);
            return;
        }

        if($fase->updateAtributo(
            $request->attrIndex,
            $request->nombre,
            $request->tipo)) {

            echo json_encode(['success' => true, 'message' => 'Campo actualizado correctamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Campo no encontrado']);
        }
    }
}