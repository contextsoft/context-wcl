

// exmaple of how to include breeze
import * as breeze from 'breeze-client';

// example of how to use jquery - this is because of default export of $
import 'jquery/dist/jquery';

// we can import particular file
import { Application } from 'context.vcl/application';

// or we can import from index file (all library)
import
{
    resources, ScreenView, TextView, PanelView,
    HeaderView, FooterView, GroupBoxView, ButtonView,
    ButtonType, InputView, TextAreaView, SelectView, ListView, LookupView, DatePicker,
    TabsView, PageView
}
    from 'context.vcl/index';

// or we can import a particular file as namespace
import * as utils from 'context.vcl/utils';

// this is just importing one export from project's unit
import { config } from './config';

/* Example of using breeze and jquery */
function test()
{
    var c = $('#myid');
    var c2 = breeze.core;
}

/* add resource files to resource boundle/library, they will be loaded when app initializes */
resources.register('MyApp', [
    'myapp.css'
]);

/** Main routine that's called by requirejs script in index.html */
export function main()
{
    new MyApp(config);
}

/**
 * Our application class. It's sufficient to override method run. 
 * In reality there's no need to subclass Application, but we can do it anyway.
 */
class MyApp extends Application
{

    mainScreen = new MainScreen('mainScreen');

    run()
    {
        this.mainScreen.show();
        test();
    }
}

class MainScreen extends ScreenView
{
    constructor(name?: string)
    {
        super(name);
        
        let pages = new PageView(this, 'pages');
        
        this.testHeaderFooter();
        this.testEdit(this.pages);
        this.testList(this.pages);
        this.testTabs(this.pages);
    }

    // Header, Footer    
    public testHeaderFooter()
    {
        let header = new HeaderView(this, 'header');
        header.text = 'Context Web Components Library - Test Project';
        let footer = new FooterView(this, 'footer');
        footer.text = '(c) 2016 Context Software LLC.';
    }

    // GroupBoxView, InputView, TextAreaView, ButtonView
    public testEdit()
    {
        let grpBox = new GroupBoxView(this);
        grpBox.caption = 'Input Test';
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
        enableInputBtn.events.onclick = (event) =>
        {
            if (input.enabled)
            {
                input.enabled = false;
                enableInputBtn.text = 'Enable';
                enableInputBtn.buttonType = ButtonType.primary;
            }
            else
            {
                input.enabled = true;
                enableInputBtn.text = 'Disable';
                enableInputBtn.buttonType = ButtonType.danger;
            }
        };

        let readOnlyBtn = new ButtonView(grpBox);
        readOnlyBtn.text = 'Read Only';
        readOnlyBtn.buttonType = ButtonType.warning;
        readOnlyBtn.events.onclick = function (event)
        {
            if (input.attributes.readonly)
            {
                delete input.attributes.readonly;
                readOnlyBtn.buttonType = ButtonType.warning;
                readOnlyBtn.text = 'Read Only';
            }
            else
            {
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

    // ListView, LookupView, DatePicker
    public testList()
    {
        let grpBox = new GroupBoxView(this);
        grpBox.style = 'margin-bottom: 10px';
        grpBox.caption = 'List Test';

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

        list.onGetItems = (addItem) =>
        {
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

    public testTabs() {
        let grpBox = new GroupBoxView(this);
        grpBox.style = 'margin-bottom: 10px';
        grpBox.caption = 'Tabs Test';

        let tabs = new TabsView(grpBox);
        tabs.items = ['Tab 1', 'Tab 2', 'Tab 3'];
        tabs.selectedIndex = 0;

        let label = new TextView(grpBox);
        label.style = 'margin-top: 10px; margin-bottom: 20px';

        tabs.onSelectionChange = function (index) {
            label.text = utils.formatStr('Tab {0} selected.', [index + 1]);
        };

        let pages = new PageView(grpBox);

        let page1 = new PanelView(null);
        page1.text = 'This is Page 1';

        let page2 = new PanelView(null);
        page2.text = 'This is Page 2';

        page1.style = page2.style = "padding: 10px"; 
        
        pages.items = [
            { text: 'Page 1', value: page1},
            { text: 'Page 2', value: page2}
        ];

        pages.setPageIndex(0);
        
    }
}