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
        if ($record == false) {
            return null;
        }

        $this->set($record);
        return $this;
    }

    public static function getAll($where = [])
    {
        $qb = new QueryBuilder(ConnectionBuilder::getInstance());

        $instances = $qb->select(static::$table, $where);
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
    
        if ($newInstance->load($where) === null) {
            return null;
        }
    
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

        if($this->fields['id'] == null) {
            foreach (array_keys($this->fields) as $field) {
                // Itero 2 veces porque en algún caso realmente puedo querer actualizar un valor a null, pero en la primera iteración no sé si va a ser un update o un insert
                if($this->fields[$field] == null)
                    unset($attrs[$field]);
            }
            
            return $this->queryBuilder->insert(static::$table, $attrs);
        } else {
            if ($this->queryBuilder->update(static::$table, $attrs, ['id' => $this->id])) {
                return $this->id;
            } else {
                return false;
            }
        }
    }
    
    public function delete() {
        $this->queryBuilder->delete(static::$table, ['id' => $this->id]);
    }
}
