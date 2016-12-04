<?php

class Auth extends Adapter 
{
    public static function generatePassword($word_length = 6, $allowed_chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')    
    {
        if (!isset($allowed_chars) || !strlen($allowed_chars))
            $allowed_chars = '1234567890QWERTYUIOPASDFGHJKLZXCVBNM';
        $str = array();
        for ($i = 0; $i < $word_length; $i++)
            $str[] = substr($allowed_chars, rand(1, strlen($allowed_chars)) - 1, 1);
        shuffle($str);
        return implode("", $str);
    }

    protected function resultMessageDie($resultStr)
    {
        //echo json_encode(array('message' => $resultStr));
        //die();
        throw new Exception($resultStr);
    }

    public function getAuthProviders($params)
    {
        if (!class_exists('AuthConfig')) {
            throw new Exception('Auth not configured.');
        }
        $providers_enabled = [];
        foreach(AuthConfig::$hybridAuthProviders['providers'] as $provider => $provider_options) {
            if (isset($provider_options['enabled']) && $provider_options['enabled'])
                $providers_enabled[] = $provider;
        }
        return $providers_enabled;
    }

    public function getUserInfo($params)
    {
        $content = [];
        if (UserSession::getValue('userId'))
        {
            $content['userPhotoURL'] = UserSession::getValue("userPhotoURL");
            $content['userDisplayName'] = UserSession::getValue("userDisplayName");
        }
        return $content;
    }

    public function startLogin($params)
    {
        $secret = Auth::generatePassword(30);
        $_SESSION['loginSecret'] = $secret;
        return $secret;
    }

    public function doLogin($params)
    {
        if (isset($params['secret']) && UserSession::getValue('loginSecret') == $params['secret'] && isset($_POST['email']) && isset($_POST['password']))
        {
            $email = $_POST['email'];
            if (!($result_str = db_connect()))
                if ($query =
                    db_query
                    (
                        query_params(
                            'SELECT id, photoURL, displayName, firstName, lastName, emailConfirmed FROM user u WHERE UPPER(TRIM(u.email)) = UPPER(TRIM(:email)) AND u.password = MD5(:password)',
                            array('email' => $email, 'password' => $_POST['password']))
                    ))
                    {
                    $row = db_fetch_assoc($query);
                    if ($row)
                    {
                        if ($row['emailConfirmed'] == 'T')
                        {
                            setCustomer($row['id'], $row['photoURL'], $row['displayName']);
                            $result_str = 'OK';
                        } 
                        else 
                          $result_str = 'email_confirm_expected';
                    } 
                    else 
                        $result_str = 'E-Mail or password not found. Please correct and try again';
                } 
                else 
                    $result_str = db_error().' Please contact system administrator';
            else ;
        } else $result_str = 'Parameters mismatch. Please refresh the page and try again';

        echo json_encode(array('message' => $result_str, 'email' => $email));
    }

    public function startEmailConfirm($params)
    {
        $secret = Auth::generatePassword(30);
        $_SESSION['email_confirm_secret'] = $secret;
        echo json_encode(array('message' => 'ok', 'secret' => $secret));
    }

    public function doEmailConfirm($params)
    {
        if (isset($_SESSION['email_confirm_secret']) && isset($_POST['secret']) && $_SESSION['email_confirm_secret'] == $_POST['secret'] &&
            isset($_POST['email']) && isset($_POST['code']))
        {
            if (!($result_str = db_connect()))
                if ($query =
                    db_query
                    (
                        query_params(
                            'SELECT id, photoURL, displayName, firstName, lastName FROM user u WHERE UPPER(TRIM(u.email)) = UPPER(TRIM(:email)) AND u.emailConfirmationKey = :eConfirmationKey',
                            array('email' => $_POST['email'], 'eConfirmationKey' => $_POST['code']))
                    ))
                {
                    $row = db_fetch_assoc($query);
                    if ($row)
                    {
                        if (db_query
                        (
                            query_params(
                                'Update user Set emailConfirmed = :emailConfirmed, emailConfirmationKey = :emailConfirmationKey WHERE id = :id',
                                array('id' => $row['id'], 'emailConfirmed' => 'T', 'emailConfirmationKey' => null))
                        ))
                        {
                            setCustomer($row['id'], $row['photoURL'], $row['displayName']);
                            $result_str = 'OK';
                        } else $result_str = db_error().' Please contact system administrator';
                    } else $result_str = 'E-Mail not found or code is not valid. Please correct and try again';
                } else $result_str = db_error().' Please contact system administrator';
            else ;
        } else $result_str = 'Parameters mismatch. Please refresh the page and try again';

        echo json_encode(array('message' => $result_str));
    }

    public function resendEmailConfirm($params)
    {
        if (isset($_SESSION['email_confirm_secret']) && isset($_POST['secret']) && $_SESSION['email_confirm_secret'] == $_POST['secret'] && isset($_POST['email']))
            $result_str = startEmailConfirmation($_POST['email'], rootDir());
        else $result_str = 'Parameters mismatch. Please refresh the page and try again '.$_SESSION['email_confirm_secret'].' '.$_POST['secret'];

        echo json_encode(array('message' => $result_str ? $result_str : 'OK'));
    }

   public function startResetPassword($params)
    {
        if (isset($_SESSION['login_secret']) && isset($_POST['secret']) && $_SESSION['login_secret'] == $_POST['secret'])
        {
            $secret = Auth::generatePassword(30);
            $_SESSION['request_reset_password_secret'] = $secret;
            echo json_encode(array('message' => 'ok', 'email' => isset($_REQUEST['email']) ? $_REQUEST['email'] : null, 'secret' => $secret));
        } else echo json_encode(array('message' => 'Parameters mismatch. Please refresh the page and try again'));
    }

    public function requestResetPassword($params)
    {
        if (isset($_SESSION['request_reset_password_secret']) && isset($_POST['secret']) && $_SESSION['request_reset_password_secret'] == $_POST['secret'] && isset($_POST['email']))
        {
            $email = $_POST['email'];
            if (!($result_str = db_connect()))
                if ($query =
                    db_query
                    (
                        query_params(
                            'SELECT id, displayName FROM user WHERE UPPER(TRIM(email)) = UPPER(TRIM(:email))',
                            array('email' => $email))
                    ))
                {
                    $row = db_fetch_assoc($query);
                    if ($row)
                    {
                        $passwordResetKey = Auth::generatePassword(30);
                        if (db_query
                        (
                            query_params(
                                'Update user Set passwordResetKey = :passwordResetKey WHERE UPPER(TRIM(email)) = UPPER(TRIM(:email))',
                                array('email' => $email, 'passwordResetKey' => $passwordResetKey))
                        ))
                        {
                            try
                            {
                                $result_str =
                                    sendMail($email, $displayName, 'Password reset request',
                                        'Password reset requested' . "\n" .
                                        'Please use the code: '.md5($email . '-' . $row['id'] . '-' . $passwordResetKey));
                                if (!$result_str)
                                    $result_str = 'ok';
                            } catch (Exception $e)
                            {
                                $result_str = $e->getMessage() . '!';
                            }
                        } else $result_str = db_error() . ' Please contact system administrator';
                    } else $result_str = 'Parameters mismatch. Please refresh the page and try again '.$email;
                } else $result_str = db_error().' Please contact system administrator';
            else ;
        } else $result_str = 'Parameters mismatch. Please refresh the page and try again';

        $secret = Auth::generatePassword(30);
        $_SESSION['reset_password_secret'] = $secret;
        echo json_encode(array('message' => $result_str, 'secret' => $secret));
    }

    public function doResetPassword($params)
    {
        if (isset($_SESSION['reset_password_secret']) && isset($_POST['secret']) && $_SESSION['reset_password_secret'] == $_POST['secret'] &&
            isset($_POST['code']) && isset($_POST['password1']) && isset($_POST['password2']))
        {

            if (!isset($_POST['password1']) || !isset($_POST['password2']))
                resultMessageDie('password can not be empty');
            if ($_POST['password1'] != $_POST['password2'])
                resultMessageDie('password confirm error');
            $password = $_POST['password1'];
            if (!strlen($password))
                resultMessageDie('password can not be empty');

            if ($result_str = db_connect())
                resultMessageDie($result_str);

            $query =
                db_query
                (
                    query_params(
                        "SELECT u.id, u.photoURL, u.displayName FROM user u WHERE MD5(CONCAT(u.email, '-', u.id, '-', u.passwordResetKey)) = :passwordResetKey",
                        array('passwordResetKey' => $_POST['code']))
                );
            if (!$query)
                resultMessageDie(db_error().' Please contact system administrator');

            $row = db_fetch_assoc($query);
            if (!$row)
                resultMessageDie('Code is not correct. Please request password change again');

            if (!db_query
            (
                query_params(
                    'Update user u Set password = md5(:password), passwordResetKey = null Where id = :id',
                    array('password' => $password, 'id' => $row['id']))
            ))
                resultMessageDie(db_error().' Please contact system administrator');

            setCustomer($row['id'], $row['photoURL'], $row['displayName']);
            resultMessageDie('OK');

        } else resultMessageDie('Parameters mismatch. Please refresh the page and try again');
    }

    public function startRegister($params)
    {
        $secret = Auth::generatePassword(30);
        $_SESSION['register_secret'] = $secret;
        echo json_encode(array('message' => 'ok', 'secret' => $secret));
    }

    public function doRegister($params)
    {
        if (isset($_SESSION['register_secret']) && isset($_POST['secret']) && $_SESSION['register_secret'] == $_POST['secret'] && isset($_POST['email']))
        {
            if (!isset($_POST['captcha']) || md5($_POST['captcha']) != $_SESSION['captcha_register'])
                resultMessageDie('Please enter the captcha more careful');

            $email = $_POST['email'];

            if (!check_email_address($email))
                resultMessageDie('email '.$email.' is not valid');
            if (!strlen($email))
                resultMessageDie('email can not be empty');

            if (!isset($_POST['password1']) || !isset($_POST['password2']))
                resultMessageDie('password can not be empty');
            if ($_POST['password1'] != $_POST['password2'])
                resultMessageDie('password confirm error');
            $password = $_POST['password1'];
            if (!strlen($password))
                resultMessageDie('password can not be empty');

            $firstName = $_POST['firstname'];
            $lastName = $_POST['lastname'];

            $displayname = $_POST['displayname'];
            if (!strlen($displayname))
            {
                $displayname = strlen($firstName) ? $firstName.(strlen($lastName) ? ' '.$lastName : '') : $lastName;
                if (!strlen($displayname))
                    resultMessageDie('please enter the name');
            }

            if ($result_str = db_connect())
                resultMessageDie($result_str);

            $query = db_query(query_params('SELECT COUNT(*) FROM user WHERE UPPER(TRIM(email)) = UPPER(TRIM(:email))', array('email' => $email)));
            if (!$query)
                resultMessageDie(db_error().' Please contact system administrator');

            $row = db_fetch_array($query);
            if (!$row)
                resultMessageDie('Email checking unexpected result. Please contact system administrator');

            if ($row[0])
                resultMessageDie('This email is already registered!');

            $query_text = 
                query_params
                (
                    'INSERT INTO user(photoURL, displayName, firstName, lastName, email, password)'.
                    'VALUES(:photoURL, :displayName, :firstName, :lastName, :email, md5(:password))',
                    array
                    (
                        'photoURL' => $_POST['photourl'],
                        'displayName' => $displayname,
                        'firstName' => $firstName,
                        'lastName' => $lastName,
                        'email' => $email,
                        'password' => $password
                    )
                );
            $query = db_query($query_text);
            if (!$query)
                resultMessageDie(db_error().' Please contact system administrator');

            $result_str = startEmailConfirmation($email);
            if ($result_str)
            {
                db_query(query_params('Delete From user WHERE UPPER(TRIM(email)) = UPPER(TRIM(:email))', array('email' => $email)));
                resultMessageDie($result_str);
            }

            resultMessageDie('OK');

        } else resultMessageDie('Parameters mismatch. Please refresh the page and try again');
    }

    public function startEditProfile($params)
    {
        if ($result_str = db_connect())
            resultMessageDie($result_str);

        $query = db_query(query_params('SELECT * FROM user WHERE id=:id', array('id' => $_SESSION["CustomerId"])));
        if (!$query)
            resultMessageDie(db_error().' Please contact system administrator');

        $row = db_fetch_assoc($query);
        if (!$row)
            resultMessageDie('Session is incorrect. Please relogin and try again');

        $secret = Auth::generatePassword(30);
        $_SESSION['edit_profile_secret'] = $secret;
        return [
            'Secret' => $secret,
            'PhotoURL' => $row['photoURL'],
            'DisplayName' => $row['displayName'],
            'FirstName' => $row['firstName'],
            'LastName' => $row['lastName'],
            'Email' => $row['email']
        ];
    }

    public function doEditProfile($params)
    {
        if (isset($_SESSION['edit_profile_secret']) && isset($_POST['secret']) && $_SESSION['edit_profile_secret'] == $_POST['secret'])
        {
            if (!isset($_POST['captcha']) || md5($_POST['captcha']) != $_SESSION['captcha_profile'])
                resultMessageDie('Please enter the captcha more careful');

            if ((!isset($_POST['password1']) || !strlen($_POST['password1'])) &&
                (!isset($_POST['password2']) || !strlen($_POST['password2'])))
                $password = null;
            else
            {
                if ($_POST['password1'] != $_POST['password2'])
                    resultMessageDie('password confirm error');
                $password = $_POST['password1'];
            }

            $firstName = $_POST['firstname'];
            $lastName = $_POST['lastname'];

            $displayname = $_POST['displayname'];
            if (!strlen($displayname))
            {
                $displayname = strlen($firstName) ? $firstName.(strlen($lastName) ? ' '.$lastName : '') : $lastName;
                if (!strlen($displayname))
                    resultMessageDie('please enter the name');
            }

            if ($result_str = db_connect())
                resultMessageDie($result_str);

            $query = db_query(query_params
            (
                'Update user Set photoURL = :photoURL, displayName = :displayName, firstName = :firstName, lastName = :lastName, password = IFNULL(:password, password) WHERE id = :id',
                    array
                    (
                        'photoURL' => $_POST['photourl'],
                        'displayName' => $displayname,
                        'firstName' => $firstName,
                        'lastName' => $lastName,
                        'password' => $password,
                        'id' => $_SESSION["CustomerId"]
                    )
            ));
            if (!$query)
                resultMessageDie(db_error().' Please contact system administrator');

            resultMessageDie('OK');

        } else resultMessageDie('Parameters mismatch. Please refresh the page and try again '.$_SESSION['edit_profile_secret'].' '.$_POST['secret']);
    }
}

?>