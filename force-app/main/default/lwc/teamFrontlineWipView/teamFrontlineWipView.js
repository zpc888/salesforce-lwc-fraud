import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import LightningConfirm from 'lightning/confirm';
import getFraudItemsByFraudId from '@salesforce/apex/FraudController.getFraudItemsByFraudId';

import FRAUD_OBJECT from '@salesforce/schema/Fraud__c';
import FRAUD_CLIENT_FIELD from '@salesforce/schema/Fraud__c.Account__c';
import FRAUD_REASON_FIELD from '@salesforce/schema/Fraud__c.Fraud_Reason__c';
import FRAUD_OTHER_REASON_FIELD from '@salesforce/schema/Fraud__c.Other_Reason_Detail__c';

import TX_DATE      from '@salesforce/schema/Fraud_Item__c.Tx_Date__c';
import MERCHANT     from '@salesforce/schema/Fraud_Item__c.Merchant__c';
import CARD_NUMBER  from '@salesforce/schema/Fraud_Item__c.Card_Number__c';
import ITEM_AMOUNT  from '@salesforce/schema/Fraud_Item__c.Amount__c';

import { fraud_item_base_columns } from 'c/fraudCommon'

export default class TeamFrontlineWipView extends LightningElement {
    fraudObjectApi = FRAUD_OBJECT;
    fraudClientField = FRAUD_CLIENT_FIELD;
    fraudReasonField = FRAUD_REASON_FIELD;
    fraudOtherReasonField = FRAUD_OTHER_REASON_FIELD;

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
        // TODO: ideally it should check status again to avoid stale status, if in stale, it should dispatch a refresh-event
        // to be bulletproof, we should add trigger check at sobject for updation and deletion by frontline users
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
                sourceComponent: 'WipFraudView'
            }
        });
        this.dispatchEvent(event);
    }

    handleFraudProcessAction(evt) {
        const event = new CustomEvent('refreshfraud', { 
            detail: {
                sourceComponent: 'WipFraudView',
                fraudId: this.fraudId,
            }
        });
        this.dispatchEvent(event);
    }

    handleUpdateFraudDetail(evt) {
        const event = new CustomEvent('updatefraudclick', { 
            detail: {
                sourceComponent: 'WipFraudView',
                fraudId: this.fraudId,
            }
        });
        this.dispatchEvent(event);        
    }

    async handleDeleteFraudDetail(evt) {
       const confirmed = await LightningConfirm.open({ 
            message: 'Are you sure to delete this Fraud No. ' + this.fraudNumber + "?",
            variant: 'headerless',
            label: 'Confirmation',
            theme: 'warning',
       });
       if (confirmed) {
        const event = new CustomEvent('deletefraudclick', { 
            detail: {
                sourceComponent: 'WipFraudView',
                fraudId: this.fraudId,
            }
        });
        this.dispatchEvent(event);        
       }
    }
}
