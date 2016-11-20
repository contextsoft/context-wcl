<?php
include('config.php');
require('./../../../src/php/service.php');

class World extends DbObject
{
    public $tableName = 'country';
    public $id = 'code';
}

/*
Test table:
CREATE TABLE `test` (
  `id` int(11) NOT NULL,
  `col1` varchar(45) DEFAULT NULL,
  `col2` varchar(45) DEFAULT NULL,
  `col3` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
*/
class Test extends DbObject
{
    public $tableName = 'test';
    public $id = 'id';
}
 

Application::handleRequest();
