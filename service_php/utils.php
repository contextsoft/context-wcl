<?php

/** Various handy routines */
class Utils
{
    static function scriptDir()
    {
        return dirname(__FILE__);
    }
}

/** Sends email using PHPMailer */
class Mailer
{
    static function sendMail($email, $displayName, $subj, $body)
    {
        if (!class_exists('Libs')) {
            throw new Exception('External libs not configured.');
        }
        if (!class_exists('MailerConfig')) {
            throw new Exception('Mailer not configured.');
        }
        Libs::checkPath(Libs::$phpMailer);
        require_once(Libs::$phpMailer.'/PHPMailerAutoload.php');
        $mail = new PHPMailer;
        $mail->isSMTP(); // Set mailer to use SMTP
        $mail->Host = MailerConfig::$host;  // Specify main and backup server
        $mail->SMTPAuth = MailerConfig::$SMTPAuth; // Enable SMTP authentication
        $mail->Username = MailerConfig::$username; // SMTP username
        $mail->Password = MailerConfig::$password;  // SMTP password
        $mail->SMTPSecure = MailerConfig::$SMTPSecure; // Enable encryption, 'ssl' also accepted
        $mail->Port = MailerConfig::$port;
        $mail->From = MailerConfig::$from;
        $mail->FromName = MailerConfig::$fromName;
        $mail->addAddress($email, $displayName);  // Add a recipient
        $mail->WordWrap = 50; // Set word wrap to 50 characters
        $mail->isHTML(true); // Set email format to HTML
        $mail->Subject = $subj;
        $mail->Body = $body;
        $mail->AltBody = strip_tags($mail->Body);
        //$mail->SMTPDebug = 1;
        if (!$mail->send()) {
            throw new Exception("Email could not be sent. Error: $mail->ErrorInfo");
        }
    }

    static function validateEmail($email)
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL);
    }
}
