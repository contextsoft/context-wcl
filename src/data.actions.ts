import { BaseDataLink, IRecordSource, IRecordSetSource, DataEventType, RecordState } from './data';
import { BaseAction } from './actions';

export class RecordSourceAction extends BaseAction {
    protected link: BaseDataLink<IRecordSource>;

    constructor(dataSource?: IRecordSource) {
        super();
        this.link = new BaseDataLink<IRecordSource>((eventType: DataEventType, data?: any): void => {
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
    protected link: BaseDataLink<IRecordSetSource>;

    constructor(dataSource?: IRecordSetSource) {
        super();
        this.link = new BaseDataLink<IRecordSetSource>((eventType: DataEventType, data?: any): void => {
            this.updateAction();
        });
        this.link.dataSource = dataSource;
        this.setDefaults();
        this.updateAction();
        if (this.timeToUpdateTargets())
            this.notifyTargets();
    };
    get dataSource(): IRecordSetSource { return this.link.dataSource; }
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
    public execute(sender?: any) {
        // implement in descendants
    }
}

export class EditAction extends RecordSourceAction {
    public setDefaults() {
        this._caption = 'Edit';
    }
    public updateAction() {
        this.enabled = (this.link.dataSource && (this.link.dataSource.getState() === RecordState.Browse) && this.link.dataSource.current) ? true : false;
    }
    public execute(sender?: any) {
        if (this.enabled && this.link.dataSource) {
            this.link.dataSource.edit();
            if (this.onExecute)
                this.onExecute(sender);
        }
    }
}

export class PostAction extends RecordSourceAction {
    public setDefaults() {
        this._caption = 'Post';
    }

    public updateAction() {
        this.enabled = this.link.dataSource && (this.link.dataSource.getState() === RecordState.Edit || this.link.dataSource.getState() === RecordState.Insert);
    }

    public execute(sender?: any) {
        if (this.enabled && this.link.dataSource)
            if (this.onCanExecute)
                this.onCanExecute(sender).then(() => { this.doExecute(); });
            else
                this.doExecute(sender);
    }

    protected doExecute(sender?: any) {
        this.link.dataSource.post();
        if (this.onExecute)
            this.onExecute(sender);
    }
}

export class CancelAction extends RecordSourceAction {
    public setDefaults() {
        this._caption = 'Cancel';
    }

    public updateAction() {
        this.enabled = this.link.dataSource && (this.link.dataSource.getState() === RecordState.Edit || this.link.dataSource.getState() === RecordState.Insert);
    }

    public execute(sender?: any) {
        if (this.enabled && this.link.dataSource)
            if (this.onCanExecute)
                this.onCanExecute(sender).then(() => { this.doExecute(); });
            else
                this.doExecute(sender);
    }

    protected doExecute(sender?: any) {
        this.link.dataSource.cancel();
        if (this.onExecute)
            this.onExecute(sender);
    }
}

export class DeleteAction extends RecordSetSourceAction {
    public setDefaults() {
        this._caption = 'Delete';
    }

    public updateAction() {
        this.enabled = this.dataSource && (this.dataSource.current != null);
    }

    public execute(sender?: any) {
        if (this.enabled && this.dataSource) {
            if (this.onCanExecute)
                this.onCanExecute(sender).then(() => { this.doExecute(); });
            else
                this.doExecute();
        }
    }

    protected doExecute(sender?: any) {
        this.dataSource.delete();
        if (this.onExecute)
            this.onExecute(sender);
    }
}

export class InsertAction extends RecordSetSourceAction {
    public setDefaults() {
        this._caption = 'Insert';
    }

    public updateAction() {
        this.enabled = this.dataSource != null;
    }

    public execute(sender?: any) {
        if (this.enabled && this.dataSource) {
            if (this.onCanExecute)
                this.onCanExecute(sender).then(() => { this.doExecute(); });
            else
                this.doExecute(sender);
        }
    }

    protected doExecute(sender?: any) {
        this.dataSource.insert();
        if (this.onExecute)
            this.onExecute(sender);
    }
}
