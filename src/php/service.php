<?php

$application = new Application();
global $application;
$application->handleRequest();

class Application 
{
    protected $connection;
    protected $session;
    
    public function getConnection() {
        if (!isset($this->connection))
            $this->connectToDb();
        if (!isset($this->connection))
            return mysqli_connect_error();
        return $this->connection;
    }
    
    public function getSession() {
        if (!$this->session)
            $this->session = new UserSession();
        return $this->session;
    }
    
    public function handleRequest() {
        $adapter = null;
        $method = null;
        $params = null;
        $res = null;
        if(isset($_POST['adapter'])) 
            $adapter = $_POST['adapter'];
        if(isset($_POST['method'])) 
            $method = $_POST['method'];
        if(isset($_POST['params'])) 
            $params = $_POST['params'];
        if(isset($adapter) && isset($method)) {
            $this->getSession();
            if (strcasecmp($adapter, 'Application') == 0)
                $obj = $this;
            else if (strcasecmp($adapter, 'UserSession') == 0)
                $obj = $this->getSession();
            else
                $obj = new $adapter();
            $res = $obj->$method($params);
        }
        echo json_encode($res);
    }

    protected function connectToDb() {
        $config = parse_ini_file('../config.ini'); 
        $this->$connection = mysqli_connect($config['host'], $config['username'], $config['password'], $config['dbname']);
        if($this->connection === false) {
            $this->connection = null;  
        }        
    }
}

class UserSession 
{
    public function __construct() {
        session_start();
        if (!isset($_SESSION['created'])) {
            session_regenerate_id(true);
            $_SESSION['sessionId'] = session_id();
            $_SESSION['created'] = time();
        }
    }

    public function getSessionInfo() {
        return $_SESSION;
    }
    
    public function setValue($name, $value) {
        $_SESSION[$name] = $value;
    }
    
    public function getValue($name) {
        return $_SESSION[$name];
    }
}

class DbObject 
{
    public $tableName;
    public $idField = 'id';
    
    public function fields() {
        return ['id' => 'string'];
    }
    
    public function getConnection() {
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
        $this->getConnection()->query('delete from '.$this->tableName().' where '.$this->idField().' = '.$params[$this->idField()]);
    }
}

?>