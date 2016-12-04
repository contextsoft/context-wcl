<?php

/**
* Basic database object
*/
class DBObject extends Adapter
{
    public static $allowedExternalCalls = [];

    protected function getConnection()
    {
        return Application::getConnection();
    }

    protected function internalExecSQL($sql, $params)
    {
        $con = $this->getConnection();
        $query = $con->prepare($sql);
        $query->execute($params);
        return $query;
    }

    protected function execSQL($sql, $params)
    {
        $this->internalExecSQL($sql, $params);
    }

    protected function fetchSQL($sql, $params)
    {
        $query = $this->internalExecSQL($sql, $params);
        return $query->fetchAll(PDO::FETCH_ASSOC);
    }
}

/**
* Database table crud interface
*/
class DataTable extends DBObject
{
    public static $allowedMethods = ['fill', 'applyUpdates'];
    
    public $tableName;
    public $idField = 'id';
    public $sql;

    public function __construct($tableName = '', $idField = '')
    {
        if ($tableName != '') {
            $this->$tableName = $tableName;
        }
        if ($idField != '') {
            $this->$idField = $idField;
        }
    }
    
    public function fill($params)
    {
        $data = [];
        $sql = "select * from $this->tableName";
        $data['records'] = $this->fetchSQL($sql, $params);
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
    
    public function insertRecord($params)
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
        $result = [];
        $result[$this->idField] = $params[$this->idField];
        return $result;
    }
    
    public function updateRecord($params)
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
    
    public function deleteRecord($params)
    {
        $this->execSQL('delete from '.$this->tableName.' where '.$this->idField.' = '.$params[$this->idField]);
    }


    public function generateId()
    {
        $cnt = $this->fetchSQL("select max(id) + 1 as newId from $this->tableName");
        return $cnt[0]['newId'];
    }
}

/**
* Database table set crud interface
*/
class DataTableSet extends Adapter
{
    public static $allowedMethods = ['fill', 'applyUpdates'];

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

    public function getTableByName($name)
    {
        foreach ($this->tables as $table) {
            if ($table->tableName === $name) {
                return $table;
            }
        }
    }
}
