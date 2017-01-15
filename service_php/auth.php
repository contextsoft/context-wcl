<?php

class Auth implements IAdapter
{
    public static function getAllowedMethods() { 
        return [
            'getAuthProviders',
            'login', 'loginSocial', 'logout',
            'generateRegistrationCaptcha', 'register',
            'sendRegistrationConfirmationCode', 'confirmRegistrationCode',
            'sendPasswordResetCode', 'isPasswordResetCodeSent', 'resetPassword',
            'getUserProfile', 'saveUserProfile',
            'getSessionUser',
            'generateCaptcha'
        ];
    }

    /** Generates password */
    public static function generateCode($word_length = 6, $allowed_chars = '1234567890')
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
            Application::raise('Auth not configured', 0);
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
     */
    public function login($params)
    {
        if (empty($params['email']) || empty($params['password'])) {
            Application::raise('Please enter email and password');
        }
            
        $user = DbObject::fetchSQL(
            "SELECT id, photo_url, display_name, first_name, last_name, email_confirmed, active FROM user u 
              WHERE UPPER(TRIM(u.email)) = UPPER(TRIM(?)) AND u.password = MD5(?)",
            [$params['email'], $params['password']]);

        if (!count($user)) {
            Application::raise('Email or password is incorrect. Please try again');
        }

        $user = $user[0];

        if (!$user['active']) {
            Application::raise('Account is disabled, please contact support for details ', -1);
        }

        if (!$user['email_confirmed']) {
            Application::raise('Registration is not completed. Please check your inbox for confirmation email', -2);
        }

        $this->setUser($user['id'], $user['first_name'], $user['last_name'], $user['display_name'], $user['photo_url']);
        return $this->getSessionUser();
    }

    protected function getUser($email, $id = null) {
        if(isset($id)) {
            $user = DbObject::fetchSQL(
                "SELECT id, photo_url, display_name, first_name, last_name, email_confirmed, active FROM user u 
                    WHERE id = ?",
                [$id]);
        } else {
            $user = DbObject::fetchSQL(
                "SELECT id, photo_url, display_name, first_name, last_name, email_confirmed, active FROM user u 
                    WHERE UPPER(TRIM(u.email)) = UPPER(TRIM(?))",
                [$email]);
        }
        return $user;
    }

    /** Logins user via social network
     * params: [provider]
     */
    public function loginSocial($params)
    {
        if (!class_exists('Libs')) {
            throw new Exception('External libs not configured.');
        }
        
        // the selected provider
        $providerName = $params["provider"];
        try {
            // inlcude HybridAuth library
            Libs::requireOnce(Libs::$hybridAuth . '/Auth.php');
            if ($providerName === 'Facebook')
                Libs::requireOnce(Libs::$hybridAuth . '/thirdparty/Facebook/autoload.php');
    
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
            "SELECT id_user FROM user_provider WHERE provider = :provider AND provider_user_id = :provider_user_id",
            ['provider' => $providerName, 'provider_user_id' => $userProfile->identifier]);

        // if the used didn't authenticated using the selected provider before
        // we create a new entry on users for him
        if (!count($user)) {
            $user = $this->getUser($userProfile->email);
            
            if (!count($user)) {
                $id = $this->generateUserId();
                DbObject::execSql(
                    "INSERT INTO user(id, email, first_name, last_name, display_name, photo_url, email_confirmed)
                        VALUES(:id, :email, :first_name, :last_name, :display_name, :photo_url, 1)",
                    [
                        'id' => $id,
                        'email' => $userProfile->email,
                        'first_name' => $userProfile->firstName,
                        'last_name' => $userProfile->lastName,
                        'display_name' => $userProfile->displayName,
                        'photo_url' =>$userProfile->photoURL
                    ]);
                $user = $this->getUser($userProfile->email, $id);
            }

            $user = $user[0];

            $id = $this->generateUserProviderId();
            DbObject::execSql(
                "INSERT INTO user_provider(id, id_user, provider, provider_user_id)
                    VALUES(:id, :id_user, :provider, :provider_user_id)",
                [
                    'id' => $id,
                    'id_user' => $user['id'],
                    'provider' => $providerName,
                    'provider_user_id' => $userProfile->identifier
                ]);                        
        }
        else {
            $user = $this->getUser(null, $user[0]['id_user']); 
            $user = $user[0];
        }

        if (!$user['active']) {
            Application::raise('Account is disabled, please contact support for details ', 2);
        }

        $this->setUser($user['id'], $user['first_name'], $user['last_name'], $user['display_name'], $user['photo_url'], 1);
        return $this->getSessionUser();
    }

