import {
    Application, ScreenView, HeaderView, FooterView, TextView, /*Ajax, Service,*/ TableDataSource, DataTable,
    GridView, PanelView, Align, InputView, GridLayout, Splitter, ButtonView, PostAction, EditAction, CancelAction,
    DeleteAction, InsertAction, Record, DataTableSet, GroupBoxView, ContainerView
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
    protected pageContainer: ContainerView;
    protected actionPanel: PanelView;
    protected loginPanel: PanelView;
    protected registerPanel: PanelView;

    protected initComponents() {
        this.createHeaderFooter();

        this.pageContainer = new ContainerView(this);
        this.pageContainer.style = 'margin: 40px 20px';

        this.showActions();
    }

    protected showActions() {
        if (this.actionPanel) {
            this.pageContainer.showView(this.actionPanel);
            return;
        }

        this.actionPanel = new PanelView(null);


        let grpBox = new GroupBoxView(this.actionPanel);
        grpBox.text = 'Choose Action';

        let loginBtn = new ButtonView(grpBox);
        loginBtn.text = 'Sign in';
        loginBtn.events.onclick = () => {
            this.showLogin();
        };

        let registerBtn = new ButtonView(grpBox);
        registerBtn.text = 'Sign up';
        registerBtn.events.onclick = () => {
            this.showRegister();
        };

        this.pageContainer.showView(this.actionPanel);
    }

    protected showLogin() {
        if (this.loginPanel) {
            this.pageContainer.showView(this.loginPanel);
            return;
        }

        this.loginPanel = new PanelView(null);

        let grpBox = new GroupBoxView(this.loginPanel);
        grpBox.text = 'Sign In';
        grpBox.style = 'width: 500px';

        let layout = new GridLayout(grpBox);

        let userLabel = new TextView(layout);
        userLabel.text = 'User (email): ';
        let userEdit = new InputView(layout);

        let pwdLabel = new TextView(layout);
        pwdLabel.text = 'Password: ';
        let pwdEdit = new InputView(layout);
        pwdEdit.attributes['type'] = 'password';

        layout.rows = [
            [userLabel, userEdit],
            [pwdLabel, pwdEdit]
        ];

        let loginBtn = new ButtonView(grpBox);
        loginBtn.text = 'Login';
        loginBtn.events.onclick = () => {
            let params = {
                email: userEdit.value,
                password: pwdEdit.value
            };
            application.service.execute('Auth', 'login', params).then(
                (response) => {
                    this.showActions();
                });
        };


        this.pageContainer.showView(this.loginPanel);
    }

    protected showRegister() {
        if (this.registerPanel) {
            this.pageContainer.showView(this.registerPanel);
            return;
        }

        this.registerPanel = new PanelView(null);

        let grpBox = new GroupBoxView(this.registerPanel);
        grpBox.text = 'Sign Up';
        grpBox.style = 'width: 500px';

        let layout = new GridLayout(grpBox);

        let emailLabel = new TextView(layout);
        emailLabel.text = 'Email: ';
        let emailEdit = new InputView(layout);

        let firstLabel = new TextView(layout);
        firstLabel.text = 'First Name: ';
        let firstEdit = new InputView(layout);

        let lastLabel = new TextView(layout);
        lastLabel.text = 'Last Name: ';
        let lastEdit = new InputView(layout);

        let pwdLabel1 = new TextView(layout);
        pwdLabel1.text = 'Password: ';
        let pwdEdit1 = new InputView(layout);
        pwdEdit1.attributes['type'] = 'password';

        let pwdLabel2 = new TextView(layout);
        pwdLabel2.text = 'Confirm Password: ';
        let pwdEdit2 = new InputView(layout);
        pwdEdit2.attributes['type'] = 'password';

        let capthcaLabel = new TextView(layout);
        capthcaLabel.tag = 'img';
        let capthcaEdit = new InputView(layout);

        layout.rows = [
            [emailLabel, emailEdit],
            [firstLabel, firstEdit],
            [lastLabel, lastEdit],
            [pwdLabel1, pwdEdit1],
            [pwdLabel2, pwdEdit2],
            [capthcaLabel, capthcaEdit]
        ];

        let registerBtn = new ButtonView(grpBox);
        registerBtn.text = 'Register';
        registerBtn.events.onclick = () => {
            let params = {
                email: emailEdit.value,
                firstName: firstEdit.value,
                lastName: lastEdit.value,
                password1: pwdEdit1.value,
                password2: pwdEdit2.value,
                captcha: capthcaEdit.value
            };
            application.service.execute('Auth', 'register', params).then(
                (response) => {
                    application.service.execute('Auth', 'sendRegistrationConfirmationCode', { email: emailEdit.value });
                    this.showActions();
                });
        };

        application.service.execute('Auth', 'generateRegisterCaptcha').then(
            (response) => {
                (<HTMLImageElement>capthcaLabel.element).src = 'data:image/png;base64,' + response.data.image;
            });

        this.pageContainer.showView(this.registerPanel);
    }

    protected createHeaderFooter() {
        let header = new HeaderView(this, 'header');
        header.text = 'Context Web Components Library - Test Project';
        let footer = new FooterView(this, 'footer');
        footer.text = '(c) 2016 Context Software LLC.';
        header.style = footer.style = 'min-height: 30px; padding-top: 6px;';
    }

}
