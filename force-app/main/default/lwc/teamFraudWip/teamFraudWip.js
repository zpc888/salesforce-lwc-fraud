import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getFraudItemsByFraudId from '@salesforce/apex/FraudController.getFraudItemsByFraudId';

import FRAUD_OBJECT from '@salesforce/schema/Fraud__c';
import FRAUD_CLIENT_FIELD from '@salesforce/schema/Fraud__c.Account__c';
import FRAUD_REASON_FIELD from '@salesforce/schema/Fraud__c.Fraud_Reason__c';
import FRAUD_OTHER_REASON_FIELD from '@salesforce/schema/Fraud__c.Other_Reason_Detail__c';

import { fraud_item_base_columns } from 'c/fraudCommon'

export default class TeamFraudWip extends LightningElement {
    fraudObjectApi = FRAUD_OBJECT;
    fraudClientField = FRAUD_CLIENT_FIELD;
    fraudReasonField = FRAUD_REASON_FIELD;
    fraudOtherReasonField = FRAUD_OTHER_REASON_FIELD;

    _fraudId;
    @api fraudNumber;
    @api showFraudReasonOther;

    // iframe src to point to attestationPdf, but security keeps saying failure
    // this.attestationPdf = 'data:application/pdf;base64,' + r;

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

}
