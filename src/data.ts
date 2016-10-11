import { utils } from './utils';
import { Component, IFuture } from './component';

/** 
 * Enumeration of possible data types for fields 
 */
export enum DataType {
    Unknown,
    String,
    Integer,
    Double,
    Date,
    DateTime,
    Boolean,
    Blob
}

/**
 *  IField - holds meta information about fields
 */
export interface IField {
    fieldName: string;
    dataType: DataType;
    dataSize?: number;
    format?: string;
    required?: boolean;
}

/** 
 * IFields - defines a list of fields
 */
export interface IFields {
    fields: IField[];
}

/**
 * IRecord - defined a generic object as a prop->value map
 */
export interface IRecord {
    [index: string]: any;
}

/**
 * IActive descrbies an object that could have an active state
 */
export interface IActive {
    active: boolean;
}

/**
 * ICredentials describes an object that contains credentials info
 */
export interface ICredentials {
    userName: string;
    password: string;
}

/**
 * IConnectionParams describes an object that contains connection params, including credentials
 */
export interface IConnectionParams extends ICredentials {
    [index: string]: string;
}

/**
 * IRecordSet - describes a set of records with meta-data
 */
export interface IRecordSet extends IFields {
    recordCount: number;
    getRecord(index: number): IRecord;
}

/**
 * IPartialSet - describes a record set that can be partially fetched
 */
export interface IPartialSet extends IRecordSet {
    totalCount: number;
    fetch(count: number): IFuture;
}

/**
 * RecordState enum - the state of editable record
 */
export enum RecordState { Empty, Browse, Insert, Edit }

/**
 * IEditableRecord - describes methods required to edit a record (CRUD) 
 */
export interface IEditableRecord {
    edit(): void;
    post(): void;
    cancel(): void;
    getState(): RecordState;
    oldValue: IRecord;
}

/**
 * IEditableList - describes methods required to edit a list of records
 */
export interface IEditableList {
    insert(): void;
    delete(): void;
}

/**
 * IReference describes a reference to a current record (object)
 */
export interface IReference extends IFields {
    current: IRecord;
}

/**
 * Instance of IValueConverter can be attached to a data link to convert between the formats
 * of data source and data control.  
 */
export interface IValueConverter {
    /** convert data from dataSource format to dataLink format */
    decode(sender: any, value: any): any;
    /** convert data from dataSource format to dataLink format */
    encode(sender: any, value: any): any;
}

/**
 * ICursor describes a navigation mechanism on a record set
 */
export interface ICursor extends IReference {
    eof(): boolean;
    next();
    prior();
    first();
    last();
    count(): number;
    locate(values: any): boolean;
}

/**
 * IUpdatable describes an object that can lock updates
 */
export interface IUpdatable {
    beginUpdate();
    endUpdate();
    isUpdating(): boolean;
}

/**
 * EventType - enumerates types of events generated by data source
 */
export enum EventType { StateChanged, DataChanged, CursorMoved, Refreshed };

/**
 * IDataSource describes an object that maintains data links 
 */
export interface IDataSource {
    addLink(link: IDataLink): void;
    removeLink(link: IDataLink): void;
    notifyLinks(eventType: EventType, data?: any): void;
}

/**
 * IRecordSource provides access to a single record of data
 */
export interface IRecordSource extends IDataSource, IReference, IEditableRecord {

}

/**
 * IRecordSetSource - provides access to a record set 
 */
export interface IRecordSetSource extends IRecordSource, ICursor, IEditableList {

}

/**
 * IDataLink - describes a data link located on the control's (data consumer) side
 */
export interface IDataLink {
    onChange(eventType: EventType, data: any): void;
}

/**
 * IOnChangeEvent - event raised when something changes in the data source
 */
export interface IOnChangeEvent {
    (eventType: EventType, data: any): void;
}

/**
 * SimpleDataLink - a generic implementation of a data link for single field controls
 */
