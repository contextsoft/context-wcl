

// exmaple of how to include breeze
// import * as breeze from 'breeze-client';

// example of how to use jquery - this is because of default export of $
// import 'jquery';

// we can import particular file
import { Application } from 'context-wcl';

// or we can import from index file (all library)
import {
    resources, Align, View, ScreenView, TextView, PanelView,
    HeaderView, FooterView, GroupBoxView, ButtonView, Splitter,
    InputView, TextAreaView, SelectView, ListView, LookupView, DatePicker,
    TabsView, PageView, MessageBox, TreeView, WorkAreaLayout, GridLayout,
    RecordSource, RecordSetSource, EditAction, PostAction, CancelAction,
    CheckView, RadioView, PopupMenu
}
    from 'context-wcl';

// or we can import a particular file as namespace
import { utils } from 'context-wcl';

// this is just importing one export from project's unit
import { config } from './config';

/* Example of using breeze and jquery */

function test() {
    //    var c = $('#myid');
    //    var c2 = breeze.core;
}


/* add resource files to resource boundle/library, they will be loaded when app initializes */
resources.register('MyApp', [
    'myapp.css'
]);

/** Main routine that's called by requirejs script in index.html */
export function main() {
    new MyApp(config);
}

/**
 * Our application class. It's sufficient to override method run. 
 * In reality there's no need to subclass Application, but we can do it anyway.
 */
class MyApp extends Application {

    public mainScreen;
    public run() {
        this.mainScreen = new MainScreen('mainScreen');
        this.mainScreen.show();
        test();
    }
}

class MyDataClass {
    constructor(public firstName: string, public lastName: string) {

    };
    get fullName() { return this.firstName + ' ' + this.lastName; }
    set fullName(value) { }
}

class MainScreen extends ScreenView {
    protected initComponents() {
        this.testHeaderFooter();

        let workarea = new WorkAreaLayout(this);

        let pages = new PageView(workarea);
        let stdPage = new PanelView(pages);
        let listPage = new PanelView(pages);
        let extPage = new PanelView(pages);
        let treePage = new PanelView(pages);
        let layoutPage = new PanelView(pages);
        let dataPage = new PanelView(pages);
        pages.pages = [
            { text: 'std.controls', view: stdPage },
            { text: 'list.controls', view: listPage },
            { text: 'ext.controls', view: extPage },
            { text: 'tree.controls', view: treePage },
            { text: 'layout.controls', view: layoutPage },
            { text: 'data', view: dataPage }
        ];
        pages.setPageIndex(0);

        this.testEdits(stdPage);
        this.testButtons(stdPage);
        this.testCheckBoxes(stdPage);
        this.testAligning(stdPage);
        this.testLists(listPage);
        this.testMenus(extPage);
        this.testTabs(extPage);
        this.testDlg(extPage);
        this.testTree(treePage);
        this.testLayouts(layoutPage);
        this.testDataSource(dataPage);
    }

    // Header, Footer    
    protected testHeaderFooter() {
        let header = new HeaderView(this, 'header');
        header.text = 'Context Web Components Library - Test Project';
        let footer = new FooterView(this, 'footer');
        footer.text = '(c) 2016 Context Software LLC.';
    }

