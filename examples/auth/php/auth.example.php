<?php
include('config.php');
require('./../../../src/php/service.php');

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
class TestTable extends DataTable
{
    public $tableName = 'test';
    public $id = 'id';
}

/*
Test table:
CREATE TABLE `test2` (
  `id` int(11) NOT NULL,
  `col4` varchar(45) DEFAULT NULL,
  `col5` varchar(45) DEFAULT NULL,
  `col6` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
*/
class Test2Table extends DataTable
{
    public $tableName = 'test2';
    public $id = 'id';
}

class TestTableSet extends DataTableSet
{
    function __construct()
    {
        $this->tables[] = new TestTable();
        $this->tables[] = new Test2Table();
    }
}
 

Application::handleRequest();
