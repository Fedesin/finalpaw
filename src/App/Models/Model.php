<?php

namespace Paw\App\Models;

use Paw\Core\Database\ConnectionBuilder;
use Paw\Core\Database\QueryBuilder;
//use Paw\Core\Traits\Loggable;
use Exception;

class Model
{
//    use Loggable;

    protected $fields = [];
    protected $hidden = [];

    protected static $table = '';

    protected $queryBuilder;

    public function __construct()
    {
        // Obtener la conexión desde ConnectionBuilder y pasarla a QueryBuilder
        $connection = ConnectionBuilder::getInstance();
        if ($connection === null) {
            throw new Exception("No se pudo obtener la conexión a la base de datos.");
        }
        $this->queryBuilder = new QueryBuilder($connection);
        $this->fields['id'] = null;
    }

    public function setQueryBuilder(QueryBuilder $qb)
    {
        $this->queryBuilder = $qb;
    }

    public function __isset($key)
    {
        if (isset($this->fields[$key]))
            return true;

        return false;
    }

    public function __get($name)
    {
        if(array_key_exists($name, $this->fields) &&
            !in_array($name, $this->hidden) )
            return $this->fields[$name];
    }

    public function __set($name, $value)
    {
        $method = "set" . ucfirst($name);
        if(method_exists($this, $method)) {
            $this->$method($value);
        } else if (array_key_exists($name, $this->fields)) {
            $this->fields[$name] = $value;
        }
    }

    public function set(array $values)
    {
        foreach (array_keys($this->fields) as $field) {
            if (!isset($values[$field]))
                continue;
            
            $this->$field = $values[$field];
        }
    }

    public function load($where)
    {
        $record = current($this->queryBuilder->select(static::$table, $where));
        if($record == false)
            throw new Exception("Model not found");

        $this->set($record);
    }

    public static function getAll()
    {
        $qb = new QueryBuilder(ConnectionBuilder::getInstance());

        $instances = $qb->select(static::$table);
        $collection = [];

        foreach ($instances as $instance) {
            $class = get_called_class();
            $newInstance = new $class;
            $newInstance->set($instance);
            $collection[] = $newInstance;
        }
        
        return $collection;
    }

    public static function get($where) {
        $qb = new QueryBuilder(ConnectionBuilder::getInstance());

        $class = get_called_class();
        $newInstance = new $class;
        $newInstance->setQueryBuilder($qb);
        $newInstance->load($where);

        return $newInstance;
    }

    public static function getById($id) {

        $where = [
            "id" => $id
        ];

        return static::get($where);
    }

    public function save()
    {
        // Verificar si el QueryBuilder está inicializado
        if (!$this->queryBuilder) {
            throw new Exception("QueryBuilder no inicializado.");
        }

        $attrs = [];
        foreach (array_keys($this->fields) as $field) {
            $attrs[$field] = $this->fields[$field];
        }

        $this->queryBuilder->update(static::$table, $attrs, ['id' => $this->id]);
    }
}