export class SimpleDataLink implements IDataLink {
    protected _dataSource: IRecordSource;
    dataField: string;

    constructor(public onChangeEvent: IOnChangeEvent, public converter?: IValueConverter) { }

    get dataSource(): IRecordSource { return this._dataSource; }
    set dataSource(value: IRecordSource) {
        if (this._dataSource != value) {
            if (this._dataSource)
                this._dataSource.removeLink(this);
            this._dataSource = value;
            if (this._dataSource)
                this._dataSource.addLink(this);
        }
    }
    onChange(eventType: EventType, data: any): void {
        if (this.onChangeEvent)
            this.onChangeEvent(eventType, data);
    }
}

/**
 * FieldDataLink - a generic implementation of a data link for single field controls
 */
export class FieldDataLink extends SimpleDataLink {
    get value(): any {
        let res = null;
        if (this.dataSource && this.dataSource.current && this.dataField != '') {
            res = this.dataSource.current[this.dataField];
            if (this.converter)
                res = this.converter.decode(this, res);
        }
        return res;
    }
    set value(val: any) {
        if (this.dataSource && this.dataSource.current && this.dataField != '') {
            if (this.dataSource.getState() == RecordState.Browse)
                this.dataSource.edit();
            if (this.converter)
                val = this.converter.decode(this, val);
            this.dataSource.current[this.dataField] = val;
            this.dataSource.notifyLinks(EventType.DataChanged, this.dataField);
        }
    }
}

export function getObjectFields(obj: any): IField[] {
    let res: IField[] = [];
    for (let id in obj)
        if (obj.hasOwnProperty(id))
            res.push({
                fieldName: id,
                dataType: DataType.String
            })
    return res;
}

export class BaseSource implements IDataSource {
    protected _links: IDataLink[] = [];

    addLink(link: IDataLink): void {
        this._links.push(link);
    }
    removeLink(link: IDataLink): void {
        let num = this._links.indexOf(link);
        if (num >= 0)
            this._links.splice(num);
    }
    notifyLinks(eventType: EventType, data?: any): void {
        for (let i = 0; i < this._links.length; i++) {
            this._links[i].onChange(eventType, data);
        }
    }
}

/**
 * SimpleSource - generic implementation of a data source for objects
 */
export class SimpleSource extends BaseSource implements IRecordSource {
    protected _state: RecordState;
    protected _current: IRecord;
    protected _oldValue: IRecord = {};
    protected _fields: IField[] = [];

    protected setState(value: RecordState): void {
        if (this._state != value) {
            this._state = value;
            this.notifyLinks(EventType.StateChanged, value);
        }
    }

    checkCurrent() {
        if (!this._current)
            utils.RaiseError('Record does not exist');
    }

    get current(): IRecord { return this._current; }

    set current(value: IRecord) {
        if (value != this._current) {
            this.cancel();
            this._current = value;
            this._fields = getObjectFields(value);
            this._state = (value) ? RecordState.Browse : RecordState.Empty;
            this.notifyLinks(EventType.Refreshed);
        }
    }

    get oldValue(): IRecord {
        this.checkCurrent();
        return this._oldValue;
    }

    get fields(): IField[] { return this._fields; }

    edit(): void {
        this.checkCurrent();
        this._oldValue = {};
        utils.assign(this.current, this._oldValue);
        this.setState(RecordState.Edit);
    }
    post(): void {
        this.checkCurrent();
        this.setState(RecordState.Browse);
    }
    cancel(): void {
        this.checkCurrent();
        utils.assign(this._oldValue, this.current);
        this._oldValue = {};
        this.setState(RecordState.Browse);
    }
    getState(): RecordState {
        return this._state;
    }
}

/**
 * ListSource - implementation of record set source for an array of objects 
 */
export class ListSource extends BaseSource implements IRecordSetSource, IUpdatable {

