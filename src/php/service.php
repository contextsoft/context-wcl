<?php

/** Global Application instance */
Application::$instance = new Application();

class Response {
    public $data;
    public $error;
    public $errorCallstack;
}

/** Basic interface that handled requests, stores session info and database connection **/
class Application 
{
    public static $instance;
    public $configFilePath = 'config.ini';

    protected $connection;
    protected $session;
    protected $response;

    public function __construct() {
    }

    /** Appends error to the response */
    public function handleException($e) {
        $this->response->error = $e->getMessage();
        $this->response->errorCallstack = nl2br('Exception at:<br>'.$e->getTraceAsString());
   }    
    
    /** Returns MySQLi object connected to a database described at the Application::$configFilePath */
    public function getConnection() {
        if (!isset($this->connection) || $this->connection)
            $this->connectToDb();
        return $this->connection;
    }
    
    /** Returns Session object */
    public function getSession() {
        if (!$this->session)
            $this->session = new UserSession();
        return $this->session;
    }
    
    /** Handles POST request
     *  Creates instance of a class and calls its method if request is: {adapter: "className", method: "classMethod", params: ""}
    */
    public function handleRequest() {
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
                $this->response->data = $obj->$method($params);
            }
        }
        catch (Exception $e) {
            $this->handleException($e);
            /*if (function_exists('xdebug_print_function_stack')) {
                xdebug_print_function_stack($e->getMessage());        
                echo json_encode($this->response);
                return;
            }*/
        }
        echo json_encode($this->response);
    }

    protected function connectToDb() {
        $config = parse_ini_file(Application::$instance->configFilePath); 
        $this->connection = mysqli_connect($config['host'], $config['username'], $config['password'], $config['dbname']);
        if (!$this->connection)
            throw new Exception(mysqli_connect_error()); 
    }
}

/** Stores session info */
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

/** Basic interface to access database **/
class DbObject 
{
    public $tableName;
    public $idField = 'id';
    
    public function fields() {
        return ['id' => 'string'];
    }
    
    public function getConnection() {
        return Application::$instance->getConnection();
    }
    
    public function select($params) {
        $con = $this->getConnection();
        $data = $con->query('select * from '.$this->tableName);
        if ($con->error)
            throw new Exception($con->error);
        return $data; 
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