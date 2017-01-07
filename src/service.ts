/** Server communication protocols and routines */

// import { utils } from './Utils';
import { application } from './Application';
import { WaitScreen } from './std.controls';

export interface IResponse {
    data: any;
    raw?: string;
    code?: number;
    message?: string;
    stack?: string;
}

interface IOnData {
    (data: any): any;
}

export interface IService {
    url: string;
    hybridAuthUrl: string;
    user: User;
    authenticated: boolean;
    login(username?: string, password?: string): Promise<any>;
    logout();
    execute(className: string, methodName: string, params?: any, showError?: boolean): Promise<IResponse>;
    showError(response: IResponse);
}

export class Ajax {
    public static parseJSON(data: string) {
        let r;
        try {
            r = JSON.parse(data);
        }
        catch (e) {
            r = data;
        }
        return r;
    }

    public static send(url: string, callback: IOnData, method: string, data?, async = true) {
        let x = Ajax.getXHR();
        x.open(method, url, async);
        x.onreadystatechange = () => {
            if (x.readyState === 4) {
                callback(Ajax.parseJSON(x.responseText));
            }
        };
        if (method === 'POST') {
            x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        }
        x.send(data);
    }

    public static get(url: string, data, callback: IOnData, async = true) {
        let query = [];
        for (let key in data) {
            if (data.hasOwnProperty(key))
                query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
        Ajax.send(url + (query.length ? '?' + query.join('&') : ''), callback, 'GET', null, async);
    }

    public static post(url: string, data, callback: IOnData, async = true) {
        let query = [];
        for (let key in data) {
            if (data.hasOwnProperty(key))
                query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
        Ajax.send(url, callback, 'POST', query.join('&'), async);
    }

    protected static getXHR() {
        if (typeof XMLHttpRequest !== 'undefined') {
            return new XMLHttpRequest();
        }
    }
}

class User {
    public id: string;
    public photoUrl: string;
    public firstName: string;
    public lastName: string;
    public displayName: string;
    public socialUsed: boolean;
}

export class Service implements IService {
    protected _user = new User();

    public get user() {
        return this._user;
    }
    public url: string;
    public hybridAuthUrl: string;
    public authAdapter = 'Auth';

    get authenticated(): boolean {
        return this._authenticated;
    }
    protected _authenticated;

    protected loginFromResponse(response: IResponse) {
        this._user = new User();
        this._authenticated = response.data ? true : false;
        if (!this._authenticated)
            return;
        this._user.id = response.data.user_id;
        this._user.firstName = response.data.user_first_name;
        this._user.lastName = response.data.user_last_name;
        this._user.displayName = response.data.user_display_name;
        this._user.photoUrl = response.data.user_photo_url;
        this._user.socialUsed = response.data.user_social;
    }

    public login(email: string, password: string): Promise<IResponse> {
        return this.execute(this.authAdapter, 'login', { email, password }, false).then(
            (response) => {
                this.loginFromResponse(response);
                return response;
            });
    }

    public loginSocial(provider: string): Promise<any> {
        let popupWindow = window.open(
            this.hybridAuthUrl + '?provider=' + provider,
            'hybridAuth_Social_Sign_on',
            'location=0,status=0,scrollbars=0,width=768,height=500'
        );
        return new Promise((resolve, reject) => {
            let winTimer = setTimeout(() => {
                if (popupWindow.closed) {
                    clearInterval(winTimer);
                    resolve();
                }
                else
                    reject();
            }, 1000);
        });
    }

    public logout(): Promise<IResponse> {
        this._authenticated = false;
        this._user = new User();
        return this.execute(this.authAdapter, 'logout');
    }

    public register(email, firstName, lastName, password, passwordConfirm, captcha): Promise<IResponse> {
        let params = {
            email,
            first_name: firstName,
            last_name: lastName,
            password,
            password_confirm: passwordConfirm,
            captcha
        };
        return this.execute(this.authAdapter, 'register', params);
    }

    public sendRegistrationConfirmationCode(email): Promise<IResponse> {
        return this.execute(this.authAdapter, 'sendRegistrationConfirmationCode', { email });
    }

    public confirmRegistrationCode(email, code): Promise<IResponse> {
        return this.execute(this.authAdapter, 'confirmRegistrationCode', { email, code });
    }

    public generateRegistrationCaptcha(): Promise<IResponse> {
        return this.execute(this.authAdapter, 'generateRegistrationCaptcha');
    }

    public sendPasswordResetCode(email): Promise<IResponse> {
        return this.execute(this.authAdapter, 'sendPasswordResetCode', { email });
    }

    public resetPassword(email, password, passwordConfirm, code): Promise<IResponse> {
        return this.execute(this.authAdapter, 'resetPassword', { email, password, password_confirm: passwordConfirm, code }).then(
            (response) => {
                this.loginFromResponse(response);
                return response;
            });
    }

    public isPasswordResetCodeSent(email): Promise<IResponse> {
        return this.execute(this.authAdapter, 'isPasswordResetCodeSent', { email });
    }

    public getSessionUser(): Promise<IResponse> {
        return this.execute(this.authAdapter, 'getUser').then(
            (response: IResponse) => {
                this.loginFromResponse(response);
                return response;
            }
        );
    }

    public getUserProfile(): Promise<IResponse> {
        return this.execute(this.authAdapter, 'getUserProfile');
    }

    public saveUserProfile(email, firstName, lastName, displayName, photoUrl, oldPassword, newPassword, passwordConfirm): Promise<IResponse> {
        return this.execute(this.authAdapter, 'saveUserProfile', {
            email,
            first_name: firstName,
            last_name: lastName,
            display_name: displayName,
            photo_url: photoUrl,
            old_password: oldPassword,
            new_password: newPassword,
            password_confirm: passwordConfirm
        });
    }


    public execute(adapter: string, method: string, params?: any, showError = true): Promise<IResponse> {
        if (typeof params === 'object')
            params = JSON.stringify(params);
        let data = {
            adapter,
            method,
            params: params || null
        };
        let promise = new Promise((resolve, reject) => {
            WaitScreen.start();
            Ajax.post(this.url, data, (result) => {

                WaitScreen.stop();

                let response: IResponse;

                // cutting php raw output
                if (typeof result === 'string') {
                    if (result.indexOf('{"data":') >= 0) {
                        let raw = result.substr(0, result.indexOf('{"data":'));
                        let s = result.substr(result.indexOf('{"data":'));
                        let res = Ajax.parseJSON(s);
                        response = {
                            data: res.data ? res.data : res,
                            raw,
                            message: res.message ? res.message : '',
                            code: res.code ? res.code : 0,
                            stack: res.stack ? res.stack : ''
                        };
                    }
                    else {
                        response = {
                            data: '',
                            raw: result,
                            code: 0,
                            message: 'Service error',
                            stack: ''
                        };
                    }
                }
                else
                    response = result;

                // showing error
                if ((showError && response.message) || response.raw)
                    this.showError(response);

                // handling response
                if (!response.message)
                    resolve(response);
                else
                    reject(response);
            });
        });
        return promise;
    };

    public showError(response: IResponse) {
        let msg = response.message;
        if (application.obj.config.debug && response.stack && response.code) {
            msg += '<div class="stack" style="font-weight: normal; font-size: 12px; margin-top: 10px; margin-bottom: 10px">' + response.stack + '</div>';
        }
        if (application.obj.config.debug && application.obj.config.showServiceRawOutput && response.raw)
            //msg += '<div class="raw" style="margin-top: 10px"><div style="margin-bottom: -10px; font-size: 16px">PHP:</div>' + response.raw + '</div>';
            msg += '<div class="raw">' + response.raw + '</div>';
        application.obj.showMessage(msg);
    }
}
