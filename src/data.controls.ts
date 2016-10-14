import { utils } from './utils';
import { View, ValueView } from './view';
import { RecordSetSource } from './data';

/**
 * <select> wrapper
 **/
export class SelectView extends ValueView {
    /** Source of records displayed inside the list */
    listSource: RecordSetSource;
    /** listSource field displayed in the list */
    listField: string = 'text';

    constructor(parent: View, name?: string) {
        super(parent, name);
        this.tag = 'select';
        this.renderClientArea = false;
    }

    public render() {
        return this.renderTag(this.renderItems());
    };

    protected renderItems() {
        let html = '';
        for (let i = 0; i < this.listSource.recordCount(); i++) {
            let option = this.listSource.getRecord(i);
            html += '<option>' + utils.escapeHTML(option[this.listField]) + '</option>';

        }
        return html;
    }

}
