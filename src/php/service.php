<?php

/** Initialazing global Application instance */
new Application();

class Response {
    public $data;
    public $error;
    public $errorCallstack;
}

/** Basic interface that handled requests, stores session info and database connection */
class Application 
{
    public $configFilePath = 'config.ini';

    protected static $instance;
    protected $connection;
    protected $session;
    protected $response;
    
    public function __construct() {
        Application::$instance = $this;
    } 
    
    /** Handles POST request
     *  Creates instance of a class and calls its method if request is: {adapter: "className", method: "classMethod", params: ""}
    */
    public static function handleRequest() {
        Application::$instance->doHandleRequest();        
    }
    protected function doHandleRequest() {
        $obj = null;
        $adapter = null;
        $method = null;
        $params = null;
        $this->response = new Response();

        try {
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
                if (isset($obj))
                    $this->response->data = $obj->$method($params);
            }
        }
        catch (Exception $e) {
            $this->handleException($e);
        }
        echo json_encode($this->response);
    }

    /** Returns MySQLi object connected to a database described at the Application::$configFilePath */
    public static function getConnection() {
        return Application::$instance->doGetConnection(); 
    }
    protected function doGetConnection() {
        if (!isset($this->connection) || $this->connection)
            $this->connectToDb();
        return $this->connection;
    }
    
    /** Returns Session object */
    public static function getSession() {
         return Application::$instance->doGetSession();    
    }
    protected function doGetSession() {
        if (!$this->session)
            $this->session = new UserSession();
        return $this->session;
    }

    protected function connectToDb() {
        $config = parse_ini_file(Application::$instance->configFilePath); 
        $this->connection = mysqli_connect($config['host'], $config['username'], $config['password'], $config['dbname']);
        if (!$this->connection)
            throw new Exception(mysqli_connect_error()); 
    }

    /** Appends error to the response */
    protected function handleException($e) {
        $this->response->error = $e->getMessage();
        $this->response->errorCallstack = nl2br('<br>Exception at:<br>'.$e->getTraceAsString());
    }    
    
}

/** Stores session info */
class UserSession 
{
    public function __construct() {
        session_start();
        if (!isset($_SESSION['time'])) {
            session_regenerate_id(true);
            //$_SESSION['sessionId'] = session_id();
            $_SESSION['time'] = time();
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

/** Basic interface to access database **/
class DbObject 
{
    public $tableName;
    public $idField = 'id';
    public $sql;
    
    public function fields() {
        return ['id' => 'string'];
    }
    
    public function getConnection() {
        return Application::getConnection();
    }
    
    public function select($params) {
        $con = $this->getConnection();
        $query = $con->query('select * from '.$this->tableName);
        if ($con->error)
            throw new Exception($con->error);
        if (!$query)
            return;
        try {
            $data = array();

            $finfo = $query->fetch_fields();

            // fields
            foreach ($finfo as $val) 
                $data['fields'][] = $val;

            // rows
            while ($row = $query->fetch_assoc()) 
                $data['rows'][] = $row;
            
            return $data; 
        }
        finally {
            $query->free();
        }
    }
    
    public function insert($params) {
        
    }
    
    public function update($params) {
        
    }
    
    public function delete($params) {
        $this->getConnection()->query('delete from '.$this->tableName.' where '.$this->idField.' = '.$params[$this->idField]);
    }
}

?>