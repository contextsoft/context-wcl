import { utils } from './utils';
import { IFuture } from './component';

/** Enumeration of possible data types for fields */
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

/** Holds meta information about fields */
export interface IField {
    fieldName: string;
    dataType: DataType;
    dataSize?: number;
    format?: string;
    required?: boolean;
}

/** Generic expression function */
export interface IExpression {
    (value: IRecord): string;
}

/** Defines a list of fields */
export interface IFields {
    fields: IField[];
}

/** Defines a generic object as a prop->value map */
export interface IRecord {
    [index: string]: any;
}

/** Descrbies an object that could have an active state */
export interface IActive {
    active: boolean;
}

/** Describes an object that contains credentials info */
export interface ICredentials {
    userName: string;
    password: string;
}

/** Describes an object that contains connection params, including credentials */
export interface IConnectionParams extends ICredentials {
    [index: string]: string;
}

/** Describes a set of records with meta-data */
export interface IRecordSet extends IFields {
    recordCount: number;
    getRecord(index: number): IRecord;
}

/** Describes a record set that can be partially fetched */
export interface IPartialSet extends IRecordSet {
    totalCount: number;
    fetch(count: number): IFuture;
}

/** State of editable record */
export enum RecordState { Empty, Browse, Insert, Edit }

/** Describes methods required to edit a record (CRUD) */
export interface IEditableRecord {
    edit(): void;
    post(): void;
    cancel(): void;
    getState(): RecordState;
    oldValue: IRecord;
}

/** Describes methods required to edit a list of records */
export interface IEditableList {
    insert(): void;
    delete(): void;
}

/** Describes a reference to a current record (object) */
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

/** Describes a navigation mechanism on a record set */
export interface ICursor extends IReference {
    eof(): boolean;
    next();
    prior();
    first();
    last();
    recordCount(): number;
    getRecord(index: number): IRecord;
    /** Locates record with values = {field1: value, field2: value} */
    locate(values: any): boolean;
    setFilter(filter: (rec: IRecord) => boolean);
    currentIndex: number;
}

/** Describes an object that can lock updates */
export interface IUpdatable {
    beginUpdate();
    endUpdate();
    isUpdating(): boolean;
}

/** Enumerates types of events generated by data source */
export enum DataEventType { StateChanged, DataChanged, CursorMoved, Refreshed };

/** Describes an object that maintains data links */
export interface IDataSource {
    addLink(link: IDataLink): void;
    removeLink(link: IDataLink): void;
    notifyLinks(eventType: DataEventType, data?: any): void;
}

/** Provides access to a single record of data */
export interface IRecordSource extends IDataSource, IReference, IEditableRecord {
}

/** Provides access to a record set */
export interface IRecordSetSource extends IRecordSource, ICursor, IEditableList {
}

/** Describes a data link located on the control's (data consumer) side */
export interface IDataLink {
    onChange(eventType: DataEventType, data: any): void;
}

/** Event type that raised when something changes in the data source */
export interface IOnDataChangeEvent {
    (eventType: DataEventType, data?: any): void;
}

/** Generic implementation of a data link for single field controls */
export class BaseDataLink<T extends IRecordSource | IRecordSetSource> implements IDataLink {
    public onChangeEvent: IOnDataChangeEvent;
    protected _dataSource: T;

    constructor(onChangeEvent: IOnDataChangeEvent) {
        this.onChangeEvent = onChangeEvent;
    }

    public get dataSource(): T { return this._dataSource; }
    public set dataSource(value: T) { this.setDataSource(value); }

    public onChange(eventType: DataEventType, data?: any): void {
        if (this.onChangeEvent)
            this.onChangeEvent(eventType, data);
    }

    protected setDataSource(value: T) {
        if (this._dataSource !== value) {
            if (this._dataSource)
                this._dataSource.removeLink(this);
            this._dataSource = value;
            if (this._dataSource)
                this._dataSource.addLink(this);
            this.onChange(DataEventType.Refreshed);
        }
    }
}

