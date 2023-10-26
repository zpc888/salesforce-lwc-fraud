import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getFraudItemsByFraudId from '@salesforce/apex/FraudController.getFraudItemsByFraudId';

import FRAUD_OBJECT from '@salesforce/schema/Fraud__c';
import FRAUD_CLIENT_FIELD from '@salesforce/schema/Fraud__c.Account__c';
import FRAUD_REASON_FIELD from '@salesforce/schema/Fraud__c.Fraud_Reason__c';
import FRAUD_OTHER_REASON_FIELD from '@salesforce/schema/Fraud__c.Other_Reason_Detail__c';
import FRAUD_STATUS_FIELD from '@salesforce/schema/Fraud__c.Status__c';
import FRAUD_APPROVAL_STATUS_FIELD from '@salesforce/schema/Fraud__c.Approval_Status__c';

import { fraud_item_base_columns } from 'c/fraudCommon'

export default class TeamFraudReadonly extends LightningElement {
    fraudObjectApi = FRAUD_OBJECT;
    fraudClientField = FRAUD_CLIENT_FIELD;
    fraudReasonField = FRAUD_REASON_FIELD;
    fraudOtherReasonField = FRAUD_OTHER_REASON_FIELD;
    fraudStatusField = FRAUD_STATUS_FIELD;
    fraudApprovalStatusField = FRAUD_APPROVAL_STATUS_FIELD;

    _fraudId;
    @api fraudNumber;
    @api showFraudReasonOther;

    itemCols = [...fraud_item_base_columns];
    itemData;

    get fraudTotalAmount() {
        return (this.itemData || [])
                .map(i => Number(i.Amount__c))
                .filter(a => !isNaN(a))
                .reduce((a, b) => a + b, 0);
    }

    @api get fraudId() {
        return this._fraudId;
    }

    set fraudId(fid) {
        this._fraudId = fid;
        getFraudItemsByFraudId({fraudId: fid}).then(r => {
            this.itemData = r.map(i => {
                return {
                    ...i,
                    kid: i.Id,
                };
            });
        }).catch(err => {
            const errEvent = new ShowToastEvent({
                title: 'Transaction Items Retrieve Error',
                message: 'Fail to Fetch Fraud Items: ' + err.body?.message,
                variant: 'error',
                mode: 'dismissable',
            });
            this.dispatchEvent(errEvent);
        });
    }

    handleHideFraudDetail(evt) {
        const event = new CustomEvent('hidefrauddetailclick', { 
            detail: {
                sourceComponent: 'ReadonlyFraudComponent'
            }
        });
        this.dispatchEvent(event);
    }

}