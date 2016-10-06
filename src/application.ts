/**
 * Application object
 */
import { utils } from './utils';
import { resources } from './resources';
import { IVoidEvent, IDOMEvent } from './component';

export interface IAppConfig
{
    appUrl: string;
    libraries?: any;
}

/** Application control and config */
export class Application
{
    /** Locales supported by application */
    static locales = {
        en: {
            "$locale": "English"
        }
    };

    /** Returns WebBrowser info */
    public static getAgentInfo()
    {
        let r: any = {};
        r.vendor = (/webkit/i).test(navigator.appVersion) ? 'webkit' : (/firefox/i).test(navigator.userAgent) ? 'moz' : (/trident/i).test(navigator.userAgent) ? 'ms' : 'opera' in window ? 'o' : '';
        // Browser capabilities
        r.isAndroid = (/android/gi).test(navigator.appVersion);
        r.isIDevice = (/iphone|ipad/gi).test(navigator.appVersion);
        r.isPlaybook = (/playbook/gi).test(navigator.appVersion);
        r.isTouchPad = (/hp-tablet/gi).test(navigator.appVersion);
        r.hasTouch = 'ontouchstart' in window && !r.isTouchPad;
        r.isMobileDevice = false; // this will be set in device ready event
        // Events
        r.CLICK_EV = r.hasTouch ? 'touchstart' : 'click';
        return r;
    };

    /** Application settings stored in localStorage */
    public settings: any;

    /** General app-wide configuration params */
    public config: IAppConfig = {
        /** Path to application */
        appUrl: '',
        // servletExtension: '',
        // baseUrl: '',
        // servlet: '',
        // rootPost: true,
        // requestCancelTime: 10000, // 10 sec
        // keepAliveInterval: 60000,
        // isQuasar: false,
    };

    /** Used as temporary application-wide storage */
    public sessionInfo: any;

    /** Fires on after application after loaded and inited */
    public onReady: IVoidEvent;

    /** Fires on window resize */
    public onWindowResize: IDOMEvent[] = [];

    /** Default settings */
    protected defaultSettings = {
        locale: 'en'
    };

    protected _agentInfo;

    constructor(config?: IAppConfig, onReady?: IVoidEvent)
    {
        if (config)
            this.config = config;
        if (onReady)
            this.onReady = onReady;

        utils.setLocaleFunc((str: string): string => 
        {
            let locale = this.settings['locale'];
            let localeStr;
            if (Application.locales[locale])
                localeStr = Application.locales[locale][str];

            if (localeStr)
                return localeStr;
            else
            {
                if (this.settings['debug'])
                    utils.log('NOT TRANSLATED: [' + str + ']');
                return str;
            }
        });

        this.initLibraries();
        this.sessionInfo = {};
        this.loadSettings();
        application = this;
        this.init();
    }

    protected initLibraries()
    {
        let libs = this.config.libraries;
        for (let id in libs)
            if (libs.hasOwnProperty(id))
                resources.setLibraryPath(id, libs[id]);
    }

    /** Information about Browser */
    public get agentInfo()
    {
        if (!this._agentInfo)
            this._agentInfo = Application.getAgentInfo();
        return this._agentInfo;
    }

    /** Save options to localStorage */
    public saveSettings()
    {
        localStorage['settings'] = JSON.stringify(this.settings);
    }

    /** Load options from localStorage */
    public loadSettings()
    {
        if (localStorage['settings'])
            this.settings = JSON.parse(localStorage['settings']);
        else
            this.settings = this.defaultSettings;
    }


    /** Shows localized alert */
    public showMessage(msg: string)
    {
        if (msg && msg !== '')
            alert(this.L(msg));
    }

    /** Throws localized exception */
    public error(msg: string)
    {
        if (msg && msg !== '')
            throw (this.L(msg));
    }

    /** Inits application instance */
    public init()
    {
        this.getBody().onresize = this.handleBodyResize;
        resources.loadResources(this.config.appUrl, (): void => { this.afterResourcesLoaded(); });
    };

    /** Returns DOM body element*/
    public getBody()
    {
        return document.getElementsByTagName('body')[0];
    }

    /** Localizes string into selected language */
    public L(str)
    {
        return utils.L(str);
    }

    /** Makes DOM body unmovable on mobile devices */
    public makeBodyUnmoveable()
    {
        let body = this.getBody();

        let bodyTouchMove = function (event)
        {
            event.preventDefault();
        };

        if (body.addEventListener)
            body.addEventListener('touchmove', bodyTouchMove, false);
    };

    /** Returns body's size as {width, height}  */
    public getViewportSize()
    {
        let e: any = window, a: any = 'inner';
        if (!('innerWidth' in window))
        {
            a = 'client';
            e = document.documentElement || document.body;
        }
        return { width: e[a + 'Width'], height: e[a + 'Height'] };
    }

    protected run()
    {
        // inherit to implement 
    }

    protected afterResourcesLoaded()
    {
        if (this.onReady)
            this.onReady();
        this.run();
    }

    protected handleBodyResize(event: Event)
    {
        if (this.onWindowResize)
            for (let i = 0; i < this.onWindowResize.length; i++)
                this.onWindowResize[i](event);
    }

}

/** Global Application instance */
export var application: Application = null;

