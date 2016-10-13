

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
    ButtonType, InputView, TextAreaView, SelectView, ListView, LookupView, DatePicker,
    TabsView, PageView, Dialog, TreeView, WorkAreaLayout, GridLayout,
    SimpleSource, EditAction, PostAction, CancelAction
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
        pages.items = [
            { text: 'std.controls', value: stdPage },
            { text: 'list.controls', value: listPage },
            { text: 'ext.controls', value: extPage },
            { text: 'tree.controls', value: treePage },
            { text: 'layout.controls', value: layoutPage },
            { text: 'data', value: dataPage }
        ];
        pages.setPageIndex(0);

        this.testEdits(stdPage);
        this.testButtons(stdPage);
        this.testAligning(stdPage);

        this.testLists(listPage);
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
        input.data.dataSource = null; // on data change and on state change events
        input.data.dataField = 'lastName';

        let enableInputBtn = new ButtonView(grpBox);
        enableInputBtn.text = 'Disable';
        enableInputBtn.buttonType = ButtonType.danger;
        enableInputBtn.events.onclick = (event) => {
            if (input.enabled) {
                input.enabled = false;
                enableInputBtn.text = 'Enable';
                enableInputBtn.buttonType = ButtonType.primary;
            }
            else {
                input.enabled = true;
                enableInputBtn.text = 'Disable';
                enableInputBtn.buttonType = ButtonType.danger;
            }
        };

        let readOnlyBtn = new ButtonView(grpBox);
        readOnlyBtn.text = 'Read Only';
        readOnlyBtn.buttonType = ButtonType.warning;
        readOnlyBtn.events.onclick = function (event) {
            if (input.attributes.readonly) {
                delete input.attributes.readonly;
                readOnlyBtn.buttonType = ButtonType.warning;
                readOnlyBtn.text = 'Read Only';
            }
            else {
                input.attributes.readonly = true;
                readOnlyBtn.buttonType = ButtonType.info;
                readOnlyBtn.text = 'Writable';
            }
            input.updateView();
        };

        let textareaLabel = new TextView(grpBox);
        textareaLabel.text = 'Text Area: ';

        let textarea = new TextAreaView(grpBox);
        textarea.style = "display: block; width: 355px; height: 60px";
    }

    // ButtonView
    protected testButtons(parent: View) {
        let grpBox = new GroupBoxView(parent);
        grpBox.style = 'margin-bottom: 10px';
        grpBox.caption = 'Button types';

        for (let t in ButtonType) {
            if (ButtonType.hasOwnProperty(t) && !/^\d+$/.test(t)) {
                let b = new ButtonView(grpBox, 'btn_' + t);
                if (t !== 'chevronLeft' && t !== 'chevronRight')
                    b.text = t;
                b.buttonType = <any>ButtonType[t];
            }
        }

    }

    // View.alignChildren = true, Splitter
    protected testAligning(parent: View) {
        let grpBox = new GroupBoxView(parent);
        grpBox.style = 'margin-bottom: 10px';
        grpBox.caption = 'Aligning and Splitter';

        let container = new PanelView(grpBox, 'Container');
        container.style = 'width: 100%; height: 200px';
        container.alignChildren = true;

        let leftPanel = new PanelView(container);
        leftPanel.align = Align.left;
        leftPanel.style = "background-color: #c9eaff; width: 200px";

        let leftSplitter = new Splitter(container);
        leftSplitter.align = Align.left;

        let centerPanel = new PanelView(container);
        centerPanel.align = Align.client;
        centerPanel.style = "background-color: #bbfcc5";

        let rightPanel = new PanelView(container);
        rightPanel.align = Align.right;
        rightPanel.style = "background-color: #fcbbbb; width: 200px";

        let rightSplitter = new Splitter(container);
        rightSplitter.align = Align.right;
    }

    // ListView, LookupView, DatePicker
    protected testLists(parent: View) {
        let grpBox = new GroupBoxView(parent);
        grpBox.style = 'margin-bottom: 10px';
        grpBox.caption = 'Lists';

        let label1 = new TextView(grpBox);
        label1.style = 'margin-bottom: 10px';
        label1.text = 'LookupView:';
        let lookup = new LookupView(grpBox);
        for (let i = 0; i < 200; i++)
            lookup.items.push({
                text: 'item ' + i
            });

        let label2 = new TextView(grpBox);
        label2.style = 'margin-bottom: 10px';
        label2.text = 'DatePicker:';
        let datePicker = new DatePicker(grpBox);

        let label3 = new TextView(grpBox);
        label3.style = 'margin-bottom: 10px';
        label3.text = 'SelectView:';
        let select = new SelectView(grpBox);

        let label4 = new TextView(grpBox);
        label4.style = 'margin-bottom: 10px';
        label4.text = 'ListView:';
        let list = new ListView(grpBox);

        list.onGetItems = (addItem) => {
            addItem('added item 1');
            addItem('added item 2');
            addItem('added item 3');
            addItem('added item 4');
            addItem('added item 5');
            addItem('added item 6');
        };

        select.items = [
            'item 1',
            'item 2',
            'item 3',
            'item 4',
            'item 5',
        ];
    }

    // TabsView, PageView
    protected testTabs(parent: View) {
        let grpBox = new GroupBoxView(parent);
        grpBox.style = 'margin-bottom: 10px';
        grpBox.caption = 'Tabs';

        let tabs = new TabsView(grpBox);
        tabs.additionalCSSClass = 'flat';
        tabs.items = ['Tab 1', 'Tab 2', 'Tab 3'];

        let label = new TextView(grpBox);
        label.style = 'margin-top: 10px; margin-bottom: 20px';

        tabs.onSelectionChange = function (index) {
            label.text = utils.formatStr('Tab {0} selected.', [index + 1]);
        };

        tabs.selectedIndex = 0;

        let pages = new PageView(grpBox);

        let page1 = new PanelView(pages);
        page1.text = 'This is Page 1';

        let page2 = new PanelView(pages);
        page2.text = 'This is Page 2';

        page1.style = page2.style = "padding: 10px";

        pages.items = [
            { text: 'Page 1', value: page1 },
            { text: 'Page 2', value: page2 }
        ];

        pages.setPageIndex(0);
    }

    // Dialog
    protected testDlg(parent: View) {
        let grpBox = new GroupBoxView(parent);
        grpBox.style = 'margin-bottom: 10px';
        grpBox.caption = 'Dialog';
        let btn = new ButtonView(grpBox);
        btn.text = 'Show Dialog';
        btn.events.onclick = function () {
            Dialog.showOkCancelDialog('Some message', function (dialog) {
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
        c1.text = "Edit 1";
        let e1 = new InputView(gridLayout);

        let c2 = new TextView(gridLayout);
        c2.text = "Edit 2";
        let e2 = new InputView(gridLayout);

        gridLayout.rows = [
            [c1, e1],
            [c2, e2]
        ];
    }

    protected testDataSource(parent: View) {

        let ds = new SimpleSource();
        let dataObj = new MyDataClass('john', 'smith'); 
        ds.current = dataObj;
        
        let gridLayout = new GridLayout(parent);
        
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
