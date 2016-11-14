import {
    utils, Application, ScreenView, HeaderView, FooterView, TextView, Ajax, DataSet
} from 'context-wcl';

import { config } from './config';
import { application } from 'application';

export function main() {
    new MyApp(config);
}

class MyApp extends Application {
    public mainScreen;
    public run() {
        this.mainScreen = new MainScreen('mainScreen');
        this.mainScreen.show();
    }
}

class MainScreen extends ScreenView {

    protected initComponents() {
        this.createHeaderFooter();

        // Simple request
        let label1 = new TextView(this);
        label1.text = 'Here should be server respond';
        label1.doNotEscapeHtml = true;
        Ajax.post(
            application.config.serviceUrl,
            { adapter: 'UserSession', method: 'getSessionInfo' },
            (data) => {
                label1.text = data;
            });
    }

    protected createHeaderFooter() {
        let header = new HeaderView(this, 'header');
        header.text = 'Context Web Components Library - Test Project';
        let footer = new FooterView(this, 'footer');
        footer.text = '(c) 2016 Context Software LLC.';
        header.style = footer.style = 'min-height: 30px; padding-top: 6px;';
        this.style = 'margin-top: 40px; margin-bottom: 40px;';
    }

}