    /** Log out current user */
    public function logout($params)
    {
        UserSession::SetValue("user_id", '');
    }

    /** Confirms user registration
     * params: [email, code]
     */
    public function confirmRegistrationCode($params)
    {
        if (empty($params['email']) || empty($params['code'])) {
            Application::raise('Please enter email and confirmation code');
        }
        
        $user = DbObject::fetchSql(
            "SELECT id, photo_url, display_name, first_name, last_name FROM user u WHERE UPPER(TRIM(u.email)) = UPPER(TRIM(?)) AND u.email_confirmation_key = ?",
            [$params['email'], $params['code']]);

        if (!count($user)) {
            Application::raise('Confirmation code is invalid');
        }

        $user = $user[0];

        DbObject::execSql(
            "UPDATE user SET email_confirmed = 1, email_confirmation_key = NULL WHERE id = ?",
            [$user['id']]);

        $this->setUser($user['id'],$user['first_name'], $user['last_name'], $user['display_name'], $user['photo_url']);
        return $this->getSessionUser();
    }

    /** Sends via email registration confirmation code 
     * params: [email]
     */
    public function sendRegistrationConfirmationCode($params)
    {
        $user = DbObject::fetchSql(
            "SELECT id, first_name, last_name, display_name, email_confirmed FROM user WHERE UPPER(TRIM(email)) = UPPER(TRIM(?))",
            [$params['email']]);

        if (!count($user)) {
            Application::raise('User not found. Please correct and try again');
        }

        $user = $user[0];

        $id = $user['id'];
        $display_name = $user['display_name'];
        if(empty($display_name)) {
            $display_name = $user['first_name'] . ' ' . $user['last_name']; 
        }
        $email_confirmation_key = Auth::generateCode();

        DbObject::execSql(
            "UPDATE user SET email_confirmed = :email_confirmed, email_confirmation_key = :email_confirmation_key WHERE id = :id",
            ['id' => $id, 'email_confirmed' => 0, 'email_confirmation_key' => $email_confirmation_key]);

        Mailer::sendMail($params['email'], $display_name, 'Registration Confirmation', $this->getRegistrationCodeEmailContent($email_confirmation_key));
    }

    /** Sends password reset email.
     * params: [email]
     */
    public function sendPasswordResetCode($params)
    {
        if (empty($params['email'])) {
            Application::raise('Please enter email');
        }
        $email = strtolower($params['email']);

        $user = DbObject::fetchSql(
            "SELECT id, display_name FROM user WHERE LOWER(TRIM(email)) = LOWER(TRIM(?)) and password is not null",
            [$email]);

        if (!count($user)) {
            return;
        }

        $user = $user[0];
        $password_reset_key = Auth::generateCode();

        DbObject::execSql(
            "UPDATE user SET password_reset_key = :password_reset_key WHERE id = :id",
            ['id' => $user['id'], 'password_reset_key' => $password_reset_key]);

        //Mailer::sendMail($email, $user['display_name'], 'Password Reset Request', $this->getPasswordResetEmailContent(md5($email . '-' . $user['id'] . '-' . $password_reset_key)));
        Mailer::sendMail($email, $user['display_name'], 'Password Reset Request', $this->getPasswordResetEmailContent($password_reset_key));
    }

    /** Returns true if password reset code sent to user
     * params: [email]
     */
    public function isPasswordResetCodeSent($params)
    {
        if (empty($params['email'])) {
            Application::raise('Please enter email');
        }
        $user = DbObject::fetchSql(
            "SELECT password_reset_key 
               FROM user 
              WHERE email = ?",
            [$params['email']]);
        if(!count($user))
            return ['sent' => false];
        else 
            return ['sent' => !empty($user[0]['password_reset_key'])];
    }

