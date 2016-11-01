import {
    utils, Application, ScreenView, HeaderView, FooterView, TabsView, TextView, PageView, PanelView
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

        // tabs

        let tabs = new TabsView(this);
        let tabCaption = new TextView(this);
        tabs.onChange = function (value) {
            tabCaption.text = utils.formatStr('Tab {0} selected', [value]);
        };

        tabs.tabs = [
            'tab 1',
            'tab 2',
            'tab 3'
        ];

        // pages

        let pages = new PageView(this);
        pages.style = 'margin-top: 20px';

        let page1 = new PanelView(pages);
        page1.text = 'This is Page 1';

        let page2 = new PanelView(pages);
        page2.text = 'This is Page 2';

        let page3 = new PanelView(pages);
        page3.text = 'This is Page 3';

        pages.pages = [
            { text: 'page 1', view: page1 },
            { text: 'page 2', view: page2 },
            { text: 'page 3', view: page3 }
        ];

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
