import {
    Application, ScreenView, HeaderView, FooterView, TextView, /*Ajax, Service,*/ TableDataSource, DataTable,
    GridView, PanelView, Align, InputView, GridLayout, Splitter, ButtonView, PostAction, EditAction, CancelAction,
    DeleteAction, InsertAction, Record, DataTableSet, GroupBoxView
} from 'context-wcl';

import { config } from './config';
//import { application } from 'application';

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

        let grpBox = new GroupBoxView(this);
        grpBox.text = 'Login';
        let layout = new GridLayout(grpBox);

        let userLabel = new TextView(layout);
        userLabel.text = 'User: ';
        let userEdit = new InputView(layout);

        let pwdLabel = new TextView(layout);
        userLabel.text = 'Password: ';
        let pwdEdit = new InputView(layout);

        layout.rows = [
            [userLabel, userEdit],
            [pwdLabel, pwdEdit]
        ];

    }

    protected createHeaderFooter() {
        let header = new HeaderView(this, 'header');
        header.text = 'Context Web Components Library - Test Project';
        let footer = new FooterView(this, 'footer');
        footer.text = '(c) 2016 Context Software LLC.';
        header.style = footer.style = 'min-height: 30px; padding-top: 6px;';
    }

}
