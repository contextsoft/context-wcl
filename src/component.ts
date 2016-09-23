import { application } from './application';

/**
 * Interface with RTTI
 * TODO: RTTI
 */
export interface IInterface {

}

export interface IVoidEvent extends IInterface {
    (): void;
}

export interface IDOMEvent extends IInterface {
    (event): void;
}

/** Root for all components */
export class Component {
    public static getFunctionName(func) {
        if (typeof func !== 'function')
            throw ('Not a function');
        let funcNameRegex = /function (.{1,})\(/;
        if (func.name)
            return func.name;
        else {
            let results = funcNameRegex.exec(func.toString());
            return (results && results.length > 1) ? results[1] : '';
        }
    }

    /** Returns object's constructor function name */
    public static getObjectClassName(obj) {
        return Component.getFunctionName(obj.constructor);
    }

    /** Global component counter */
    protected static nextComponentId = 1;

    /** Component's name */
    public name: string;

    constructor(name?: string) {
        this.name = name || (this.getDefaultName() + (Component.nextComponentId++));
    }

    /** Returns component class name i.e. constructor name  */
    public getClassName() {
        return Component.getObjectClassName(this);
    }

    /** Localizes string into selected language */
    public L(str) {
        return application.L(str);
    }

    protected getDefaultName() {
        let n = this.getClassName().toLowerCase();
        return n;
    }
}







