import { BaseDataLink, IRecordSource, IRecordSetSource, EventType, RecordState } from './data';
import { BaseAction } from './actions';

export class RecordSourceAction extends BaseAction {
    protected link: BaseDataLink;

    constructor(dataSource?: IRecordSource) {
        super();
        this.link = new BaseDataLink((eventType: EventType, data?: any): void => {
            this.updateAction();
        });
        this.link.dataSource = dataSource;
        this.setDefaults();
        if (this.timeToUpdateTargets())
            this.notifyTargets();
    };
    get dataSource(): IRecordSource { return this.link.dataSource; }
    set dataSource(value: IRecordSource) { this.link.dataSource = value; }
    public timeToUpdateTargets(): boolean {
        return this.link.dataSource != null;
    }
    public setDefaults() {
        // implement in descendants       
    }
    public updateAction() {
        // implement in descendants
    }
    public execute(sender: any) {
        // implement in descendants
    }
}

export class RecordSetSourceAction extends BaseAction {
    protected link: BaseDataLink;

    constructor(dataSource?: IRecordSetSource) {
        super();
        this.link = new BaseDataLink((eventType: EventType, data?: any): void => {
            this.updateAction();
        });
        this.link.dataSource = dataSource;
        this.setDefaults();
        this.updateAction();
        if (this.timeToUpdateTargets())
            this.notifyTargets()
    };
    get dataSource(): IRecordSetSource { return <IRecordSetSource>this.link.dataSource; }
    set dataSource(value: IRecordSetSource) { this.link.dataSource = value; }
    public timeToUpdateTargets(): boolean {
        return this.dataSource != null;
    }
    public setDefaults() {
        // implement in descendants       
    }
    public updateAction() {
        // implement in descendants
    }
    public execute(sender: any) {
        // implement in descendants
    }
}


export class EditAction extends RecordSourceAction {
    public setDefaults() {
        this._caption = 'Edit';
    }
    public updateAction() {
        this.enabled = this.link.dataSource && (this.link.dataSource.getState() == RecordState.Browse);
    }
    public execute(sender: any) {
        if (this.enabled && this.link.dataSource)
            this.link.dataSource.edit();
    }
}

export class PostAction extends RecordSourceAction {
    public setDefaults() {
        this._caption = 'Post';
    }
    public updateAction() {
        this.enabled = this.link.dataSource && (this.link.dataSource.getState() == RecordState.Edit);
    }
    public execute(sender: any) {
        if (this.enabled && this.link.dataSource)
            this.link.dataSource.post();
    }
}

export class CancelAction extends RecordSourceAction {
    public setDefaults() {
        this._caption = 'Cancel';
    }
    public updateAction() {
        this.enabled = this.link.dataSource && (this.link.dataSource.getState() == RecordState.Edit);
    }
    public execute(sender: any) {
        if (this.enabled && this.link.dataSource)
            this.link.dataSource.cancel();
    }
}

export class DeleteAction extends RecordSetSourceAction {
    public setDefaults() {
        this._caption = 'Delete';
    }
    public updateAction() {
        this.enabled = this.dataSource && (this.dataSource.current != null);
    }
    public execute(sender: any) {
        if (this.enabled && this.dataSource)
            this.dataSource.delete();
    }
}

export class InsertAction extends RecordSetSourceAction {
    public setDefaults() {
        this._caption = 'Insert';
    }
    public updateAction() {
        this.enabled = this.dataSource != null;
    }
    public execute(sender: any) {
        if (this.enabled && this.dataSource)
            this.dataSource.insert();
    }
}
