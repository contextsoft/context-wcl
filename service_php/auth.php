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

    /** Generates Password */
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
      * params: [Email, Password]
    **/
    public function login($params)
    {
        if (empty($params['Email']) || empty($params['Password'])) {
            Application::raise('Please enter Email and Password.');
        }
            
        $user = DbObject::fetchSQL(
            "SELECT Id, Photo_Url, Display_Name, First_Name, Last_Name, Email_Confirmed FROM user u 
              WHERE UPPER(TRIM(u.Email)) = UPPER(TRIM(?)) AND u.Password = MD5(?)",
            [$params['Email'], $params['Password']]);

        if (!count($user)) {
            Application::raise('Email or Password is incorrect. Please try again');
        }

        $user = $user[0];

        if ($user['Email_Confirmed'] != 'T') {
            Application::raise('Registration is not completed. Please check your inbox for confirmation Email.');
        }

        $this->setUser($user['Id'], $user['First_Name'], $user['Last_Name'], $user['Display_Name'], $user['Photo_URL']);
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
                "INSERT INTO user(Email, First_Name, Last_Name, Display_Name, Photo_Url, Email_Confirmed)
                    VALUES(:Email, :First_Name, :Last_Name, :Photo_Url, 'T')",
                [
                    'Email' => $userProfile->Email,
                    'First_Name' => $userProfile->First_Name,
                    'Last_Name' => $userProfile->Last_Name,
                    'Photo_Url' =>$userProfile->Photo_URL
                ]);

            $user = DbObject::fetchSQL(
                "SELECT Id, Photo_URL, Display_Name, First_Name, Last_Name FROM user u 
                  WHERE UPPER(TRIM(u.Email)) = UPPER(TRIM(?))",
                [$userProfile->Email]);

            if (!count($user))
                Application::raise('User registration failed.');
            $user = $user[0];

            DbObject::execSql(
                "INSERT INTO user_provider(userid, provider, provider_userid)
                    VALUES(:userid, :provider, :provider_userid)",
                [
                    'userid' => $user->Id,
                    'provider' => $providerName,
                    'provider_userid' => $user_profile->identifier
                ]);                        
        }
        else {
            $user = DbObject::fetchSQL(
                "SELECT Id, Photo_URL, Display_Name, First_Name, Last_Name FROM user u 
                  WHERE Id = ?",
                [$user[0]->Id]);

            if (!count($user))
                Application::raise('Login via social network failed.');
            $user = $user[0];
        }

        $this->setUser($user['Id'], $user['First_Name'], $user['Last_Name'], $user['Display_Name'], $user['Photo_URL']);
    }

    /** Confirms user registration
      * params: [Email, code]
    **/
    public function confirmRegistrationCode($params)
    {
        if (empty($params['Email']) || empty($params['code'])) {
            Application::raise('Please enter Email and confirmation code.');
        }
        
        $user = DbObject::fetchSql(
            "SELECT Id, Photo_URL, Display_Name, First_Name, Last_Name FROM user u WHERE UPPER(TRIM(u.Email)) = UPPER(TRIM(?)) AND u.Email_Confirmation_Key = ?",
            [params['Email'], params['code']]);

        if (!count($user)) {
            Application::raise('Confirmation code is invalid.');
        }

        $user = $user[0];

        DbObject.execSql(
            "UPDATE user SET Email_Confirmed = 'T', Email_Confirmation_Key = NULL WHERE Id = ?",
            [$user['Id']]);

        $this->setUser($user['Id'], $user['Photo_URL'], $user['First_Name'], $user['Last_Name'], $user['Display_Name']);
        return $this->getUser();
    }

    /** Sends via Email registration confirmation code 
      * params: [Email]
    **/
    public function sendRegistrationConfirmationCode($params)
    {
        $user = DbObject::fetchSql(
            "SELECT Id, First_Name, Last_Name, Display_Name, Email_Confirmed FROM user WHERE UPPER(TRIM(Email)) = UPPER(TRIM(?))",
            [$params['Email']]);

        if (!count($user)) {
            Application::raise('User not found. Please correct and try again.');
        }

        $user = $user[0];

        $Id = $user['Id'];
        $Display_Name = $user['Display_Name'];
        if(empty($Display_Name)) {
            $Display_Name = $user['First_Name'] . ' ' . $user['Last_Name']; 
        }
        $Email_Confirmation_Key = Auth::generateSecret(5);

        DbObject::execSql(
            "UPDATE user SET Email_Confirmed = :Email_Confirmed, Email_Confirmation_Key = :Email_Confirmation_Key WHERE Id = :Id",
            ['Id' => $Id, 'Email_Confirmed' => 'F', 'Email_Confirmation_Key' => $Email_Confirmation_Key]);

        Mailer::sendMail($params['Email'], $Display_Name, 'Registration Confirmation',
            "Thank you for register'.\n".
            "Email confirmation key is $Email_Confirmation_Key. Please use it for confirm.");
    }

    /** Sends Password reset Email.
      * params: [Email]
    **/
    public function sendPasswordResetCode($params)
    {
        if (empty($params['Email'])) {
            Application::raise('Please enter Email.');
        }
        $Email = strtolower($params['Email']);

        $user = DbObject::fetchSql(
            "SELECT Id, Display_Name FROM user WHERE LOWER(TRIM(Email)) = LOWER(TRIM(?))",
            [$Email]);

        if (!count($user)) {
            return;
        }

        $user = $user[0];
        $Password_Reset_Key = Auth::generateSecret();

        DbObject::execSql(
            "UPDATE user SET Password_Reset_Key = :Password_Reset_Key WHERE Id = :Id)",
            ['Id' => $user['Id'], 'Password_Reset_Key' => $Password_Reset_Key]);

        Mailer::sendMail($Email, $user['Display_Name'], 'Password reset request',
            "To reset your Password please use the code: ".md5($Email . '-' . $user['Id'] . '-' . $Password_Reset_Key));
    }

    /** Changes Password and logins user.
      * params: [Password1 - old, Password2 - new, code - from confirmation Email]
    **/
    public function confirmPasswordReset($params)
    {
        if (empty($params['Password1']) || empty($_POST['Password2'])) {
            Application::raise('Password can not be empty.');
        }
        if ($params['Password1'] != $params['Password2']) {
            Application::raise('Passwords do not match.');
        }
        $newPwd = $params['Password2'];
        if (!empty($validate = Auth::validatePassword($newPwd))) {
            Application::raise($validate);
        }

        $user = DbObject::fetchSql(
            "SELECT u.Id, u.Photo_URL, u.Display_Name, u.First_Name, u.Last_Name 
               FROM user u 
              WHERE MD5(CONCAT(LOWER(u.Email), '-', u.Id, '-', u.Password_Reset_Key)) = ?",
            [params['code']]);

        if (!count($user)) {
            Application::raise('Code is incorrect. Please request Password change again.');
        }

        $user = $user[0];

        DbObject::execSql(
            "UPDATE user u SET Password = md5(:Password), Password_Reset_Key = null WHERE Id = :Id",
            ['Password' => $newPwd, 'Id' => $user['Id']]);

        $this->setUser($user['Id'], $user['First_Name'], $user['Last_Name'], $user['Display_Name'], $user['Photo_URL']);
        return $this->getUser();
    }

    /** Registers user
      * params: [Email, First_Name, Last_Name, Display_Name, Photo_URL, Password1, Password2, captcha]
    **/
    public function register($params)
    {
        if (empty($params['Email'])) {
            Application::raise('Please enter Email.');
        }
        if (!Mailer::validateEmail($params['Email'])) {
            Application::raise('Email is invalid.');
        }
        if (empty($params['First_Name']) || empty($params['Last_Name'])) {
            Application::raise('Please enter your name.');
        }
        if (empty($params['Password1']) || empty($params['Password2'])) {
            Application::raise('Please enter Password.');
        }
        if ($params['Password1'] != $params['Password2']) {
            Application::raise('Passwords do not match.');
        }
        if (!empty($validate = Auth::validatePassword($params['Password1']))) {
            Application::raise($validate);
        }
        if (empty($params['captcha']) || md5(strtoupper($params['captcha'])) != UserSession::GetValue('captcha_register')) {
            Application::raise('Please enter the captcha more careful.');
        }

        $exists = DbObject::fetchSql(
            "SELECT COUNT(*) as cnt FROM user WHERE UPPER(TRIM(Email)) = UPPER(TRIM(?))",
            [$params['Email']]);
        if (count($exists) && $exists[0]['cnt']) {
            Application::raise("Such user already registered.");
        }

        DbObject::execSql(
            "INSERT INTO user(Email, First_Name, Last_Name, Display_Name, Photo_URL, Password, Email_Confirmed)
                 VALUES(TRIM(LOWER(:Email)), TRIM(:First_Name), TRIM(:Last_Name), TRIM(:Display_Name), TRIM(:Photo_URL), md5(TRIM(:Password)), 'F')",
            [
                'Email' => $params['Email'],
                'First_Name' => $params['First_Name'],
                'Last_Name' => $params['Last_Name'],
                'Display_Name' => isset($params['Display_Name']) ? $params['Display_Name'] : '',
                'Photo_URL' => isset($params['Photo_URL']) ? $params['Photo_URL'] : '',
                'Password' => $params['Password1']
            ]);
    }

    /** Returns user profile for modifying */
    public function getUserProfile($params)
    {
        $user = DbObject::fetchSql(
            "SELECT * FROM user WHERE Id=?",
            [UserSession::getValue("userId")]);
        $user = $user[0];

        return [
            'First_Name' => $user['First_Name'],
            'Last_Name' => $user['Last_Name'],
            'Display_Name' => $user['Display_Name'],
            'Photo_URL' => $user['Photo_URL']
        ];
    }

    /** Saves user profile
      * params: [First_Name, Last_Name, Display_Name, Photo_URL, Password1 - old, Password2 - new, Password3 - new confirm]
    **/
    public function saveUserProfile($params)
    {
        if (empty($params['First_Name']) || empty($params['Last_Name'])) {
            Application::raise('Please enter your name.');
        }

        $user = DbObject::fetchSql(
            "SELECT Password FROM users WHERE Id = ?",
            [UserSession::GetValue("userId")]);
        
        if (empty($params['Password1']) || empty($params['Password2']) || empty($params['Password3'])) {
            Application::raise('Please enter old and new Passwords.');
        }

        if (md5($params['Password1']) != $user[0]['Password'] || $params['Password2'] != $params['Password3']) {
            Application::raise('Passwords do not match.');
        }

        $validate = Auth::validatePassword($Password2);
        if (!empty($validate)) {
            Application::raise($validate);
        }

        DbObject::exesSql(
            "UPDATE user SET Photo_URL = :Photo_URL, Display_Name = :Display_Name, First_Name = :First_Name, Last_Name = :Last_Name WHERE Id = :Id",
            [
                'Photo_URL' => $params['Photo_URL'],
                'Display_Name' => $params['Display_Name'],
                'First_Name' => $params['First_Name'],
                'Last_Name' => $params['Last_Name'],
                'Id' => UserSession::getValue("userId")
            ]
        );

        if (!empty($params['Password2'])) {
            DbObject::exesSql(
                "UPDATE user SET Password = md5(:Password) WHERE Id = :Id",
                [
                    'Id' => UserSession::getValue("userId"),
                    'Password' => $params['Password2'],
                    
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

    protected function setUser($Id, $First_Name, $Last_Name, $Display_Name, $Photo_URL)
    {
        UserSession::SetValue("userId", $Id);
        if(empty($Display_Name))
            $Display_Name = "$First_Name $Last_Name";
        UserSession::SetValue("userDisplay_Name", $Display_Name);
        UserSession::SetValue("userPhoto_URL", $Photo_URL);
    }

    public static function getUser()
    {
        if (!empty(UserSession::GetValue("userId"))) {
            return [
                'userId' => UserSession::GetValue("userId"),
                'userDisplay_Name' => UserSession::GetValue("userDisplay_Name"),
                'userPhoto_URL' => UserSession::GetValue("userPhoto_URL")
            ];
        }
    }

    public static function validatePassword($Password)
    {
        if (strlen($Password) < 6) {
            return 'Password lenght must be equal or greater than 6 characters.';
        }
    }
}
