<?php

namespace Paw\App\Controllers;

use Paw\App\Models\Model;
use Paw\Core\Database\QueryBuilder;
use Paw\App\Models;

class BaseController
{
    private string $viewsDir;

    protected ?string $modelName = null;

    public function __construct()
    {
        global $connection, $log;
        //$this->viewsDir = __DIR__ . "/../Views/";
        if(!is_null($this->modelName)){
            $qb = new QueryBuilder($connection, $log);
            $model = new $this->modelName;
            $model->setQueryBuilder($qb);

            $this->setModel($model);
        }
    }

    public function setModel(Model $model)
    {
        $this->model = $model;
    }

    protected function showView(String $view, array $data = null)
    {
        global $twig;
        if (isset($data)) {
            //extract($data);
            foreach ($data as $key => $value) {
                $twig->addGlobal($key, $value);
            }
        }
        
        $template = $twig->load($view);
        echo $template->render();
    }

    protected function json($data)
    {
        echo json_encode($data);
    }
}