    // GroupBoxView, InputView, TextAreaView, ButtonView
    protected testEdits(parent: View) {
        let grpBox = new GroupBoxView(parent);
        grpBox.caption = 'Inputs';
        grpBox.style = 'margin-bottom: 10px';

        let inputLabel = new TextView(grpBox);
        inputLabel.text = 'Input: ';

        let input = new InputView(grpBox);
        input.style = 'margin-right: 10px';

        let enableInputBtn = new ButtonView(grpBox);
        enableInputBtn.text = 'Disable';
        enableInputBtn.theme = ButtonView.themes.danger;
        enableInputBtn.events.onclick = (event) => {
            if (input.enabled) {
                input.enabled = false;
                enableInputBtn.text = 'Enable';
                enableInputBtn.theme = ButtonView.themes.primary;
            }
            else {
                input.enabled = true;
                enableInputBtn.text = 'Disable';
                enableInputBtn.theme = ButtonView.themes.danger;
            }
        };

        let readOnlyBtn = new ButtonView(grpBox);
        readOnlyBtn.text = 'Read Only';
        readOnlyBtn.theme = ButtonView.themes.warning;
        readOnlyBtn.events.onclick = function (event) {
            if (input.attributes.readonly) {
                delete input.attributes.readonly;
                readOnlyBtn.theme = ButtonView.themes.warning;
                readOnlyBtn.text = 'Read Only';
            }
            else {
                input.attributes.readonly = true;
                readOnlyBtn.theme = ButtonView.themes.info;
                readOnlyBtn.text = 'Writable';
            }
            input.updateView();
        };

        let textareaLabel = new TextView(grpBox);
        textareaLabel.text = 'Text Area: ';

        let textarea = new TextAreaView(grpBox);
        textarea.style = 'display: block; width: 355px; height: 60px';
    }

    // ButtonView
    protected testButtons(parent: View) {
        let grpBox = new GroupBoxView(parent);
        grpBox.style = 'margin-bottom: 10px';
        grpBox.caption = 'Button types';

        for (let t in ButtonView.themes) {
            if (ButtonView.themes.hasOwnProperty(t)) {
                let b = new ButtonView(grpBox, 'btn_' + t);
                if (t !== 'chevronLeft' && t !== 'chevronRight' && t !== 'cross')
                    b.text = t;
                b.theme = t;
            }
        }

    }

    // CheckView, RadioView
    protected testCheckBoxes(parent: View) {
        let grpBox = new GroupBoxView(parent);
        grpBox.style = 'margin-bottom: 10px';
        grpBox.caption = 'Check boxes and radios';


        let layout = new GridLayout(grpBox);

        // check boxes

        let leftPanel = new PanelView(layout);

        let c1 = new CheckView(leftPanel);
        c1.text = 'CheckBox 1';

        let c2 = new CheckView(leftPanel);
        c2.text = 'Disabled';
        c2.enabled = false;

        let c3 = new CheckView(leftPanel);
        c3.text = 'Checked and Disabled';
        c3.value = true;
        c3.enabled = false;

        // radios

        let rightPanel = new PanelView(layout);

        let r1 = new RadioView(rightPanel);
        r1.text = 'Radio 1';

        let r2 = new RadioView(rightPanel);
        r2.text = 'Radio 2';

        let r3 = new RadioView(rightPanel);
        r3.text = 'Disabled';
        r3.enabled = false;


        let r4 = new RadioView(rightPanel);
        r4.text = 'Disabled and initially checked';
        r4.value = true;
        r4.enabled = false;

        // layout
        layout.rows = [[leftPanel, rightPanel]];
    }

    // View.alignChildren = true, Splitter
    protected testAligning(parent: View) {
        let grpBox = new GroupBoxView(parent);
        grpBox.style = 'margin-bottom: 10px';
        grpBox.caption = 'Aligning and Splitter';

        let container = new PanelView(grpBox, 'Container');
        container.style = 'width: 100%; height: 100px';
        container.alignChildren = true;

        let leftPanel = new PanelView(container);
        leftPanel.align = Align.left;
        leftPanel.style = 'background-color: #c9eaff; width: 200px';

        let leftSplitter = new Splitter(container);
        leftSplitter.align = Align.left;

        let centerPanel = new PanelView(container);
        centerPanel.align = Align.client;
        centerPanel.style = 'background-color: #bbfcc5';

        let rightPanel = new PanelView(container);
        rightPanel.align = Align.right;
        rightPanel.style = 'background-color: #fcbbbb; width: 200px';

        let rightSplitter = new Splitter(container);
        rightSplitter.align = Align.right;
    }