/**
 * Generic implementation of a data link for single field controls
 */
export class FieldDataLink extends BaseDataLink<IRecordSource> {
    protected _dataField: string;

    constructor(public onChangeEvent: IOnDataChangeEvent, public converter?: IValueConverter) {
        super(onChangeEvent);
    }
    public get dataField() { return this._dataField; }
    public set dataField(value: string) {
        if (this._dataField !== value) {
            this._dataField = value;
            if (this.dataSource)
                this.onChange(DataEventType.Refreshed);
        }
    }
    public get value(): any {
        let res = null;
        if (this._dataSource && this._dataSource.current && this._dataField !== '') {
            if (this._dataField === '*')
                res = utils.extend(this._dataSource.current, {});
            else
                res = this._dataSource.current[this._dataField];
            if (this.converter)
                res = this.converter.decode(this, res);
        }
        return res;
    }
    public set value(val: any) {
        if (this._dataSource && this._dataSource.current && this._dataField !== '') {
            if (this._dataSource.getState() === RecordState.Browse)
                this._dataSource.edit();
            if (this.converter)
                val = this.converter.decode(this, val);
            if (this._dataField === '*')
                utils.assign(val, this._dataSource.current);
            else
                this._dataSource.current[this.dataField] = val;
            this._dataSource.notifyLinks(DataEventType.DataChanged, this._dataField);
        }
    }
}

/**
 * Generic implementation of data link for record sets (list or grid controls)
 */
export class RecordSetDataLink extends BaseDataLink<IRecordSetSource> {
}

/**
 * Generic implementation of a data link for lookup controls
 */
export class LookupDataLink extends RecordSetDataLink {
    protected _keyField: string = 'id';
    protected _displayField: string = 'text';
    protected _displayExpression: IExpression;

    public get keyField() { return this._keyField; }
    public set keyField(value: string) {
        if (this._keyField !== value) {
            this._keyField = value;
            if (this.dataSource)
                this.onChange(DataEventType.Refreshed);
        }
    }
    public get displayField() { return this._displayField; }
    public set displayField(value: string) {
        if (this._displayField !== value) {
            this._displayField = value;
            if (this.dataSource)
                this.onChange(DataEventType.Refreshed);
        }
    }
    public get displayExpression() { return this._displayExpression; }
    public set displayExpression(value: IExpression) {
        if (this._displayExpression !== value) {
            this._displayExpression = value;
            if (this.dataSource)
                this.onChange(DataEventType.Refreshed);
        }
    }
    /** Returns value of record calculated depending on displayExpression  */
    public getDisplayValue(record: IRecord): string {
        if (this._displayExpression)
            return this._displayExpression(record).toString();
        else {
            if (this._displayField && record.hasOwnProperty(this._displayField))
                return record[this._displayField];
            else if (this._keyField && record.hasOwnProperty(this._keyField))
                return record[this._keyField];
            else
                throw 'Display or Key field is not defined or doesn\'t exists in the record';
        }
    }
}

/**
 * Base data source implementation, handling data links
 */
export class BaseSource implements IDataSource {
    /** Creates a list of generic field definitions based on object structure */
    public static getObjectFields(obj: any): IField[] {
        let res: IField[] = [];
        for (let id in obj)
            if (obj.hasOwnProperty(id))
                res.push({
                    fieldName: id,
                    dataType: DataType.String
                });
        return res;
    }

    protected _links: IDataLink[] = [];

    public addLink(link: IDataLink): void {
        this._links.push(link);
    }
    public removeLink(link: IDataLink): void {
        let num = this._links.indexOf(link);
        if (num >= 0)
            this._links.splice(num);
    }
    public notifyLinks(eventType: DataEventType, data?: any): void {
        for (let i = 0; i < this._links.length; i++) {
            this._links[i].onChange(eventType, data);
        }
    }
}