    protected _list = [];
    protected _curIndex = -1;
    protected _state: RecordState;
    protected _oldValue: IRecord = {};
    protected _fields: IField[] = [];
    protected _updateCounter = 0;

    notifyLinks(eventType: EventType, data?: any): void {
        if (this._updateCounter == 0)
            for (let i = 0; i < this._links.length; i++) {
                this._links[i].onChange(eventType, data);
            }
    }

    beginUpdate(): void {
        this._updateCounter++;
    }

    endUpdate(): void {
        this._updateCounter--;
        if (this._updateCounter == 0)
            this.notifyLinks(EventType.Refreshed);
    }

    isUpdating(): boolean { return this._updateCounter != 0; }

    get currentIndex(): number {
        this.checkList();
        return this._curIndex;
    }

    set currentIndex(value) {
        this.checkList();
        if (value >= this._list.length)
            value = this._list.length - 1;
        if (value != this._curIndex) {
            this.post();
            this._curIndex = value;
            this.notifyLinks(EventType.CursorMoved);
        }
    }

    protected setState(value: RecordState): void {
        if (this._state != value) {
            this._state = value;
            this.notifyLinks(EventType.StateChanged, value);
        }
    }

    get current(): IRecord {
        return ((this._curIndex >= 0)) ? this._list[this._curIndex] : null;
    }

    set list(value: any[]) {
        if (value != this._list) {
            this.post();
            this._list = value;
            this._curIndex = (value && value.length > 0) ? 0 : -1;
            this.notifyLinks(EventType.Refreshed);
        }
    }
    get oldValue(): IRecord { return this._oldValue; }

    get fields(): IField[] { return this._fields; }

    getState(): RecordState {
        return this._state;
    }
    checkList(): void {
        if (!this._list)
            utils.RaiseError('List is not assigned');
    }
    checkCurrent(): void {
        this.checkList();
        if (!this.current)
            utils.RaiseError('Record does not exist');
    }

    // Editable methods

    edit(): void {
        if (this._state == RecordState.Browse) {
            this.checkCurrent();
            this._oldValue = {};
            utils.assign(this.current, this._oldValue);
            this.setState(RecordState.Edit);
        }
    }
    post(): void {
        if (this._state != RecordState.Browse) {
            this.checkCurrent();
            this._oldValue = {};
            this.setState(RecordState.Browse);
        }
    }
    cancel(): void {
        if (this._state != RecordState.Browse) {
            this.checkCurrent();
            utils.assign(this._oldValue, this.current);
            this._oldValue = {};
            this.setState(RecordState.Browse);
        }
    }
    insert(): void {
        this.checkList();
        this.post();
        this._list.push({});
        this._curIndex = this.list.length - 1;
        this._oldValue = {};
        this.setState(RecordState.Insert);
    }
    delete(): void {
        this.checkCurrent();
        this.cancel();
        this._list.splice(this._curIndex);
        if (this._curIndex >= this.list.length)
            this._curIndex = this.list.length - 1;
        this.notifyLinks(EventType.CursorMoved);
    }

    // Cursor methods

    eof(): boolean {
        return this.currentIndex >= this._list.length;
    }
    next(): void {
        if (!this.eof())
            this.currentIndex++;
    }
    prior(): void {
        if (this.currentIndex > 0)
            this.currentIndex--;
    }
    first(): void {
        this.currentIndex = 0;
    }
    last(): void {
        this.currentIndex = this.count() - 1;
    }
    count(): number {
        return (this._list) ? this._list.length : 0;
    }
    compareRecord(obj, values) {
        for (let id in obj) {
            if (obj.hasOwnProperty(id) && values.hasOwnProperty(id) && values[id] != obj)
                return false;
        }
        return true;
    }
    locate(values: any): boolean {
        for (let i = 0; i < this.count(); i++) {
            if (this.compareRecord(this._list[i], values)) {
                this.currentIndex = i;
                return true;
            }
        }
        return false;
    }
}