<?php

/**
* Basic database object
*/
class DBObject
{
    protected function getConnection()
    {
        return Application::getConnection();
    }

    protected function fetchSQL($sql)
    {
        $con = $this->getConnection();
        $query = $con->query($sql);
        return $query->fetchAll(PDO::FETCH_ASSOC);
    }

    protected function execSQL($sql)
    {
        $this->getConnection()->exec($sql);
    }
}

/**
* Database table crud interface
*/
class DataTable extends DBObject
{
    public $tableName;
    public $idField = 'id';
    public $sql;
    
    public function fill($params)
    {
        $data = array();
        $data['records'] = $this->fetchSQL("select * from $this->tableName");
        return $data;
    }

    public function applyUpdates($params)
    {
        foreach ($params as $update) {
            $updateType = $update['updateType'];
            if (strcasecmp($updateType, 'update') == 0) {
                $this->updateRecord($update['data']);
            } elseif (strcasecmp($updateType, 'delete') == 0) {
                $this->deleteRecord($update['data']);
            } elseif (strcasecmp($updateType, 'insert') == 0) {
                $this->insertRecord($update['data']);
            }
        }
    }
    
    protected function insertRecord($params)
    {
        $fields = '';
        $values = '';
        if (!isset($params[$this->idField])) {
            $params[$this->idField] = $this->generateId();
        }
        foreach ($params as $field => $value) {
            if (!empty($fields)) {
                $fields = $fields . ',';
            }
            $fields = $fields . $field;
            if (!empty($values)) {
                $values = $values . ',';
            }
            $values = $values . '"' . $value . '"';
        }
        $sql = "insert into $this->tableName ($fields) values ($values)";
        $this->execSQL($sql);
        $result = array();
        $result[$this->idField] = $params[$this->idField];
        return $result;
    }
    
    protected function updateRecord($params)
    {
        $sql = '';
        foreach ($params as $field => $value) {
            if ($field == $this->idField) {
                $idValue = $value;
            } else {
                $pair = "$field = \"$value\"";
                if (!empty($sql)) {
                    $sql = $sql.",\n";
                }
                $sql = $sql . $pair;
            }
        }
        $sql = "update $this->tableName set\n $sql \n where $this->idField = \"$idValue\"";
        $this->execSQL($sql);
    }
    
    protected function deleteRecord($params)
    {
        $this->execSQL('delete from '.$this->tableName.' where '.$this->idField.' = '.$params[$this->idField]);
    }


    protected function generateId()
    {
        $cnt = $this->fetchSQL("select max(id) + 1 as newId from $this->tableName");
        return $cnt[0]['newId'];
    }
}

/**
* Database table set crud interface
*/
class DataTableSet
{
    public $tables = [];
    
    public function fill($params)
    {
        foreach ($this->tables as $table) {
            $data[$table->tableName] = $table->fill($params);
        }
        return $data;
    }

    public function applyUpdates($params)
    {
        foreach ($params as $tableName => $tableParams) {
            $table = $this->getTableByName($tableName);
            $table->applyUpdates($tableParams);
        }
    }

    protected function getTableByName($name)
    {
        foreach ($this->tables as $table) {
            if ($table->tableName === $name) {
                return $table;
            }
        }
    }
}
