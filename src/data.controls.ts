import { utils } from './utils';
import { View, ValueView } from './view';
import { LookupDataLink, EventType, RecordSetSource } from './data';

/**
 * <select> wrapper
 **/
export class SelectView extends ValueView {
    /** Source of records displayed inside the list */
    public lookupData: LookupDataLink; 

    constructor(parent: View, name?: string) {
        super(parent, name);
        this.tag = 'select';
        this.renderClientArea = false;
        this.lookupData = new LookupDataLink((eventType: EventType, data: any): void => {
            this.updateView();
        });
    }
    public render() {
        return this.renderTag(this.renderItems());
    };
    protected renderItems() {
        let html = '';
        for (let i = 0; i < this.lookupData.dataSource.recordCount(); i++) {
            let option = this.lookupData.dataSource.getRecord(i);
            let val = option[this.lookupData.keyField];
            let displayText = this.lookupData.getDisplayValue(option);
            html += '<option value="' + utils.escapeHTML(val) + '">' + utils.escapeHTML(displayText) + '</option>';
        }
        return html;
    }
    protected afterUpdateView() {
        super.afterUpdateView();
        this.handleEvent('onchange', this.handleChange);
    }
    protected handleChange() {
        // retrieve value from element
        this.getValue();
        // update data link
        this.data.value = this._value;
        // invoke event if assigned
        if (this.onChange)
            this.onChange();    
    }
}