/**
 * Generic implementation of a data source for objects
 */
export class RecordSource extends BaseSource implements IRecordSource {
    protected _state: RecordState;
    protected _current: IRecord;
    protected _oldValue: IRecord = {};
    protected _fields: IField[] = [];

    public checkCurrent() {
        if (!this._current)
            utils.RaiseError('Record does not exist');
    }

    public get current(): IRecord { return this._current; }

    public set current(value: IRecord) {
        if (value !== this._current) {
            if (this._current)
                this.cancel();
            this._current = value;
            this._fields = RecordSource.getObjectFields(value);
            this._state = (value) ? RecordState.Browse : RecordState.Empty;
            this.notifyLinks(DataEventType.Refreshed);
        }
    }

    public get oldValue(): IRecord {
        this.checkCurrent();
        return this._oldValue;
    }

    public get fields(): IField[] {
        return this._fields;
    }

    public edit(): void {
        this.checkCurrent();
        this._oldValue = {};
        utils.assign(this.current, this._oldValue);
        this.setState(RecordState.Edit);
    }

    public post(): void {
        this.checkCurrent();
        this.setState(RecordState.Browse);
    }

    public cancel(): void {
        this.checkCurrent();
        utils.assign(this._oldValue, this.current);
        this._oldValue = {};
        this.setState(RecordState.Browse);
    }

    public getState(): RecordState {
        return this._state;
    }

    protected setState(value: RecordState): void {
        if (this._state !== value) {
            this._state = value;
            this.notifyLinks(DataEventType.StateChanged, value);
        }
    }
}

/**
 * Implementation of record set source for an array of objects 
 */
export class RecordSetSource extends BaseSource implements IRecordSetSource, IUpdatable {
    /** Post or not on scroll and other events */
    public autoPost = false;

    protected _records: IRecord[] = [];
    protected _curIndex = -1;
    protected _state: RecordState;
    protected _oldValue: IRecord = {};
    protected _fields: IField[] = [];
    protected _updateCounter = 0;
    protected _filteredRecords: number[] = [];

    /** Notifies DataLinks with some event and data */
    public notifyLinks(eventType: DataEventType, data?: any): void {
        if (this._updateCounter === 0)
            for (let i = 0; i < this._links.length; i++) {
                this._links[i].onChange(eventType, data);
            }
    }

    /** Begins DataSource update, DataLinks notificatios are off until endUpdate() called */
    public beginUpdate(): void {
        this._updateCounter++;
    }

    /** Ends DataSource update and notifies DataLinks */
    public endUpdate(): void {
        this._updateCounter--;
        if (this._updateCounter === 0)
            this.notifyLinks(DataEventType.Refreshed);
    }

    public isUpdating(): boolean { return this._updateCounter !== 0; }

    /** Sets/gets current record by index */
    public get currentIndex(): number {
        this.checkList();
        return this._curIndex;
    }
    public set currentIndex(value) {
        this.checkList();
        if (value >= this._records.length)
            value = this._records.length - 1;
        if (value !== this._curIndex) {
            this.doAutoPost();
            this._curIndex = value;
            this.notifyLinks(DataEventType.CursorMoved);
        }
    }

    /** Returns current record */
    public get current(): IRecord {
        if (this._curIndex >= 0) {
            if (this._filteredRecords.length > 0)
                return this._records[this._filteredRecords[this._curIndex]];
            else
                return this._records[this._curIndex];
        }
        else
            return null;
    }

    /** Sets object array as DataSource's records */
    public set records(value: IRecord[]) {
        if (value !== this._records) {
            this.doAutoPost();
            this._records = value;
            this._curIndex = (value && value.length > 0) ? 0 : -1;
            this.notifyLinks(DataEventType.Refreshed);
        }
    }

    /** Returns initial values of editable record */
    public get oldValue(): IRecord { return this._oldValue; }

    /** Returns fields list */
    public get fields(): IField[] { return this._fields; }

