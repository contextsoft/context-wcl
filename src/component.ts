import { utils } from './utils';

/**
 * Interface with RTTI
 * TODO: RTTI
 */
// export interface IInterface {
// }

/**
 * IFuture interface - return type for methods returning async results
 */
export interface IFuture {
    then(callback: any): IFuture;
}

/** 
 * Instance factory - interface for when we need to produce instances of unknown type 
 */
export interface InstanceFactory<T> {
    new (): T;
}

export interface IVoidEvent {
    (): void;
}

export interface IDOMEvent {
    (event: Event): void;
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
        return utils.L(str);
    }

    protected getDefaultName() {
        let n = this.getClassName().toLowerCase();
        return n;
    }
}
