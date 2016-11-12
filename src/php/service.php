<?php

error_log("service.php loaded and executed", 0);
echo "Ok";
    /*error_log("service.php executed", 0);
    if (isset($_POST["action"]) && !empty($_POST["action"])) 
    { 
                $action = $_POST["action"];
        error_log("data.php action: $action", 0);
        switch($action) {
            case "getData": 
            {
                getData(); 
                break;
            }
            case "saveData": 
            {
                saveData(); 
                break;
            }
        }
    }
    else
        error_log("data.php action not defined", 0);*/

/*class Application {
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
    
    public function HandleRequest() {
        $adapter = $_POST('adapter');
        $method = $_POST('method');
        $params = json_decode($_POST('params'));
        $dbobject = new $adapter();
        $res = $dbobject->$method($params);
        echo json_encode($res);
    }
}

class UserSession {
    public function __construct()  {
        $this->session_start();
        if (!isset($_SESSION['CREATED']))
        {
            // invalidate old session data and ID
            $this->session_regenerate_id(true);
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

$app = new Application();
global $app;*/



?>