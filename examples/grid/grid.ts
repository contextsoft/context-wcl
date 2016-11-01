import {
    utils, Application, ScreenView, HeaderView, FooterView, GridView, RecordSetSource
} from 'context-wcl';

import { config } from './config';

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

        let data = [];
        for (let i = 1; i <= 100; i++)
            data.push({
                id: i,
                field1: i + 100,
                field2: i + 200,
                field3: i + 300,
                field4: i + 400,
                field5: i + 500
            });

        let ds = new RecordSetSource();
        ds.records = data;

        let grid = new GridView(this);
        grid.data.dataSource = ds;
        //grid.drawRowSelection = true;
        //grid.showHeader = true;
        //grid.showFooter = true;
        //grid.fixedHeader = true;
        //grid.style = 'height: 500px';
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
