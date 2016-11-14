/** Server communication protocols and routines */

interface IOnData {
    (data: any): any;
}

export interface IService {
    url: string;
    authenticated: boolean;
    username: string;
    login(username?: string, password?: string): Promise<any>;
    logout();
    execute(className: string, methodName: string, params?: any): Promise<string>;
}

/*export class Promise {
    protected onData: IOnData;
    protected next: Promise;

    public then(onData: IOnData): Promise {
        this.onData = onData;
        this.next = new Promise();
        return this.next;
    };

    public invoke(data: any) {
        let nextData = {};
        if (this.onData)
            nextData = this.onData(data) || data;
        if (this.next)
            this.next.invoke(nextData);
    }
}*/

export class Ajax {
    public static send(url: string, callback: IOnData, method: string, data?, async = true) {
        let x = Ajax.getXHR();
        x.open(method, url, async);
        x.onreadystatechange = function () {
            if (x.readyState == 4) {
                callback(x.responseText);
            }
        };
        if (method == 'POST') {
            x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        }
        x.send(data);
    }

    public static get(url: string, data, callback: IOnData, async = true) {
        let query = [];
        for (let key in data) {
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
        Ajax.send(url + (query.length ? '?' + query.join('&') : ''), callback, 'GET', null, async);
    }

    public static post(url: string, data, callback: IOnData, async = true) {
        let query = [];
        for (let key in data) {
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
        Ajax.send(url, callback, 'POST', query.join('&'), async);
    }

    protected static getXHR() {
        if (typeof XMLHttpRequest !== 'undefined') {
            return new XMLHttpRequest();
        }
        // IE compatibility
        /*
        let versions = [
            "MSXML2.XmlHttp.6.0",
            "MSXML2.XmlHttp.5.0",
            "MSXML2.XmlHttp.4.0",
            "MSXML2.XmlHttp.3.0",
            "MSXML2.XmlHttp.2.0",
            "Microsoft.XmlHttp"
        ];
        let xhr;
        for (let i = 0; i < versions.length; i++) {
            try {
                xhr = new ActiveXObject(versions[i]);
                break;
            } catch (e) {
            }
        }
        return xhr;
        */
    }
}

export class Service implements IService {
    public username: string;
    public url: string;

    get authenticated(): boolean {
        return this._authenticated;
    };
    protected _authenticated;

    public login(username?: string, password?: string): Promise<any> {
        if (username)
            this.username = username;
        return this.execute('Application', 'login', { username: this.username, password: password });
    };

    public logout(): Promise<any> {
        this._authenticated = false;
        return this.execute('Application', 'logout');
    };

    public execute(adapter: string, method: string, params?: any): Promise<any> {
        let data = {
            adapter: adapter,
            method: method,
            params: params || null
        };
        let promise = new Promise((resolve, reject) => {
            Ajax.post(this.url, data, (result) => {
                let r = JSON.parse(result);
                resolve(r);
            });
        });
        return promise;
    };

    public getSessionInfo() {
        return this.execute('UserSession', 'getSessionInfo')
            .then((data) => {
                //this.login(); 
            });
    }
}