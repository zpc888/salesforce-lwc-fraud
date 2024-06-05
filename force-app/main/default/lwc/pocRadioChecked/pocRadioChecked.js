import { LightningElement } from 'lwc';

export default class PocRadioChecked extends LightningElement {
    checked = '';

    handleRadioClick(event) {
        this.checked = 'checked';
    }
}