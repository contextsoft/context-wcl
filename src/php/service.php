<?php

/** Initialazing global Application instance */
new Application();

class Response
{
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
            if (isset($_POST['params'])) {
                $params = $_POST['params'];
                if (!empty($params)) {
                    $decoded = json_decode($params, true);
                    if ($decoded) {
                        $params = $decoded;
                    }
                }
            }
            if (isset($adapter) && isset($method)) {
                // starting session
                Application::getSession();
                if (strcasecmp($adapter, 'UserSession') == 0) {
                    $obj = Application::getSession();
                } else {
                    $obj = new $adapter();
                }
                if (isset($obj)) {
                    $response->data = $obj->$method($params);
                }
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

/** Stores session info */
class UserSession
{
    public function __construct()
    {
        session_start();
        if (!isset($_SESSION['time'])) {
            session_regenerate_id(true);
            //$_SESSION['sessionId'] = session_id();
            $_SESSION['time'] = time();
        }
    }

    public function getSessionInfo()
    {
        return $_SESSION;
    }
    
    public function setValue($name, $value)
    {
        $_SESSION[$name] = $value;
    }
    
    public function getValue($name)
    {
        return $_SESSION[$name];
    }
}

/** Basic interface to access database **/
class DbObject
{
    public $tableName;
    public $idField = 'id';
    public $sql;
    
    public function fields()
    {
        return ['id' => 'string'];
    }
    
    public function getConnection()
    {
        return Application::getConnection();
    }
    
    public function select($params)
    {
        $data = array();
        $data['records'] = $this->fetchSQL("select * from $this->tableName");
        return $data;
    }

    public function fetchSQL($sql)
    {
        $con = $this->getConnection();
        $query = $con->query($sql);
        return $query->fetchAll(PDO::FETCH_ASSOC);
    }

    public function execSQL($sql)
    {
        $this->getConnection()->exec($sql);
    }
    
    public function insert($params)
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
        $result = array();
        $result[$this->idField] = $params[$this->idField];
        return $result;
    }
    
    public function update($params)
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
    
    public function delete($params)
    {
        $this->execSQL('delete from '.$this->tableName.' where '.$this->idField.' = '.$params[$this->idField]);
    }

    protected function generateId()
    {
        $cnt = $this->fetchSQL("select max(id) + 1 as newId from $this->tableName");
        return $cnt[0]['newId'];
    }
}
