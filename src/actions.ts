import { Component } from './component';

/** Action handling component */

export interface IOnActionExecute {
    (sender: any): void;
}

export interface IAction {
    enabled: boolean;
    visible: boolean;
    icon: string;
    caption: string;
    execute(sender: any, event: any): void;
    addTarget(view: IActionTarget): void;
    removeTarget(link: IActionTarget): void;
    notifyTargets(): void;
}

export interface IActionTarget {
    onActionChanged(sender: IAction);
}

export class BaseAction implements IAction {
    protected _enabled: boolean = true;
    protected _visible: boolean = true;
    protected _icon: string;
    protected _caption: string;
    protected _targets: IActionTarget[] = [];

    constructor(public onExecute?: IOnActionExecute) {}

    get enabled(): boolean { return this._enabled; }
    set enabled(value) {
        if (this._enabled != value) {
            this._enabled = value;
            this.notifyTargets();
        }
    }
    get visible(): boolean { return this._visible; }
    set visible(value) {
        if (this._visible != value) {
            this._visible = value;
            this.notifyTargets();
        }
    }
    get icon(): string { return this._icon; }
    set icon(value) {
        if (this._icon != value) {
            this._icon = value;
            this.notifyTargets();
        }
    }
    get caption(): string { return this._caption; }
    set caption(value) {
        if (this._caption != value) {
            this._caption = value;
            this.notifyTargets();
        }
    }
    public execute(sender: any) {
        if (this.onExecute)
            this.onExecute(sender);
    }
    public addTarget(target: IActionTarget): void {
        this._targets.push(target);
    }
    public removeTarget(link: IActionTarget): void {
        let num = this._targets.indexOf(link);
        if (num >= 0)
            this._targets.splice(num);
    }
    public notifyTargets() {
        for (let i = 0; i < this._targets.length; i++) {
            this._targets[i].onActionChanged(this);
        }
    }        
}

