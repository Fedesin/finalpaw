<?php

namespace Paw\Core\Database;

use PDO;
use Monolog\Logger;

class QueryBuilder
{
    private $pdo;
    private $logger;

    public function __construct(PDO $pdo, Logger $logger = null)
    {
        $this->pdo = $pdo;
        $this->logger = $logger;
    }

    public function select($table, $where = [], $order_by = 'id', $direction = 'ASC')
    {
        $whereStr = "WHERE 1 = 1 ";
        $operators = ["=", "<", ">", "<=", ">=", "<>","LIKE"];

        foreach ($where as $key => $value) {
            if(is_array($value)) {
                $op = $value[0];
                $val = $value[1];

                if(!in_array($op, $operators))
                    throw new \Exception($op . " comparador no implementado");
            } else {
                $op = "=";
                $val = $value;
            }

            $whereStr .= "AND {$key} {$op} :{$key} " ;
        }

        // Incorporar order_by y direction (por defecto ASC)
        $query = "SELECT * FROM {$table} {$whereStr} ORDER BY {$order_by} {$direction}";
        $sentencia = $this->pdo->prepare($query);

        foreach ($where as $key => $value) {
            $sentencia->bindValue(":{$key}", is_array($value) ? $value[1] : $value);
        }
        
        $sentencia->setFetchMode(PDO::FETCH_ASSOC);
        $sentencia->execute(); 
        
        return $sentencia->fetchAll();
    }

    public function insert($table, $values)
    {
        $columns = implode(', ', array_keys($values));
        $placeholders = ':' . implode(', :', array_keys($values));

        $query = "INSERT INTO {$table} ({$columns}) VALUES ({$placeholders})";
        $statement = $this->pdo->prepare($query);

        foreach ($values as $key => $value) {
            $statement->bindValue(":{$key}", $value);
        }

        $statement->execute();

        return $this->pdo->lastInsertId();
    }

    public function update($table, $values, $where = [])
    {
        $setClause = [];
        foreach ($values as $key => $value) {
            $setClause[] = "{$key} = :{$key}";
        }

        $whereStr = "";
        foreach ($where as $key => $value) {
            $whereStr .= "AND {$key} = :where_{$key} ";
        }
        $whereStr = trim($whereStr, "AND ");

        $query = "UPDATE {$table} SET " . implode(', ', $setClause) . " WHERE {$whereStr}";
        $statement = $this->pdo->prepare($query);

        foreach ($values as $key => $value) {
            $statement->bindValue(":{$key}", $value);
        }

        foreach ($where as $key => $value) {
            $statement->bindValue(":where_{$key}", $value);
        }

        $statement->execute();

        return $statement->rowCount();
    }

    public function delete($table, $where = [])
    {
        $whereStr = "";
        foreach ($where as $key => $value) {
            $whereStr .= "AND {$key} = :{$key} ";
        }
        $whereStr = trim($whereStr, "AND ");

        $query = "DELETE FROM {$table} WHERE {$whereStr}";
        $statement = $this->pdo->prepare($query);

        foreach ($where as $key => $value) {
            $statement->bindValue(":{$key}", $value);
        }

        $statement->execute();

        return $statement->rowCount();
    }

    // Método orderBy para seleccionar registros con ordenamiento
    public function orderBy($table, $column, $direction = 'ASC')
    {
        $query = "SELECT * FROM {$table} ORDER BY {$column} {$direction}";
        $statement = $this->pdo->prepare($query);
        $statement->execute();
        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }
}