    /** Changes password and logins user.
     * params: [email, password - new password, password_confirm - new password confirm, code - from confirmation email]
     */
    public function resetPassword($params)
    {
        if (empty($params['email'])) {
            Application::raise('Please email');
        }

        if (empty($params['code'])) {
            Application::raise('Please enter code sent to you by email');
        }

        if (empty($params['password']) || empty($params['password_confirm'])) {
            Application::raise('Please enter new password');
        }

        if ($params['password'] != $params['password_confirm']) {
            Application::raise('Passwords do not match');
        }
        
        $newPwd = $params['password'];
        if (!empty($validate = Auth::validatePassword($newPwd))) {
            Application::raise($validate);
        }

        /*
        $user = DbObject::fetchSql(
            "SELECT id, photo_url, display_name, first_name, last_name
               FROM user u 
              WHERE MD5(CONCAT(LOWER(u.email), '-', u.id, '-', u.password_reset_key)) = ?",
            [$params['code']]);
        */

        $user = DbObject::fetchSql(
            "SELECT id, photo_url, display_name, first_name, last_name
               FROM user u 
              WHERE email = ? AND password_reset_key = ?",
            [$params['email'], $params['code']]);

        if (!count($user)) {
            Application::raise('Code is incorrect. Please request password change again');
        }

        $user = $user[0];

        DbObject::execSql(
            "UPDATE user u SET password = md5(:password), password_reset_key = null WHERE id = :id",
            ['password' => $newPwd, 'id' => $user['id']]);

        $this->setUser($user['id'], $user['first_name'], $user['last_name'], $user['display_name'], $user['photo_url']);
        return $this->getSessionUser();
    }

    /** Registers user
     * params: [email, first_name, last_name, display_name, photo_url, password, password_confirm, captcha]
     */
    public function register($params)
    {
        if (empty($params['email'])) {
            Application::raise('Please enter email');
        }
        if (!Mailer::validateEmail($params['email'])) {
            Application::raise('Email is invalid');
        }
        if (empty($params['first_name']) || empty($params['last_name'])) {
            Application::raise('Please enter your name');
        }
        if (empty($params['password']) || empty($params['password_confirm'])) {
            Application::raise('Please enter password');
        }
        if ($params['password'] != $params['password_confirm']) {
            Application::raise('Passwords do not match');
        }
        if (!empty($validate = Auth::validatePassword($params['password']))) {
            Application::raise($validate);
        }
        if (empty($params['captcha']) || md5(strtoupper($params['captcha'])) != UserSession::GetValue('captcha_register')) {
            Application::raise('Please enter the captcha more careful');
        }

        $exists = DbObject::fetchSql(
            "SELECT COUNT(*) as cnt FROM user WHERE UPPER(TRIM(email)) = UPPER(TRIM(?))",
            [$params['email']]);
        if (count($exists) && $exists[0]['cnt']) {
            Application::raise("Such user already registered");
        }

        DbObject::execSql(
            "INSERT INTO user(id, email, first_name, last_name, display_name, photo_url, password, email_confirmed)
                 VALUES(:id, TRIM(LOWER(:email)), TRIM(:first_name), TRIM(:last_name), TRIM(:display_name), TRIM(:photo_url), md5(TRIM(:password)), 0)",
            [
                'id' => $this->generateUserId(),
                'email' => $params['email'],
                'first_name' => $params['first_name'],
                'last_name' => $params['last_name'],
                'display_name' => isset($params['display_name']) ? $params['display_name'] : '',
                'photo_url' => isset($params['photo_url']) ? $params['photo_url'] : '',
                'password' => $params['password']
            ]);
    }

