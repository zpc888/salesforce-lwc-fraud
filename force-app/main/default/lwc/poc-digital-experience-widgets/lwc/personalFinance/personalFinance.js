import { LightningElement, api } from 'lwc';

export default class PersonalFinance extends LightningElement {
    @api value = {
        y2023Income: 200000,
        y2023Asset: 380000,
        liability: 18280
    }
}