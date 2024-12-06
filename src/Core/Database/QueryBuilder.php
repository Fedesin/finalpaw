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

    public function count($table, $where = [])
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

        $query = "SELECT * FROM {$table} {$whereStr}";
        $sentencia = $this->pdo->prepare($query);

        foreach ($where as $key => $value) {
            $sentencia->bindValue(":{$key}", is_array($value) ? $value[1] : $value);
        }
        
        $sentencia->setFetchMode(PDO::FETCH_ASSOC);
        $sentencia->execute(); 
        
        return $sentencia->rowCount();
    }

    public function select($table, $where = [], $order_by = 'id', $direction = 'ASC', $limit = 'ALL', $offset = 0)
    {
        $whereStr = "WHERE 1 = 1 ";
        $params = [];
        $operators = ["=", "<", ">", "<=", ">=", "<>", "LIKE"];
    
        foreach ($where as $key => $value) {
            if ($key === 'OR') {
                // Manejo de condiciones OR
                $orConditions = [];
                foreach ($value as $condition) {
                    if (is_array($condition) && count($condition) === 3) {
                        $column = $condition[0];
                        $operator = $condition[1];
                        $placeholder = ":or_" . count($params); // Placeholder único
                        $orConditions[] = "{$column} {$operator} {$placeholder}";
                        $params[$placeholder] = $condition[2]; // Asociar valor
                    }
                }
                if (!empty($orConditions)) {
                    $whereStr .= " AND (" . implode(" OR ", $orConditions) . ") ";
                }
            } else {
                // Manejo de condiciones estándar (AND)
                if (is_array($value)) {
                    $op = $value[0];
                    $val = $value[1];
    
                    if (!in_array($op, $operators)) {
                        throw new \Exception($op . " comparador no implementado");
                    }
                } else {
                    $op = "=";
                    $val = $value;
                }
    
                $placeholder = ":{$key}";
                $whereStr .= "AND {$key} {$op} {$placeholder} ";
                $params[$placeholder] = $val; // Asociar valor
            }
        }
    
        // Construir la consulta
        $query = "SELECT * FROM {$table} {$whereStr} ORDER BY {$order_by} {$direction} LIMIT {$limit} OFFSET {$offset}";
    
        // Log para depuración
        error_log("SQL Generado: {$query}");
        error_log("Parámetros Vinculados: " . print_r($params, true));
    
        // Preparar la consulta
        $sentencia = $this->pdo->prepare($query);
    
        foreach ($params as $placeholder => $value) {
            $sentencia->bindValue($placeholder, $value);
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
}
