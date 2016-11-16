import { utils } from './utils';
import { IRecord } from './data';
import { application } from './application';
import { IService, IResponse } from './service';

export class DataSet {
    public adapter: string;
    public service: IService;
    //public tables: DataTable[];

    public records: IRecord[];
    public fields: any[];

    constructor(adapter?: string) {
        this.adapter = adapter;
    }

    public fill(): Promise<IRecord[]> {
        return this.getService().execute(this.adapter, 'select').then((response: IResponse) => {
            this.records = response.data.rows;
            this.fields = response.data.fields;
            return this.records;
        });
    }

    protected getService(): IService {
        return this.service || application.service;
    }
}

export class DataTable {
    records: IRecord[];
}
