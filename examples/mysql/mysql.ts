import {
    Application, ScreenView, HeaderView, FooterView, TextView, Ajax, Service, DataSet,
    RecordSetSource, GridView
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

        // mysql
        let dataSet = new DataSet('World');
        let recSource = new RecordSetSource();
        let grid = new GridView(this);
        grid.data.dataSource = recSource;

        dataSet.fill().then((records) => {
            recSource.records = records;
        });

        /*
        // xhr post
        let label1 = new TextView(this);
        label1.text = 'Here should be server respond';
        label1.doNotEscapeHtml = true;
        Ajax.post(
            application.config.serviceUrl,
            { adapter: 'UserSession', method: 'getSessionInfo' },
            (data) => {
                label1.text = data;
            });

        // session info
        let label2 = new TextView(this);
        label2.text = 'Here should be server respond';
        label2.doNotEscapeHtml = true;
        svc.execute('UserSession', 'getSessionInfo').then(
            (data) => {
                label2.text = JSON.stringify(data);
            }); 
        
        // service
        let svc = <Service>application.service;
        let label3 = new TextView(this);
        label3.text = 'Here should be server respond';
        label3.doNotEscapeHtml = true;
        svc.execute('World', 'select').then(
            (response) => {
                label3.text = JSON.stringify(response.data);
            }
        );
        */
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