    // ListView, LookupView, DatePicker
    protected testLists(parent: View) {
        let grpBox = new GroupBoxView(parent);
        grpBox.style = 'margin-bottom: 10px';
        grpBox.caption = 'Lists';

        // DatePicker

        let label2 = new TextView(grpBox);
        label2.style = 'margin-bottom: 10px';
        label2.text = 'DatePicker:';
        let datePicker = new DatePicker(grpBox);
        // DataSource for storing date value
        let dateSrc = new RecordSource();
        dateSrc.current = {
            value: ''
        };
        datePicker.data.dataSource = dateSrc;
        datePicker.data.dataField = 'value';

        let dateEdit = new InputView(grpBox);
        dateEdit.style = 'display: block; width: 350px';
        dateEdit.attributes.readonly = true;
        dateEdit.data.dataSource = dateSrc;
        dateEdit.data.dataField = 'value';

        // Lookup

        // DataSource for lookup list
        let records = [];
        for (let i = 0; i < 500; i++)
            records.push({
                value: i,
                text: 'item ' + i
            });
        let listSource = new RecordSetSource();
        listSource.records = records;

        let label1 = new TextView(grpBox);
        label1.style = 'margin-bottom: 10px';
        label1.text = 'LookupView:';
        let lookup = new LookupView(grpBox);
        lookup.listData.dataSource = listSource;
        lookup.listData.displayField = 'text';
        lookup.listData.keyField = 'value';

        // SelectView and ListView

        // DataSource for SelectView and ListView lists
        let listRecSetSrc = new RecordSetSource();
        listRecSetSrc.records = [
            { id: 1, text: 'item 1' },
            { id: 2, text: 'item 2' },
            { id: 3, text: 'item 3' },
            { id: 4, text: 'item 4' },
            { id: 5, text: 'item 5' }
        ];
        // DataSource for value
        let recSrc = new RecordSource();
        recSrc.current = {
            value: ''
        };

        // SelectView

        let label3 = new TextView(grpBox);
        label3.style = 'margin-bottom: 10px';
        label3.text = 'SelectView:';

        let select = new SelectView(grpBox);
        select.lookupData.dataSource = listRecSetSrc;
        select.lookupData.keyField = 'id';
        select.lookupData.displayField = 'text';
        select.data.dataSource = recSrc;
        select.data.dataField = 'value';

        let selectEdit = new InputView(grpBox);
        selectEdit.style = 'margin-left: 10px';
        selectEdit.data.dataSource = recSrc;
        selectEdit.data.dataField = 'value';

        let label4 = new TextView(grpBox);
        label4.style = 'margin-bottom: 10px';
        label4.text = 'ListView:';

        // ListView

        let list = new ListView(grpBox);
        list.listData.dataSource = listRecSetSrc;
        list.listData.keyField = 'id';
        list.listData.displayExpression = function (rec: any) {
            return utils.escapeHTML(utils.formatStr('{0}. {1}', [rec.id, rec.text]));
        };

        let listEdit = new InputView(grpBox);
        listEdit.style = 'display: block; margin-top: 10px';
        listEdit.data.dataSource = listRecSetSrc;
        listEdit.data.dataField = 'text';
        listEdit.attributes.readonly = true;
    }

    // PopupMenu
    protected testMenus(parent: View) {
        let grpBox = new GroupBoxView(parent);
        grpBox.style = 'margin-bottom: 10px';
        grpBox.caption = 'Menu';

        // menu
        let onItemClick = function (item) {
            MessageBox.showMessage(item.text);
        };

        let menu = new PopupMenu();
        menu.menu = [
            { text: 'item 1', onclick: onItemClick },
            { text: '-' },
            { text: 'item 2', disabled: false, onclick: onItemClick },
            { text: 'item 3', onclick: onItemClick },
            { text: '-' },
            { text: 'item 4', onclick: onItemClick },
            { text: 'item 5', disabled: true, onclick: onItemClick }
        ];

        // target control
        let popupBtn = new ButtonView(grpBox);
        popupBtn.theme = ButtonView.themes.toggle;
        popupBtn.events.onclick = function () {
            menu.popup(popupBtn);
        };

    }

