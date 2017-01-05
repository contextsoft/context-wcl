<?php
require_once('config.php');
Libs::requireLib(Libs::$contexWcl);

UserSession::startSession();

header('Content-type: text/html');
$provider = $_GET["provider"];
try {
    $auth = new Auth();
    $auth->loginSocial(['provider' => $provider]);
    echo "<script type='text/javascript'>";
    echo "window.close();";
    echo "</script>";
} catch (Exception $e) {
    echo "Ooophs, we got an error: " . $e->getMessage();
}