    /** Returns DataSource state  */
    public getState(): RecordState {
        return this._state;
    }

    public checkList(): void {
        if (!this._records)
            utils.RaiseError('List is not assigned');
    }

    public checkCurrent(): void {
        this.checkList();
        if (!this.current)
            utils.RaiseError('Record does not exist');
    }

    // IEditable methods

    public edit(): void {
        if (this._state === RecordState.Browse) {
            this.checkCurrent();
            this._oldValue = {};
            utils.assign(this.current, this._oldValue);
            this.setState(RecordState.Edit);
        }
    }

    public post(): void {
        if (this._state && this._state !== RecordState.Browse) {
            this.checkCurrent();
            this._oldValue = {};
            this.setState(RecordState.Browse);
        }
    }

    /** Cancels current record editing and returns initial values */
    public cancel(): void {
        if (this._state && this._state !== RecordState.Browse) {
            this.checkCurrent();
            if (this._state === RecordState.Insert)
                this.delete();
            else {
                utils.assign(this._oldValue, this.current);
                this._oldValue = {};
                this.setState(RecordState.Browse);
            }
        }
    }

    public insert(): void {
        this.checkList();
        this.doAutoPost();
        this._records.push({});
        this._curIndex = this._records.length - 1;
        this._oldValue = {};
        this.setState(RecordState.Insert);
    }

    public delete(): void {
        this.checkCurrent();
        this._records.splice(this._curIndex);
        this.setState(RecordState.Browse);
        this.notifyLinks(DataEventType.Refreshed);
        if (this._curIndex >= this._records.length) {
            this._curIndex = this._records.length - 1;
            this.notifyLinks(DataEventType.CursorMoved);
        }
    }

    // ICursor methods

    /** Returns is current record is last */
    public eof(): boolean {
        return this.currentIndex >= this._records.length;
    }

    /** Navigates to next record */
    public next(): void {
        if (!this.eof())
            this.currentIndex++;
    }

    /** Navigates to prior record */
    public prior(): void {
        if (this.currentIndex > 0)
            this.currentIndex--;
    }

    /** Navigates to first record */
    public first(): void {
        this.currentIndex = 0;
    }

    /** Navigates to last record */
    public last(): void {
        this.currentIndex = this.recordCount() - 1;
    }

    /** Returns records count */
    public recordCount(): number {
        if (this._records && this._filteredRecords.length > 0)
            return this._filteredRecords.length;
        else
            return (this._records) ? this._records.length : 0;
    }

    /** Compare 2 objects by their properties */
    public compareRecord(record: IRecord, values: IRecord) {
        for (let id in record) {
            if (record.hasOwnProperty(id) && values.hasOwnProperty(id) && values[id] !== record[id])
                return false;
        }
        return true;
    }

    /** Locates record with specified values and sets it as the current */
    public locate(values: IRecord): boolean {
        for (let i = 0; i < this.recordCount(); i++) {
            if (this.compareRecord(this._records[i], values)) {
                this.currentIndex = i;
                return true;
            }
        }
        return false;
    }

    /** Returns record by index */
    public getRecord(index: number): IRecord {
        if (this._filteredRecords.length > 0)
            return this._records[this._filteredRecords[index]];
        else
            return this._records[index];
    }

    /** Filters DataSource using filter callback */
    public setFilter(filter: (rec: IRecord) => boolean) {
        this._curIndex = 0;
        this._filteredRecords = [];
        let newFilteredRecs = [];
        for (let i = 0; i < this.recordCount(); i++)
            if (filter(this.getRecord(i)))
                newFilteredRecs.push(i);
        this._filteredRecords = newFilteredRecs;
    }

    // protected methods

    protected setState(value: RecordState): void {
        if (this._state !== value) {
            this._state = value;
            this.notifyLinks(DataEventType.StateChanged, value);
        }
    }

    protected doAutoPost() {
        if (this.autoPost)
            this.post();
        else
            this.cancel();
    }
}
