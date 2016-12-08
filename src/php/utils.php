<?php

/** Sends email using PHPMailer */
class Mailer
{
    public static function sendMail($email, $displayName, $subj, $body)
    {
        if (!class_exists('Libs')) {
            throw new Exception('External libs not configured.');
        }
        if (!class_exists('MailerConfig')) {
            throw new Exception('Mailer not configured.');
        }
        include_once(Libs::$phpMailer.'/PHPMailerAutoload.php');
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

    public static function checkEmailAddress($email)
    {

        // First, we check that there's one @ symbol,
        // and that the lengths are right.
        if (!ereg("^[^@]{1,64}@[^@]{1,255}$", $email)) {
            // Email invalid because wrong number of characters
            // in one section or wrong number of @ symbols.
            return false;
        }

        // Split it into sections to make life easier
        $email_array = explode("@", $email);
        $local_array = explode(".", $email_array[0]);
        for ($i = 0; $i < sizeof($local_array); $i++) {
            if (!ereg("^(([A-Za-z0-9!#$%&'*+/=?^_`{|}~-][A-Za-z0-9!#$%&'*+/=?^_`{|}~\.-]{0,63})|(\"[^(\\|\")]{0,62}\"))$", $local_array[$i])) {
                return false;
            }
        }

        // Check if domain is IP. If not,
        // it should be valid domain name
        if (!ereg("^\[?[0-9\.]+\]?$", $email_array[1])) {
            $domain_array = explode(".", $email_array[1]);
            if (sizeof($domain_array) < 2) {
                return false; // Not enough parts to domain
            }
            for ($i = 0; $i < sizeof($domain_array); $i++) {
                if (!ereg("^(([A-Za-z0-9][A-Za-z0-9-]{0,61}[A-Za-z0-9])|([A-Za-z0-9]+))$", $domain_array[$i])) {
                    return false;
                }
            }
        }
        return true;
    }
}
