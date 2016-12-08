<?php

class Libs
{
    static $hybridAuth = '../hybridauth/hybridauth/Hybrid';
    static $phpMailer = '../PHPMailer';
}

class DatabaseConfig
{
    static $dsn = 'mysql:host=localhost;dbname=test';
    static $username = 'root';
    static $password = '1234';
}

class MailerConfig
{
    static $host = 'smtp.gmail.comm';  // Specify main and backup server
    static $SMTPAuth = true; // Enable SMTP authentication
    static $SMTPSecure = 'ssl';  // Enable encryption, 'ssl' also accepted
    static $username = 'test.contextsoft@gmail.com';  // SMTP username
    static $password = 'context1151'; // SMTP password
    static $port = 465;
    static $from = 'test.contextsoft@gmail.com';
    static $fromName = 'test.contextsoft@gmail.com';
}

class AuthConfig
{
    /**
    * HybridAuth
    * http://hybridauth.sourceforge.net | http://github.com/hybridauth/hybridauth
    * (c) 2009-2015, HybridAuth authors | http://hybridauth.sourceforge.net/licenses.html
    */
    // ----------------------------------------------------------------------------------------
    //	HybridAuth Config file: http://hybridauth.sourceforge.net/userguide/Configuration.html
    // ----------------------------------------------------------------------------------------
    static $hybridAuthConfig = [
        "base_url" => "http://localhost/hybridauth-git/hybridauth/",
        "providers" => array(
            // openid providers
            "OpenID" => array(
                "enabled" => true
            ),
            "Yahoo" => array(
                "enabled" => true,
                "keys" => array("key" => "", "secret" => ""),
            ),
            "AOL" => array(
                "enabled" => true
            ),
            "Google" => array(
                "enabled" => true,
                "keys" => array("id" => "", "secret" => ""),
            ),
            "Facebook" => array(
                "enabled" => true,
                "keys" => array("id" => "", "secret" => ""),
                "trustForwarded" => false
            ),
            "Twitter" => array(
                "enabled" => true,
                "keys" => array("key" => "", "secret" => ""),
                "includeEmail" => false
            ),
            // windows live
            "Live" => array(
                "enabled" => true,
                "keys" => array("id" => "", "secret" => "")
            ),
            "LinkedIn" => array(
                "enabled" => true,
                "keys" => array("key" => "", "secret" => "")
            ),
            "Foursquare" => array(
                "enabled" => true,
                "keys" => array("id" => "", "secret" => "")
            ),
        ),
        // If you want to enable logging, set 'debug_mode' to true.
        // You can also set it to
        // - "error" To log only error messages. Useful in production
        // - "info" To log info and error messages (ignore debug messages)
        "debug_mode" => false,
        // Path to file writable by the web server. Required if 'debug_mode' is not false
        "debug_file" => "",
        ];
}
