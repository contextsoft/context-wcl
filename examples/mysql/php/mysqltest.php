<?php
require('./../../../src/php/service.php');

class World extends DbObject {
    public $tableName = 'country';
    public $id = 'code';
} 

Application::handleRequest();

?>