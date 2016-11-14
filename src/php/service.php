<?php

error_log("service.php loaded and executed", 0);
$app = new Application();
global $app;
$app->handleRequest();

class Application {
    protected $_connection;
    protected $_session;
    
    public function getConnection() {
        return $this->_connection;
    }
    
    public function getSession() {
        if (!$this->_session)
            $this->_session = new UserSession();
        return $this->_session;
    }
    
    public function handleRequest() {
        error_log("handleRequest called", 0);
        $adapter = null;
        $method = null;
        $params = null;
        $res = '';
        if(isset($_POST['adapter'])) {
            $adapter = $_POST['adapter'];
            error_log("handleRequest adapter: ".$adapter, 0);
        }
        if(isset($_POST['method'])) {
            $method = $_POST['method'];
            error_log("handleRequest method: ".$method, 0);
        }
        if(isset($_POST['params'])) {
            $params = $_POST['params'];
            error_log("handleRequest params: ".$params, 0);
        }
        if(isset($adapter) && isset($method)) {
            $obj = new $adapter();
            $res = $obj->$method($params);
        }
        echo json_encode($res);
    }
}

class UserSession {
    public function __construct()  {
        //$this->session_start();
        if (!isset($_SESSION['CREATED']))
        {
            // invalidate old session data and ID
            //$this->session_regenerate_id(true);
            $_SESSION['CREATED'] = time();
        }
    }
    
    function getSessionInfo() {
        return $_SESSION;
    }
    
    function setValue($name, $value) {
        $_SESSION[$name] = $value;
    }
    
    function getValue($name) {
        return $_SESSION[$name];
    }
}


class DbObject {
    public static function tableName() {
        return '';
    }
    
    public static function idField() {
        return 'id';
    }
    
    public static function fields() {
        return ['id' => 'string'];
    }
    
    public static function getConnection() {
        return $app->getConnection();
    }
    
    public function select($params) {
        return $this->getConnection()->query('select * from '.$this->tableName());
    }
    
    public function insert($params) {
        
    }
    
    public function update($params) {
        
    }
    
    public function delete($params) {
        //$this->getConnection()->query('delete from '.$this->tableName().' where '.$this->idField().' = '.$params[$this->idField()]]);
    }
    
}


?>