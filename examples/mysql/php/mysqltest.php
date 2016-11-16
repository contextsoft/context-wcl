<?php
require('./../../../src/php/service.php');

class World extends DbObject {
    public $tableName = 'country';
} 

Application::$instance->handleRequest();

?>