    // TabsView, PageView
    protected testTabs(parent: View) {
        let grpBox = new GroupBoxView(parent);
        grpBox.style = 'margin-bottom: 10px';
        grpBox.caption = 'Tabs';

        let tabs = new TabsView(grpBox);
        // tabs.theme = TabsView.themes.flat;

        let label = new TextView(grpBox);
        label.style = 'margin-top: 10px; margin-bottom: 20px';

        tabs.onChange = function (value) {
            label.text = utils.formatStr('Tab {0} selected.', [value]);
        };

        tabs.tabs = ['Tab 1', 'Tab 2', 'Tab 3'];


        let pages = new PageView(grpBox);

        let page1 = new PanelView(pages);
        page1.text = 'This is Page 1';

        let page2 = new PanelView(pages);
        page2.text = 'This is Page 2';

        pages.pages = [
            { text: 'Page 1', view: page1 },
            { text: 'Page 2', view: page2 }
        ];
    }

    // Dialog
    protected testDlg(parent: View) {
        let grpBox = new GroupBoxView(parent);
        grpBox.style = 'margin-bottom: 10px';
        grpBox.caption = 'Dialog';
        let btn = new ButtonView(grpBox);
        btn.text = 'Show Dialog';
        btn.events.onclick = function () {
            MessageBox.showOkCancelMessage('Some message', function (dialog) {
                dialog.hide();
            });
        };
    }

    // TreeView
    protected testTree(parent: View) {
        let grpBox = new GroupBoxView(parent);
        grpBox.style = 'margin-bottom: 10px';
        grpBox.caption = 'Tree';

        let tree = new TreeView(grpBox);

        tree.nodes = [
            { text: 'node 1' },
            { text: 'node 2' },
            {
                text: 'node 3',
                nodes: [
                    { text: 'subnode 1' },
                    { text: 'subnode 2' },
                    { text: 'subnode 3' },
                ]
            }
        ];
    }

    // GridLayout
    protected testLayouts(parent: View) {
        let grpBox = new GroupBoxView(parent);
        grpBox.style = 'margin-bottom: 10px';
        grpBox.caption = 'GridLayout';

        let gridLayout = new GridLayout(grpBox);

        let c1 = new TextView(gridLayout);
        c1.text = 'Edit 1';
        let e1 = new InputView(gridLayout);

        let c2 = new TextView(gridLayout);
        c2.text = 'Edit 2';
        let e2 = new InputView(gridLayout);

        gridLayout.rows = [
            [c1, e1],
            [c2, e2]
        ];
    }

    // Data-binding
    protected testDataSource(parent: View) {
        let ds = new RecordSource();
        let dataObj = new MyDataClass('john', 'smith');
        ds.current = dataObj;

        let grpBox = new GroupBoxView(parent);
        grpBox.text = 'Data Binding';

        let gridLayout = new GridLayout(grpBox);

        let edit1 = new InputView(gridLayout);
        let edit2 = new InputView(gridLayout);
        let pnlButtons = new PanelView(gridLayout);

        let btnEdit = new ButtonView(pnlButtons);
        let btnPost = new ButtonView(pnlButtons);
        let btnCancel = new ButtonView(pnlButtons);

        btnEdit.action = new EditAction(ds);
        btnPost.action = new PostAction(ds);
        btnCancel.action = new CancelAction(ds);

        gridLayout.rows = [
            [edit1],
            [edit2],
            [pnlButtons]
        ];

        edit1.data.dataSource = ds;
        edit1.data.dataField = 'firstName';

        edit2.data.dataSource = ds;
        edit2.data.dataField = 'fullName';
    }
}
