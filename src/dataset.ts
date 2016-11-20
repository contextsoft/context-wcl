//import { utils } from './utils';
import { IRecord } from './data';
import { application } from './application';
import { IService, IResponse } from './service';

export class TableDataSet {
    public adapter: string;
    public service: IService;
    public records: IRecord[];

    constructor(adapter?: string) {
        this.adapter = adapter;
    }

    public fill(): Promise<IRecord[]> {
        return this.getService().execute(this.adapter, 'select').then((response: IResponse) => {
            this.records = response.data.records;
            return this.records;
        });
    }

    public updateRecord(index: number): Promise<void> {
        return this.getService().execute(this.adapter, 'update', this.records[index]);
    }

    public insertRecord(index: number): Promise<string> {
        return this.getService().execute(this.adapter, 'insert', this.records[index]).then((response: IResponse) => {
            let keyField = Object.keys(response.data)[0];
            this.records[index][keyField] = response.data[keyField];
            return this.records[index][keyField];
        });
    }

    public deleteRecord(index: number): Promise<void> {
        return this.getService().execute(this.adapter, 'delete', this.records[index]);
    }

    protected getService(): IService {
        return this.service || application.service;
    }
}

