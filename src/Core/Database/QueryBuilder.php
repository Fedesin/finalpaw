<?php

namespace Paw\Core\Database;

use PDO;
use Monolog\Logger;

class QueryBuilder
{
    public function __construct(PDO $pdo, Logger $logger = null)
    {
        $this->pdo = $pdo;
        $this->logger = $logger;
    }

    public function select($table, $where = [])
    {
        $whereStr = "WHERE 1 = 1 ";
        $operators = ["=", "<", ">", "<=", ">=", "<>"];

        foreach ($where as $key => $value) {
            if(is_array($value)) {
                $op = $value[0];
                $val = $value[1];

                if(!in_array($op, $operators))
                    throw new Exception($op . " comparador no implementado");
            } else {
                $op = "=";
                $val = $value;
            }

            $whereStr .= "AND {$key} {$op} :{$key} " ;
        }

        $query = "select * from {$table} {$whereStr}";
        $sentencia = $this->pdo->prepare($query);

        /*
        Tiene que haber una forma mejor que repetir el código
        */
        foreach ($where as $key => $value)
            $sentencia->bindValue(":{$key}", is_array($value) ? $value[1] : $value);
        
        $sentencia->setFetchMode(PDO::FETCH_ASSOC);
        $sentencia->execute(); 
        
        return $sentencia->fetchAll();
    }

    public function insert()
    {
        
    }

    public function update()
    {
        
    }

    public function delete()
    {
        
    }
}