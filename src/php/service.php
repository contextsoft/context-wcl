<?php

require_once('dbobject.php');
require_once('auth.php');



/** Basic adapter type (object directly called by client) */
class Adapter
{
    /** List of methods that can be called */
    public static $allowedMethods = [];
}

/** Response sent by service */
class Response
{
    public $data;
    public $error;
    public $errorCallstack;
}

/**
* Basic interface that handled requests, stores session info and database connection
*/
class Application
{
    protected static $connection;
    
    /** Handles POST request
     *  Creates instance of a class and calls its method if request is: {adapter: "className", method: "classMethod", params: ""}
    */
    public static function handleRequest()
    {
        $obj = null;
        $adapter = null;
        $method = null;
        $params = null;
        $response = new Response();

        try {
            if (isset($_POST['adapter'])) {
                $adapter = $_POST['adapter'];
            }
            if (isset($_POST['method'])) {
                $method = $_POST['method'];
            }
            if (isset($_POST['params']) && $_POST['params'] != 'null') {
                $params = $_POST['params'];
                if (!empty($params)) {
                    $decoded = json_decode($params, true);
                    if ($decoded) {
                        $params = $decoded;
                    }
                }
            }
            if (isset($adapter) && isset($method)) {
                // checking is class exists
                if (class_exists($adapter)) {
                    $obj = new $adapter();
                    // checking is it an Adapter
                    if (!is_subclass_of($obj, 'Adapter')) {
                        throw new Exception("'$adapter' is not an adapter.");
                    }
                    // checking if method is allowed
                    if (array_search($method, $adapter::$allowedMethods) === false) {
                        throw new Exception("'$method' is not allowed method for '$adapter'.");
                    }
                    // starting session
                    UserSession::startSession();
                    $response->data = $obj->$method($params);
                } else {
                    throw new Exception("Adapter '$adapter' does not exists.");
                }
            } else {
                throw new Exception("Adapter or method not provided.");
            }
        } catch (Exception $e) {
            Application::handleException($e, $response);
        }
        echo json_encode($response);
    }

    /** Returns PDO object connected to a database, see config.php for configuration */
    public static function getConnection()
    {
        if (!isset(Application::$connection) || !Application::$connection) {
            Application::connectToDb();
        }
        return Application::$connection;
    }

    /** Connects to DB */
    protected static function connectToDb()
    {
        if (!class_exists('DatabaseConfig')) {
            throw new Exception('Database not configured.');
        }
        Application::$connection = new PDO(DatabaseConfig::$dsn, DatabaseConfig::$username, DatabaseConfig::$password);
        Application::$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    /** Returns Session object */
    public static function getSession()
    {
        if (!Application::$session) {
            Application::$session = new UserSession();
        }
        return Application::$session;
    }

    /** Appends error to the response */
    protected static function handleException($e, $response)
    {
        $response->error = $e->getMessage();
        $response->errorCallstack = nl2br('<br>Exception at:<br>'.$e->getTraceAsString());
    }
}

/**
* Stores session info
*/
class UserSession
{
    public static function startSession()
    {
        session_start();
        if (!isset($_SESSION['time'])) {
            session_regenerate_id(true);
            //$_SESSION['sessionId'] = session_id();
            $_SESSION['time'] = time();
        }
    }
    
    public static function setValue($name, $value)
    {
        $_SESSION[$name] = $value;
    }
    
    public static function getValue($name)
    {
        return $_SESSION[$name] || null;
    }
}
