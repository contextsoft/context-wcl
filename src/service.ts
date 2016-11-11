

interface IOnData
{
	(data: any): any;
}

export class Promise
{
	onData: IOnData;
	next: Promise;
	
	then(onData: IOnData): Promise
	{
		this.onData = onData;
		this.next = new Promise();
		return this.next;
	};
	
	invoke(data: any)
	{
        let nextData = {};
		if (this.onData)
			nextData = this.onData(data) || data;
		if (this.next)
			this.next.invoke(nextData);			
	}	
}

export interface IService {
    url: string;
    authenticated: boolean;    
    username: string;
    login(username?: string, password?: string): Promise;
    logout();
    execute(className: string, methodName: string, params?: any): Promise;
}

export class Service implements IService {

    protected _authenticated;
    username: string;
    url: string;
    get authenticated(): boolean {
        return this._authenticated;
    };    

    login(username?: string, password?: string): Promise {
        if (username)
            this.username = username;
        return this.execute('application', 'login', {username: this.username, password: password});
    };

    logout(): Promise {
        this._authenticated = false;
        return this.execute('application', 'logout');        
    };

    protected ajax(url: string, params: any, onData?: IOnData) {
        // implement calling ajax requests ++++
    }

    execute(className: string, methodName: string, params?: any): Promise {        
        let promise = new Promise();
        this.ajax(this.url, params, (data) => {
            promise.invoke(data);
        });
        return promise;
    };

    getSessionInfo() {
        return this.execute('application', 'getSessionInfo')
          .then( (data) => { this.login(); });
    }

    test() {
        this.getSessionInfo().then( () => { alert('applicationCache.showMainForm()'); });
    }

}