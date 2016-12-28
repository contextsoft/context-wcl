/** Server communication protocols and routines */

// import { utils } from './Utils';
import { application } from './Application';

export interface IResponse {
    data: any;
    raw?: string;
    error?: string;
    errorCode?: number;
    errorCallstack?: string;
}

interface IOnData {
    (data: any): any;
}

export interface IService {
    url: string;
    authenticated: boolean;
    username: string;
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

export class Service implements IService {
    public username: string;
    public url: string;
    public authAdapter = 'Auth';

    get authenticated(): boolean {
        return this._authenticated;
    };
    protected _authenticated;

    public login(email?: string, password?: string): Promise<IResponse> {
        return this.execute(this.authAdapter, 'login', { email, password }, false).then(
            (response) => {
                this._authenticated = true;
                this.username = response.data.display_name;
                return response;
            });
    };

    public logout(): Promise<IResponse> {
        this._authenticated = false;
        return this.execute(this.authAdapter, 'logout');
    };

    public register(email, firstName, lastName, password1, password2, captcha): Promise<IResponse> {
        let params = {
            email,
            first_name: firstName,
            last_name: lastName,
            password1,
            password2,
            captcha
        };
        return this.execute(this.authAdapter, 'register', params);
    };

    public sendRegistrationConfirmationCode(email): Promise<IResponse> {
        return this.execute(this.authAdapter, 'sendRegistrationConfirmationCode', { email });
    }

    public confirmRegistrationCode(email, code): Promise<IResponse> {
        return this.execute(this.authAdapter, 'confirmRegistrationCode', { email, code });
    }

    public generateRegistrationCaptcha(): Promise<IResponse> {
        return this.execute(this.authAdapter, 'generateRegistrationCaptcha');
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
            Ajax.post(this.url, data, (result) => {
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
                            error: res.error ? res.error : '',
                            errorCode: res.errorCode ? res.errorCode : '',
                            errorCallstack: res.errorCallstack ? res.errorCallstack : ''
                        };
                    }
                    else {
                        response = {
                            data: '',
                            raw: result,
                            error: 'Service error',
                            errorCallstack: ''
                        };
                    }
                }
                else
                    response = result;

                // showing error
                if ((showError && response.error) || response.raw)
                    this.showError(response);

                // handling response
                if (!response.error)
                    resolve(response);
                else
                    reject(response);
            });
        });
        return promise;
    };

    public showError(response: IResponse) {
        let msg = response.error;
        if (application.obj.config.debug && response.errorCallstack) {
            msg += '<div class="callstack" style="font-weight: normal; font-size: 12px;">' + response.errorCallstack + '</div>';
        }
        if (application.obj.config.showServiceRawOutput && response.raw)
            //msg += '<div class="raw" style="margin-top: 10px"><div style="margin-bottom: -10px; font-size: 16px">PHP:</div>' + response.raw + '</div>';
            msg += '<div class="raw">' + response.raw + '</div>';
        application.obj.showMessage(msg);
    }
}