    /** Returns user profile for modifying */
    public function getUserProfile($params)
    {
        $user = DbObject::fetchSql(
            "SELECT * FROM user WHERE id=?",
            [UserSession::getValue("user_id")]);
        $user = $user[0];

        return [
            'email' => $user['email'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name'],
            'display_name' => $user['display_name'],
            'photo_url' => $user['photo_url']
        ];
    }

    /** Saves user profile
     * params: [email, first_name, last_name, display_name, photo_url, old_password, new_password, password_confirm]
     */
    public function saveUserProfile($params)
    {
        if (empty($params['email'])) {
            Application::raise('Please enter your email');
        }
        if (!Mailer::validateEmail($params['email'])) {
            Application::raise('Email is invalid');
        }
        
        if (empty($params['first_name']) || empty($params['last_name'])) {
            Application::raise('Please enter your name');
        }

        $user = DbObject::fetchSql(
            "SELECT password FROM user WHERE id = ?",
            [UserSession::GetValue("user_id")]);
        

        if (!empty($params['new_password']) || !empty($params['password_confirm'])) {
            if ($params['new_password'] != $params['password_confirm']) {
                Application::raise('Passwords do not match');
            }
            else if (!empty($user[0]['password']) && md5($params['old_password']) != $user[0]['password']) {
                Application::raise('Password is incorrect');
            } else {
                $newPwd = $params['new_password'];
            }
        }

        if(isset($newPwd)) {
            $validate = Auth::validatePassword($newPwd);
            if (!empty($validate)) {
                Application::raise($validate);
            }
        }

        DbObject::execSql(
            "UPDATE user SET email = :email, photo_url = :photo_url, display_name = :display_name, first_name = :first_name, last_name = :last_name WHERE id = :id",
            [
                'email' => $params['email'],
                'photo_url' => $params['photo_url'],
                'display_name' => $params['display_name'],
                'first_name' => $params['first_name'],
                'last_name' => $params['last_name'],
                'id' => UserSession::getValue("user_id")
            ]
        );

        if (isset($newPwd)) {
            DbObject::execSql(
                "UPDATE user SET password = md5(:password) WHERE id = :id",
                [
                    'id' => UserSession::getValue("user_id"),
                    'password' => $newPwd,
                ]);
        }

         $this->setUser(UserSession::GetValue("user_id"), $params['first_name'], $params['last_name'], $params['display_name'], $params['photo_url'], UserSession::GetValue("user_social"));
    }

    /** Generates captcha image
     * params: [captchaName]
     */
    public function generateCaptcha($params)
    {
        $text_length = 6;
        $font_size = 22;
        $text_x_shift = 2;
        $text_angle_shift = 15;
        $text_y_shift = 3;
        $font_name = Utils::scriptDir() . '/fonts/times.ttf';
        $garbage_lines_count = 5;

        $text = Auth::generateCode($text_length, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
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
    public function generateRegistrationCaptcha()
    {
        return $this->generateCaptcha(['captchaName' => 'register']);
    }

    protected function setUser($id, $first_name, $last_name, $display_name, $photo_url, $social = 0)
    {
        UserSession::SetValue("user_id", $id);
        UserSession::SetValue("user_first_name", $first_name);
        UserSession::SetValue("user_last_name", $last_name);
        if(empty($display_name))
            $display_name = "$first_name $last_name";
        UserSession::SetValue("user_display_name", $display_name);
        UserSession::SetValue("user_photo_url", $photo_url);
        UserSession::SetValue("user_social", $social);
    }

    public static function getSessionUser()
    {
        if (!empty(UserSession::GetValue("user_id"))) {
            return [
                'user_id' => UserSession::GetValue("user_id"),
                'user_first_name' => UserSession::GetValue("user_first_name"),
                'user_last_name' => UserSession::GetValue("user_last_name"),
                'user_display_name' => UserSession::GetValue("user_display_name"),
                'user_photo_url' => UserSession::GetValue("user_photo_url"),
                'user_social' => UserSession::GetValue("user_social") 
            ];
        }
    }

    public static function validatePassword($password)
    {
        if (strlen($password) < 6) {
            return 'Password lenght must be equal or greater than 6 characters.';
        }
    }

    protected function generateUserId() {
        return null;
    }

    protected function generateUserProviderId() {
        return null;
    }

    protected function getRegistrationCodeEmailContent($code) {
        return
            "<html>".
            "Thank you for registration.<br><br>".
            "Your confirmation code is <b>$code</b><br><br>".
            "Please use it confirm your registration on login page.".
            "</html>";
    }

    protected function getPasswordResetEmailContent($code) {
        return
            "<html>".
            "You requested password reset code.<br><br>".
            "Your code is <b>$code</b><br><br>".
            "Please use it to confirm your new password on password reset page.".
            "</html>";
        
    }
}
