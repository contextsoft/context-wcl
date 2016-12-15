<?php

/**
* Basic database object
*/
class DbObject extends Adapter
{
    protected static function getConnection()
    {
        return Application::getConnection();
    }

    protected static function internalExecSql($sql, $params)
    {
        $con = DbObject::getConnection();
        $query = $con->prepare($sql);
        $query->execute($params);
        return $query;
    }

    public static function execSql($sql, $params)
    {
        DbObject::internalExecSql($sql, $params);
    }

    public static function fetchSql($sql, $params)
    {
        $query = DbObject::internalExecSql($sql, $params);
        return $query->fetchAll(PDO::FETCH_ASSOC);
    }
}

/**
* Adapter with access to DbObject's execSQL and fetchSQL
* Warning: potential sequrity vulnerability
*/
//class DataQuery extends DbObject
//{
//    public static $allowedMethods = ['execSQL', 'fetchSQL'];
//}

/**
* Database table crud interface
*/
class DataTable extends DbObject
{
    public static $allowedMethods = ['fill', 'applyUpdates'];
    
    public $tableName;
    public $idField = 'id';
    public $selectSql;

    public function __construct($tableName = '', $idField = '', $selectSql = '')
    {
        if (!empty($tableName)) {
            $this->$tableName = $tableName;
        }
        if (!empty($idField)) {
            $this->$idField = $idField;
        }
        if (!empty($selectSql)) {
            $this->$selectSql = $selectSql;
        }
    }
    
    public function fill($params)
    {
        $data = [];
        if (!empty($this->selectSql)) {
            $sql = $this->selectSql;
        } else {
            $sql = "select * from $this->tableName";
        }
        $data['records'] = $this->fetchSql($sql, $params);
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
        $this->execSql($sql);
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
        $this->execSql($sql);
    }
    
    public function deleteRecord($params)
    {
        $this->execSql("delete from .$this->tableName where $this->idField = ?", [$params[$this->idField]]);
    }


    public function generateId()
    {
        $cnt = $this->fetchSql("select max(id) + 1 as newId from $this->tableName");
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
