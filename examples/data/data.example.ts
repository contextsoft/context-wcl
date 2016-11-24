import {
    Application, ScreenView, HeaderView, FooterView, TextView, /*Ajax, Service,*/ TableDataSource, DataTable,
    GridView, PanelView, Align, InputView, GridLayout, Splitter, ButtonView, PostAction, EditAction, CancelAction,
    DeleteAction, InsertAction, Record
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

class TestRecord extends Record {
    id: number;
    col1: string;
    col2: string;
    col3: string;
}

class MainScreen extends ScreenView {

    protected initComponents() {
        this.createHeaderFooter();

        // data
        let testTable = new DataTable(TestRecord, null, 'test');
        let testTableSource = new TableDataSource(testTable);

        // controls 

        let clientPanel = new PanelView(this);
        clientPanel.style = 'position: absolute; width: 100%; top: 30px; bottom: 30px;';
        clientPanel.alignChildren = true;

        let topPanel = new PanelView(clientPanel);
        topPanel.style = 'height: 220px; padding: 10px';
        topPanel.align = Align.top;

        let leftLayout = new GridLayout(topPanel);

        let idCap = new TextView(leftLayout);
        idCap.text = 'Id: ';
        let idEdit = new InputView(leftLayout);
        idEdit.enabled = false;

        let col1Cap = new TextView(leftLayout);
        col1Cap.text = 'Col1: ';
        let col1Edit = new InputView(leftLayout);

        let col2Cap = new TextView(leftLayout);
        col2Cap.text = 'Col2: ';
        let col2Edit = new InputView(leftLayout);

        let col3Cap = new TextView(leftLayout);
        col3Cap.text = 'Col3: ';
        let col3Edit = new InputView(leftLayout);

        leftLayout.rows = [
            [idCap, idEdit],
            [col1Cap, col1Edit],
            [col2Cap, col2Edit],
            [col3Cap, col3Edit]
        ];

        // buttons
        let btnPanel = new PanelView(topPanel);
        btnPanel.style = 'margin-top: 10px';

        let editBtn = new ButtonView(btnPanel);
        editBtn.theme = ButtonView.themes.primary;

        let postBtn = new ButtonView(btnPanel);
        postBtn.theme = ButtonView.themes.success;

        let cancelBtn = new ButtonView(btnPanel);
        cancelBtn.theme = ButtonView.themes.danger;

        let newBtn = new ButtonView(btnPanel);
        newBtn.style = 'margin-left: 20px';

        let delBtn = new ButtonView(btnPanel);

        // grid
        let splitter = new Splitter(clientPanel);
        splitter.align = Align.top;

        let bottomPanel = new PanelView(clientPanel, 'BottomPanel');
        bottomPanel.style = 'padding: 10px';
        bottomPanel.align = Align.client;

        let grid = new GridView(bottomPanel);
        grid.fixedHeader = true;

        // binding data

        idEdit.data.dataSource = testTableSource;
        idEdit.data.dataField = 'id';
        col1Edit.data.dataSource = testTableSource;
        col1Edit.data.dataField = 'col1';
        col2Edit.data.dataSource = testTableSource;
        col2Edit.data.dataField = 'col2';
        col3Edit.data.dataSource = testTableSource;
        col3Edit.data.dataField = 'col3';

        editBtn.action = new EditAction(testTableSource);
        postBtn.action = new PostAction(testTableSource);
        cancelBtn.action = new CancelAction(testTableSource);
        newBtn.action = new InsertAction(testTableSource);
        delBtn.action = new DeleteAction(testTableSource);

        grid.data.dataSource = testTableSource;

        // filling data
        testTable.fill();
    }

    protected createHeaderFooter() {
        let header = new HeaderView(this, 'header');
        header.text = 'Context Web Components Library - Test Project';
        let footer = new FooterView(this, 'footer');
        footer.text = '(c) 2016 Context Software LLC.';
        header.style = footer.style = 'min-height: 30px; padding-top: 6px;';
    }

    /*protected otherTests() {
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
        application.service.execute('UserSession', 'getSessionInfo').then(
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
    }*/
}
