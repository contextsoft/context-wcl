<?php

/** Initialazing global Application instance */
new Application(); // MB++ question: why instantiate it, you're using only static method?

class Response {
    public $data;
    public $error;
    public $errorCallstack;
}

/** Basic interface that handled requests, stores session info and database connection */
class Application 
{
    protected static $connection;
    protected static $session;
    protected static $response;
    
    /** Handles POST request
     *  Creates instance of a class and calls its method if request is: {adapter: "className", method: "classMethod", params: ""}
    */
    public static function handleRequest() {
        $obj = null;
        $adapter = null;
        $method = null;
        $params = null;
        $response = new Response();

        try {
            if(isset($_POST['adapter'])) 
                $adapter = $_POST['adapter'];
            if(isset($_POST['method'])) 
                $method = $_POST['method'];
            if(isset($_POST['params'])) 
                $params = $_POST['params']; // I think you need to use json_decode on params
            if(isset($adapter) && isset($method)) {
                // starting session
                Application::getSession(); // if we need it - we should start it anyway

                /*
                  WARNING! Security problem. We are allowing to effectively invoke any class on server using its name.
                  We should somehow control that by testing that class's property and only 
                  allow to call "controller" classes.
                */

                if (strcasecmp($adapter, 'UserSession') == 0) // MB++: not sure if we should allow calling this thing like that, I would rather created a separate controller for it
                    $obj = Application::getSession(); // MB++: no need to call it again if you called it above. Also, the method should take $params parameter
                else
                    $obj = new $adapter();

                if (isset($obj))
                    $response->data = $obj->$method($params);
            }
        }
        catch (Exception $e) {
            Application::handleException($e, $response);
        }
        echo json_encode($response);
    }

    /** Returns PDO object connected to a database, see config.php for configuration */
    public static function getConnection() {
        if (!isset(Application::$connection) || !Application::$connection)
            Application::connectToDb();
        return Application::$connection;
    }

    /** Connects to DB */
    protected static function connectToDb() {
        if(!class_exists('DatabaseConfig'))
            throw new Exception('Database not configured.'); 
        Application::$connection = new PDO(DatabaseConfig::$dsn, DatabaseConfig::$username, DatabaseConfig::$password);
        Application::$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    /** Returns Session object */
    public static function getSession() {
        if (!Application::$session)
            Application::$session = new UserSession();
        return Application::$session;
    }

    /** Appends error to the response */
    protected static function handleException($e, $response) {
        $response->error = $e->getMessage();
        $response->errorCallstack = nl2br('<br>Exception at:<br>'.$e->getTraceAsString());
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
        $data = array();
        $data['records'] = $query->fetchAll(PDO::FETCH_ASSOC);
        return $data; 
    }
    
    public function insert($params) {
        
    }
    
    public function update($params) {
        
    }
    
    public function delete($params) {
        $this->getConnection()->exec('delete from '.$this->tableName.' where '.$this->idField.' = '.$params[$this->idField]);
    }
}

?>