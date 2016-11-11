import { utils } from './utils';
import { IRecord } from './data';
import { application } from './application';
import { IService, Promise } from './service';

export class DataSet {

    adapter: string;
    service: IService;
    tables: DataTable[];

    getService(): IService {
        return this.service || application.mainService;
    }

    fill(): Promise {
        return this.getService().execute(this.adapter, 'select').then( (data) => {
            // fill tables with data
        });
    }
}

export class DataTable {
    records: IRecord[];  
}
