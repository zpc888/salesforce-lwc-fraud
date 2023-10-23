import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getFraudItemsByFraudId from '@salesforce/apex/FraudController.getFraudItemsByFraudId';

import FRAUD_OBJECT from '@salesforce/schema/Fraud__c';
import FRAUD_CLIENT_FIELD from '@salesforce/schema/Fraud__c.Account__c';
import FRAUD_REASON_FIELD from '@salesforce/schema/Fraud__c.Fraud_Reason__c';
import FRAUD_OTHER_REASON_FIELD from '@salesforce/schema/Fraud__c.Other_Reason_Detail__c';
import FRAUD_STATUS_FIELD from '@salesforce/schema/Fraud__c.Status__c';
import FRAUD_APPROVAL_STATUS_FIELD from '@salesforce/schema/Fraud__c.Approval_Status__c';

import TX_DATE      from '@salesforce/schema/Fraud_Item__c.Tx_Date__c';
import MERCHANT     from '@salesforce/schema/Fraud_Item__c.Merchant__c';
import CARD_NUMBER  from '@salesforce/schema/Fraud_Item__c.Card_Number__c';
import ITEM_AMOUNT  from '@salesforce/schema/Fraud_Item__c.Amount__c';

const FRAUD_ITEM_RO_COLS = [
    {
        label: 'Transaction Date',
        iconName: 'standard:today',
        fieldName: TX_DATE.fieldApiName,
        type: 'date', 
        typeAttributes: {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        },
    },
    {
        label: 'Merchant',
        iconName: 'standard:store_group',
        fieldName: MERCHANT.fieldApiName,
    },
    {
        label: 'Card Number',
        iconName: 'custom:custom40',
        fieldName: CARD_NUMBER.fieldApiName,
    },
    {
        label: 'Amount',
        iconName: 'custom:custom17',
        fieldName: ITEM_AMOUNT.fieldApiName,
        type: 'currency',
    },
];

export default class TeamFrontlineReadonly extends LightningElement {
    fraudObjectApi = FRAUD_OBJECT;
    fraudClientField = FRAUD_CLIENT_FIELD;
    fraudReasonField = FRAUD_REASON_FIELD;
    fraudOtherReasonField = FRAUD_OTHER_REASON_FIELD;
    fraudStatusField = FRAUD_STATUS_FIELD;
    fraudApprovalStatusField = FRAUD_APPROVAL_STATUS_FIELD;

    @api fraudId;
    @api fraudNumber;
    @api showFraudReasonOther;

    itemCols = FRAUD_ITEM_RO_COLS;
    itemData;

    get fraudTotalAmount() {
        return (this.itemData || [])
                .map(i => Number(i.Amount__c))
                .filter(a => !isNaN(a))
                .reduce((a, b) => a + b, 0);
    }

    connectedCallback() {
        getFraudItemsByFraudId({fraudId: this.fraudId}).then(r => {
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