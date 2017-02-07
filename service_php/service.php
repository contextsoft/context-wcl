<?php

require_once('utils.php');
require_once('dbobject.php');
require_once('auth.php');

/** Response sent to client by the service */
class Response
{
    public $data;
    public $code;
    public $message;
    public $stack;
}

/** Interface for all classes that can be called by a client directly */
interface IAdapter
{
    /** Returns string array of methods that can be called */
    public static function getAllowedMethods();
}

/**
 * Application entry point: handles requests, stores session info and database connection
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
                    if (is_array($decoded)) {
                        $params = $decoded;
                    }
                }
            }
            // creating adapter class and calling its method
            if (isset($adapter) && isset($method)) {
                // checking is class exists
                if (class_exists($adapter)) {
                    // checking is it an Adapter
                    $interfaces = class_implements($adapter);
                    if (!isset($interfaces['IAdapter'])) {
                        throw new Exception("$adapter is not an adapter");
                    }
                    
                    // checking if method is allowed
                    if (array_search($method, $adapter::getAllowedMethods()) === false) {
                        throw new Exception("$adapter.$method is not allowed call");
                    }
                    
                    // starting session
                    UserSession::startSession();

                    // creating object and calling its method
                    $obj = new $adapter();
                    $response->data = $obj->$method($params);
                } else {
                    throw new Exception("Adapter $adapter does not exists");
                }
            } else {
                throw new Exception("Adapter or method not provided");
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

    /** TODO: Localizes string into selected language */
    public static function L($str)
    {
        return $str;
    }

    /** Raises localized exception */
    public static function raise($error, $code = null)
    {
        throw new Exception(Application::L($error), $code);
    }

    /** Connects to DB */
    protected static function connectToDb()
    {
        if (!class_exists('DatabaseConfig')) {
            throw new Exception('Database not configured');
        }
        Application::$connection = new PDO(DatabaseConfig::$dsn, DatabaseConfig::$username, DatabaseConfig::$password);
        Application::$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }


    /** Appends error to the response */
    protected static function handleException($e, $response)
    {
        $response->code = $e->getCode();
        $response->message = $e->getMessage();
        $response->stack = nl2br('<b>Service Trace:</b><br>'.$e->getTraceAsString());
    }
}

/**
 * Provides utils for _SESSION access
 */
class UserSession implements IAdapter
{
    public static function getAllowedMethods()
    {
        return [/*'getSession'*/];
    }
    
    public static function startSession()
    {
        session_start();
        if (!isset($_SESSION['time'])) {
            session_regenerate_id(true);
            $_SESSION['time'] = time();
        }
    }
    
    public static function setValue($name, $value)
    {
        if (empty($value)) {
            unset($_SESSION[$name]);
        } else {
            $_SESSION[$name] = $value;
        }
    }
    
    public static function getValue($name)
    {
        return isset($_SESSION[$name]) ? $_SESSION[$name] : null;
    }

    public static function getSession()
    {
        return $_SESSION;
    }
}
