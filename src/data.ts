import { Component, IFuture } from './component';

/** 
 * Enumeration of possible data types for fields 
 */
export enum DataType
{
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
export interface IField
{
    fieldName: string;
    dataType: DataType;
    dataSize?: number;
    format?: string;
    required?: boolean;
}

export interface IObject
{
    [index: string]: any;
}

/**
 * IRecord - describes a plain record of data. Record is required to know its record set
 */
export interface IRecord extends IObject
{
    recordSet: IRecordSet;
    old?: IObject;
}

/**
 * IActive descrbies an object that could have an active state
 */
export interface IActive
{
    active: boolean;
}

/**
 * ICredentials describes an object that contains credentials info
 */
export interface ICredentials
{
    userName: string;
    password: string;
}

/**
 * IConnectionParams describes an object that contains connection params, including credentials
 */
export interface IConnectionParams extends ICredentials
{
    [index: string]: string;
}

/**
 * IRecordSet - describes a set of records with meta-data
 */
export interface IRecordSet
{
    fields: IField[];
    recordCount: number;
    getRecord(index: number): IRecord;
}

/**
 * IPartialSet - describes a record set that can be partially fetched
 */
export interface IPartialSet extends IRecordSet
{
    totalCount: number;
    fetch(count: number): IFuture;
}

/**
 * RecordState enum - the state of editable record
 */
export enum RecordState { Browse, Insert, Edit }

/**
 * IEditable - describes methods required to edit a record (CRUD) 
 */
export interface IEditable
{
    insert(append?: boolean);
    edit();
    post();
    cancel();
    delete();
    getState(): RecordState;
}

/**
 * IReference describes a reference to a current record (object)
 */
export interface IReference
{
    current: IRecord;
}

/**
 * ICursor describes a navigation mechanism on a record set
 */
export interface ICursor extends IReference
{
    eof: boolean;
    next();
    prior();
    first();
    last();
    count: number;
    locate(values: any): boolean;
}

/**
 * IUpdatable describes an object that can lock updates
 */
export interface IUpdatable
{
    beginUpdate();
    endUpdate();
    isUpdating(): boolean;
}

/**
 * EventType - enumerates types of events generated by data source
 */
export enum EventType { StateChanged, DataChanged, CursorMoved, Refreshed };

export interface IDataSource extends ICursor, IEditable, IUpdatable
{
    addLink(link: IDataLink): void;
    removeLink(link: IDataLink): void;
    notifyLinks(eventType: EventType, data: any): void;
    /*
    cursor?: ICursor;
    editable?: IEditable;
    updatable?: IUpdatable;
    */    
}

/**
 * Instance of IValueConverter can be attached to a data link to convert between the formats
 * of data source and data control.  
 */
export interface IValueConverter
{
    /** convert data from dataSource format to dataLink format */
    decode(sender: any, value: any): any;
    /** convert data from dataSource format to dataLink format */
    encode(sender: any, value: any): any;
}

/**
 * IDataLink - describes a data link located on the control's (data consumer) side
 */
export interface IDataLink
{
    dataSource: IDataSource;
    dataField: string;    
    onChange(eventType: EventType, data: any): void;
    converter?: IValueConverter; 
}

/**
 * IOnChangeEvent - event raised when something changes in the data source
 */
export interface IOnChangeEvent
{
    (eventType: EventType, data: any): void;    
}

/**
 * FieldDataLink - a generic implementation of a data link for single field controls
 */
export class FieldDataLink implements IDataLink
{
    protected _dataSource: IDataSource;
    dataField: string;

    constructor (public onChangeEvent: IOnChangeEvent, public converter?: IValueConverter) { }

    get dataSource(): IDataSource { return this._dataSource; }
    set dataSource(value: IDataSource)
    {
        if (this._dataSource != value)
        {
            if (this._dataSource)
                this._dataSource.removeLink(this);
            this._dataSource = value;
            if (this._dataSource)
                this._dataSource.addLink(this);
        }
    }
    onChange(eventType: EventType, data: any): void 
    {
        if (eventType != EventType.StateChanged && this.onChangeEvent)
            this.onChangeEvent(eventType, data);        
    }

    get value(): any {
        let res = null;
        if (this.dataSource && this.dataSource.current && this.dataField != '')
        {                        
            res = this.dataSource.current[this.dataField];
            if (this.converter)
                res = this.converter.decode(this, res);
        } 
        return res;
    }
    set value(val: any) {
        if (this.dataSource && this.dataSource.current && this.dataField != '')
        {
            if (this.dataSource.getState() == RecordState.Browse)
                this.dataSource.edit();
            if (this.converter)
                val = this.converter.decode(this, val);
            this.dataSource.current[this.dataField] = val;
            this.dataSource.notifyLinks(EventType.DataChanged, this.dataField);
        }
    }
}

/**
 * CollectionLink - generic implementation of a data link for list controls
 */
export class CollectionLink // implements ICollectionSource
{

}