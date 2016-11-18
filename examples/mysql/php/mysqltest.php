<?php
include('config.php');
require('./../../../src/php/service.php');

class World extends DbObject {
    public $tableName = 'country';
    public $id = 'code';
}

class Test extends DbObject {
    public $tableName = 'test';
    public $id = 'id';
} 
 

Application::handleRequest();

?>