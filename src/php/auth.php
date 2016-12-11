<?php

class Auth extends Adapter
{
    public static $allowedMethods = [
        'getAuthProviders',
        'login', 'loginSocial',
        'generateRegisterCaptcha', 'register',
        'sendRegistrationConfirmationCode', 'confirmRegistrationCode',
        'sendPasswordResetCode', 'confirmPasswordReset',
        'getUserProfile', 'saveUserProfile',
        'getUser',
        'generateCaptcha'
    ];

    /** Generates password */
    public static function generateSecret($word_length = 10, $allowed_chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890')
    {
        $str = array();
        for ($i = 0; $i < $word_length; $i++) {
            $str[] = substr($allowed_chars, rand(1, strlen($allowed_chars)) - 1, 1);
        }
        shuffle($str);
        return implode("", $str);
    }

    /** Returns enabled hybridauth providers */
    public function getAuthProviders()
    {
        if (!class_exists('AuthConfig')) {
            Application::raise('Auth not configured.');
        }
        $providers_enabled = [];
        foreach (AuthConfig::$hybridAuthConfig['providers'] as $provider => $provider_options) {
            if (isset($provider_options['enabled']) && $provider_options['enabled']) {
                $providers_enabled[] = $provider;
            }
        }
        return $providers_enabled;
    }

    /** Logins user
      * params: [email, password]
    **/
    public function login($params)
    {
        if (empty($params['email']) || empty($params['password'])) {
            Application::raise('Please enter Email and Password.');
        }
            
        $user = DbObject::fetchSQL(
            "SELECT id, photoURL, displayName, firstName, lastName, emailConfirmed FROM user u 
              WHERE UPPER(TRIM(u.email)) = UPPER(TRIM(?)) AND u.password = MD5(?)",
            [$params['email'], $params['password']]);

        if (!count($user)) {
            Application::raise('Email or password is incorrect. Please try again');
        }

        $user = $user[0];

        if ($user['emailConfirmed'] != 'T') {
            Application::raise('Registration is not completed. Please check your inbox for confirmation email.');
        }

        $this->setUser($user['id'], $user['firstName'], $user['lastName'], $user['displayName'], $user['photoURL']);
        return $this->getUser();
    }

    /** Logins user via social network
      * params: [provider]
    **/
    public function loginSocial($params)
    {
        if (!class_exists('Libs')) {
            throw new Exception('External libs not configured.');
        }
        
        // the selected provider
        $providerName = $params["provider"];
        try {
            // inlcude HybridAuth library
            Libs::checkPath(Libs::$hybridAuth);
            require_once(Libs::$hybridAuth.'/Auth.php') ;
    
            // initialize Hybrid_Auth class with the config file
            $hybridauth = new Hybrid_Auth(AuthConfig::$hybridAuthConfig);
    
            // try to authenticate with the selected provider
            $adapter = $hybridauth->authenticate($providerName);
    
            // then grab the user profile
            $userProfile = $adapter->getUserProfile();
        }
        // something went wrong?
        catch( Exception $e ) {
            throw $e; 
        }
    
        // check if the current user already have authenticated using this provider before
        $user = DbObject::fetchSql(
            "SELECT userid FROM user_provider WHERE provider = :provider AND provider_userid = :provider_userid",
            ['provider' => $providerName, 'provider_userid' => $userProfile->identifier]);

        // if the used didn't authenticate using the selected provider before
        // we create a new entry on database.users for him
        if (!count(user))  {
            DbObject::execSql(
                "INSERT INTO user(email, firstName, lastName, displayName, photoURL, emailConfirmed)
                    VALUES(:email, :firstName, :lastName, :photoURL, 'T')",
                [
                    'email' => $userProfile->email,
                    'firstName' => $userProfile->firstName,
                    'lastName' => $userProfile->lastName,
                    'photoURL' =>$userProfile->photoURL
                ]);

            $user = DbObject::fetchSQL(
                "SELECT id, photoURL, displayName, firstName, lastName FROM user u 
                  WHERE UPPER(TRIM(u.email)) = UPPER(TRIM(?))",
                [$userProfile->email]);

            if (!count($user))
                Application::raise('User registration failed.');
            $user = $user[0];

            DbObject::execSql(
                "INSERT INTO user_provider(userid, provider, provider_userid)
                    VALUES(:userid, :provider, :provider_userid)",
                [
                    'userid' => $user->id,
                    'provider' => $providerName,
                    'provider_userid' => $user_profile->identifier
                ]);                        
        }
        else {
            $user = DbObject::fetchSQL(
                "SELECT id, photoURL, displayName, firstName, lastName FROM user u 
                  WHERE id = ?",
                [$user[0]->id]);

            if (!count($user))
                Application::raise('Login via social network failed.');
            $user = $user[0];
        }

        $this->setUser($user['id'], $user['firstName'], $user['lastName'], $user['displayName'], $user['photoURL']);
    }

    /** Confirms user registration
      * params: [email, code]
    **/
    public function confirmRegistrationCode($params)
    {
        if (empty($params['email']) || empty($params['code'])) {
            Application::raise('Please enter email and confirmation code.');
        }
        
        $user = DbObject::fetchSql(
            "SELECT id, photoURL, displayName, firstName, lastName FROM user u WHERE UPPER(TRIM(u.email)) = UPPER(TRIM(?)) AND u.emailConfirmationKey = ?",
            [params['email'], params['code']]);

        if (!count($user)) {
            Application::raise('Confirmation code is invalid.');
        }

        $user = $user[0];

        DbObject.execSql(
            "UPDATE user SET emailConfirmed = 'T', emailConfirmationKey = NULL WHERE id = ?",
            [$user['id']]);

        $this->setUser($user['id'], $user['photoURL'], $user['firstName'], $user['lastName'], $user['displayName']);
        return $this->getUser();
    }

    /** Sends via email registration confirmation code 
      * params: [email]
    **/
    public function sendRegistrationConfirmationCode($params)
    {
        $user = DbObject::fetchSql(
            "SELECT id, firstName, lastName, displayName, emailConfirmed FROM user WHERE UPPER(TRIM(email)) = UPPER(TRIM(?))",
            [$params['email']]);

        if (!count($user)) {
            Application::raise('User not found. Please correct and try again.');
        }

        $user = $user[0];

        $id = $user['id'];
        $displayName = $user['displayName'];
        if(empty($displayName)) {
            $displayName = $user['firstName'] . ' ' . $user['lastName']; 
        }
        $emailConfirmationKey = Auth::generateSecret(5);

        DbObject::execSql(
            "UPDATE user SET emailConfirmed = :emailConfirmed, emailConfirmationKey = :emailConfirmationKey WHERE id = :id",
            ['id' => $id, 'emailConfirmed' => 'F', 'emailConfirmationKey' => $emailConfirmationKey]);

        Mailer::sendMail($params['email'], $displayName, 'Registration Confirmation',
            "Thank you for register'.\n".
            "Email confirmation key is $emailConfirmationKey. Please use it for confirm.");
    }

    /** Sends password reset email.
      * params: [email]
    **/
    public function sendPasswordResetCode($params)
    {
        if (empty($params['email'])) {
            Application::raise('Please enter Email.');
        }
        $email = strtolower($params['email']);

        $user = DbObject::fetchSql(
            "SELECT id, displayName FROM user WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))",
            [$email]);

        if (!count($user)) {
            return;
        }

        $user = $user[0];
        $passwordResetKey = Auth::generateSecret();

        DbObject::execSql(
            "UPDATE user SET passwordResetKey = :passwordResetKey WHERE id = :id)",
            ['id' => $user['id'], 'passwordResetKey' => $passwordResetKey]);

        Mailer::sendMail($email, $user['displayName'], 'Password reset request',
            "To reset your password please use the code: ".md5($email . '-' . $user['id'] . '-' . $passwordResetKey));
    }

    /** Changes password and logins user.
      * params: [password1 - old, password2 - new, code - from confirmation email]
    **/
    public function confirmPasswordReset($params)
    {
        if (empty($params['password1']) || empty($_POST['password2'])) {
            Application::raise('Password can not be empty.');
        }
        if ($params['password1'] != $params['password2']) {
            Application::raise('Passwords do not match.');
        }
        $newPwd = $params['password2'];
        if (!empty($validate = Auth::validatePassword($newPwd))) {
            Application::raise($validate);
        }

        $user = DbObject::fetchSql(
            "SELECT u.id, u.photoURL, u.displayName, u.firstName, u.lastName 
               FROM user u 
              WHERE MD5(CONCAT(LOWER(u.email), '-', u.id, '-', u.passwordResetKey)) = ?",
            [params['code']]);

        if (!count($user)) {
            Application::raise('Code is incorrect. Please request password change again.');
        }

        $user = $user[0];

        DbObject::execSql(
            "UPDATE user u SET password = md5(:password), passwordResetKey = null WHERE id = :id",
            ['password' => $newPwd, 'id' => $user['id']]);

        $this->setUser($user['id'], $user['firstName'], $user['lastName'], $user['displayName'], $user['photoURL']);
        return $this->getUser();
    }

    /** Registers user
      * params: [email, firstName, lastName, displayName, photoURL, password1, password2, captcha]
    **/
    public function register($params)
    {
        if (empty($params['email'])) {
            Application::raise('Please enter Email.');
        }
        if (!Mailer::validateEmail($params['email'])) {
            Application::raise('Email is invalid.');
        }
        if (empty($params['firstName']) || empty($params['lastName'])) {
            Application::raise('Please enter your name.');
        }
        if (empty($params['password1']) || empty($params['password2'])) {
            Application::raise('Please enter password.');
        }
        if ($params['password1'] != $params['password2']) {
            Application::raise('Passwords do not match.');
        }
        if (!empty($validate = Auth::validatePassword($params['password1']))) {
            Application::raise($validate);
        }
        if (empty($params['captcha']) || md5(strtoupper($params['captcha'])) != UserSession::GetValue('captcha_register')) {
            Application::raise('Please enter the captcha more careful.');
        }

        $exists = DbObject::fetchSql(
            "SELECT COUNT(*) as cnt FROM user WHERE UPPER(TRIM(email)) = UPPER(TRIM(?))",
            [$params['email']]);
        if (count($exists) && $exists[0]['cnt']) {
            Application::raise("Such user already registered.");
        }

        DbObject::execSql(
            "INSERT INTO user(email, firstName, lastName, displayName, photoURL, password, emailConfirmed)
                 VALUES(TRIM(LOWER(:email)), TRIM(:firstName), TRIM(:lastName), TRIM(:displayName), TRIM(:photoURL), md5(TRIM(:password)), 'F')",
            [
                'email' => $params['email'],
                'firstName' => $params['firstName'],
                'lastName' => $params['lastName'],
                'displayName' => isset($params['displayName']) ? $params['displayName'] : '',
                'photoURL' => isset($params['photoURL']) ? $params['photoURL'] : '',
                'password' => $params['password1']
            ]);
    }

    /** Returns user profile for modifying */
    public function getUserProfile($params)
    {
        $user = DbObject::fetchSql(
            "SELECT * FROM user WHERE id=?",
            [UserSession::getValue("userId")]);
        $user = $user[0];

        return [
            'firstName' => $user['firstName'],
            'lastName' => $user['lastName'],
            'displayName' => $user['displayName'],
            'photoURL' => $user['photoURL']
        ];
    }

    /** Saves user profile
      * params: [firstName, lastName, displayName, photoURL, password1 - old, password2 - new, password3 - new confirm]
    **/
    public function saveUserProfile($params)
    {
        if (empty($params['firstName']) || empty($params['lastName'])) {
            Application::raise('Please enter your name.');
        }

        $user = DbObject::fetchSql(
            "SELECT password FROM users WHERE id = ?",
            [UserSession::GetValue("userId")]);
        
        if (empty($params['password1']) || empty($params['password2']) || empty($params['password3'])) {
            Application::raise('Please enter old and new passwords.');
        }

        if (md5($params['password1']) != $user[0]['password'] || $params['password2'] != $params['password3']) {
            Application::raise('Passwords do not match.');
        }

        $validate = Auth::validatePassword($password2);
        if (!empty($validate)) {
            Application::raise($validate);
        }

        DbObject::exesSql(
            "UPDATE user SET photoURL = :photoURL, displayName = :displayName, firstName = :firstName, lastName = :lastName WHERE id = :id",
            [
                'photoURL' => $params['photoURL'],
                'displayName' => $params['displayName'],
                'firstName' => $params['firstName'],
                'lastName' => $params['lastName'],
                'id' => UserSession::getValue("userId")
            ]
        );

        if (!empty($params['password2'])) {
            DbObject::exesSql(
                "UPDATE user SET password = md5(:password) WHERE id = :id",
                [
                    'id' => UserSession::getValue("userId"),
                    'password' => $params['password2'],
                    
                ]);
        }
    }

    /** Generates captcha image
      * params: [captchaName]
    **/
    public function generateCaptcha($params)
    {
        $text_length = 7;
        $font_size = 22;
        $text_x_shift = 2;
        $text_angle_shift = 15;
        $text_y_shift = 3;
        $font_name = Utils::scriptDir() . '/fonts/times.ttf';
        $garbage_lines_count = 5;

        $text = Auth::generateSecret($text_length, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
        $captchaName = 'captcha';
        if (!empty($params['captchaName'])) {
            $captchaName .= '_' . $params['captchaName'];
        }
        UserSession::setValue($captchaName, md5($text));

        $text_left = 3 + $text_x_shift * 2;
        $text_bottom = $font_size + 3 + $text_y_shift * 2;

        $image_width = 6 + ($font_size + $text_x_shift) * $text_length;
        $image_height = 6 + ($font_size + $text_y_shift * 4);

        $image = imagecreatetruecolor($image_width, $image_height);

        $back_color = imagecolorallocate($image, 255, 255, 255);
        imagefill($image, 0, 0, $back_color);
        imagecolortransparent($image, $back_color);

        //$frame_color = imagecolorallocate($image, 255, 30, 55);
        //imagerectangle($image, 1, 1, $image_width - 2, $image_height - 2, $frame_color);

        // lines over the text
        for ($i=0; $i < $garbage_lines_count; $i++) {
            imageline(
                $image,
                rand(3, $image_width - 6),
                rand(3, $image_height - 6),
                rand(3, $image_width - 6),
                rand(3, $image_height - 6),
                imagecolorallocate($image, rand(0, 255), rand(0, 200), rand(0, 255)));
        }

        for ($i = 0; $i < strlen($text); $i++) {
            $out_text = substr($text, $i, 1);

            $text_angle = rand(0, $text_angle_shift) * (rand(0, 1) ? -1 : 1);

            $textcolor = imagecolorallocate($image, 0, 0, 255);
            //$textcolor = imagecolorallocate($image, rand(0, 255), rand(0, 200), rand(0, 255));

            imagettftext(
                $image,
                $font_size,
                $text_angle,
                $text_left + $text_x_shift * (rand(0, 1) ? -1 : 1), $text_bottom + $text_y_shift * (rand(0, 1) ? -1 : 1),
                $textcolor,
                $font_name,
                $out_text);
            $char_info = imagettfbbox ($font_size, $text_angle, $font_name, $out_text);
            $text_left += $char_info[2] + 3;
        }

        // lines under the text
        for ($i=0; $i < $garbage_lines_count * 2; $i++) {
            imageline(
                $image,
                rand(3, $image_width - 6),
                rand(3, $image_height - 6),
                rand(3, $image_width - 6),
                rand(3, $image_height - 6),
                imagecolorallocate($image, rand(0, 255), rand(0, 200), rand(0, 255)));
        }

        // getting image buffer
        ob_start(); //Stdout --> buffer
        imagepng($image, null); // output ...
        $imgString = ob_get_contents(); //store stdout in $imgString
        ob_end_clean(); //clear buffer
        imagedestroy($image); //destroy img
        
        return ['image' => base64_encode($imgString)];
    }

    /** Generates register captcha image */
    public function generateRegisterCaptcha()
    {
        return $this->generateCaptcha(['captchaName' => 'register']);
    }

    protected function setUser($id, $firstName, $lastName, $displayName, $photoURL)
    {
        UserSession::SetValue("userId", $id);
        if(empty($displayName))
            $displayName = "$firstName $lastName";
        UserSession::SetValue("userDisplayName", $displayName);
        UserSession::SetValue("userPhotoURL", $photoURL);
    }

    public static function getUser()
    {
        if (!empty(UserSession::GetValue("userId"))) {
            return [
                'userId' => UserSession::GetValue("userId"),
                'userDisplayName' => UserSession::GetValue("userDisplayName"),
                'userPhotoURL' => UserSession::GetValue("userPhotoURL")
            ];
        }
    }

    public static function validatePassword($password)
    {
        if (strlen($password) < 6) {
            return 'Password lenght must be equal or greater than 6 characters.';
        }
    }
}
