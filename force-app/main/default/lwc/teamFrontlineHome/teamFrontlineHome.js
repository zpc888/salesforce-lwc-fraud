import { LightningElement } from 'lwc';
import { deleteRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getFraudsForFrontlineTeam from '@salesforce/apex/FraudController.getFraudsForFrontlineTeam';
import getFraudById from '@salesforce/apex/FraudController.getFraudById';
import FRAUD_OBJECT from '@salesforce/schema/Fraud__c';
import FRAUD_CLIENT_FIELD from '@salesforce/schema/Fraud__c.Account__c';
import FRAUD_REASON_FIELD from '@salesforce/schema/Fraud__c.Fraud_Reason__c';
import FRAUD_OTHER_REASON_FIELD from '@salesforce/schema/Fraud__c.Other_Reason_Detail__c';
import { frontline_team_fraud_list_columns } from 'c/fraudCommon'


export default class TeamFrontlineHome extends LightningElement {
    columns = frontline_team_fraud_list_columns;
    data;

    fraudObjectApi = FRAUD_OBJECT;

    showDetail = false;
    isNewFraud = false;
    detailFraudId;
    detailFraud;
    isDetailFraudInEditMode = false;

    fraudClientField = FRAUD_CLIENT_FIELD;
    fraudReasonField = FRAUD_REASON_FIELD;
    fraudOtherReasonField = FRAUD_OTHER_REASON_FIELD;

    connectedCallback() {
        this.refreshFraudList();
    }

    highlightSelectedFraud() {
        if (!this.data || !this.detailFraudId) {
            // this will keep the previous selection, highlight the selected row
            // if we want to discard the previous selection, re-calc cellClass is needed
            return;
        }
        const newData = this.data.map(f => {
            if (f.Id === this.detailFraudId) {
                return { 
                    ...f, 
                    cellClass: 'slds-theme_success',
                };
            } else {
                return { 
                    ...f, 
                    cellClass: 'Pending' === f.Status__c ? 'slds-theme_default' : 'slds-theme_shade',
                };
            }
        })
        this.data = [...newData];
    }

    refreshFraudList() {
        const baseOrgUrl = 'https://' + location.host + '/';
        return getFraudsForFrontlineTeam().then(r => {
            this.data = r.map(r => { 
                return {
                    ...r,
                    accountUrl: baseOrgUrl + r.Account__r.Id,
                    accountName: r.Account__r.Name,
                    finalReason: r.Fraud_Reason__c === 'Other' 
                            ? 'Other - ' + r.Other_Reason_Detail__c : r.Fraud_Reason__c,
                    finalStatus: this.buildFinalStatus(r.Status__c, r.Approval_Status__c),
                    cellClass: 'Pending' === r.Status__c ? 'slds-theme_default' : 'slds-theme_shade',
                } });
        }).catch(e => {
            this.toastErrorEvent(e);
        });
    }

    handleRowAction(evt) {
        this.detailFraudId = evt.detail.row.Id;
        this.highlightSelectedFraud();
        this.tryToShowDetail();
    }

    async handleNewFraudInserted(evt) {
        this.detailFraudId = evt.detail.fraudId;
        await this.refreshFraudList();
        this.highlightSelectedFraud();
        this.tryToShowDetail();
    }

    get wipFraud() {
        return this.detailFraud && this.detailFraud.Status__c === 'Pending';
    }

    get showDetailFraudReasonOther() {
        return this.detailFraud && this.detailFraud.Fraud_Reason__c === 'Other';
    }
     
    tryToShowDetail() {
        this.showDetail = true;
        const result = this.data.find(f => f.Id === this.detailFraudId );
        if (result) {
            this.detailFraud = result;
            this.isNewFraud = false;
            this.isDetailFraudInEditMode = false;
            return true;
        } else {
            this.isNewFraud = true;
            this.detailFraud = null;
            this.isDetailFraudInEditMode = false;
            return false;
        }
        // return getFraudById({fraudId: this.detailFraudId}).then(r => {
        //     this.detailRecord = r;
        //     this.showDetail = true;
        //     this.isNewFraud = false;
        // }).catch(e => {
        //     this.toastErrorEvent(e);
        // }); 
    }

    handleHideFraudDetail(evt) {
        this.showDetail = false;
        this.isNewFraud = false;
        this.isDetailFraudInEditMode = false;
        this.detailFraudId = null;
        this.detailFraud = null;
        this.highlightSelectedFraud();
    }

    handleFraudDeletion(evt) {
        const deletedFraudId = evt.detail.fraudId;
        deleteRecord(deletedFraudId).then(() => {
            this.showDetail = false;
            this.isNewFraud = false;
            this.isDetailFraudInEditMode = false;
            this.detailFraudId = null;
            this.detailFraud = null;
            const newData = this.data.filter(f => f.Id != deletedFraudId);
            this.data = [...newData];
        }).catch(err => {
            this.toastErrorEvent(err);
        });
    }

    handleEnterFraudUpdateMode(evt) {
        // const toBeEditFraudId = evt.detail.fraudId;
        this.isDetailFraudInEditMode = true;
    }

    async handleFraudUpdatedOk(evt) {
        this.isDetailFraudInEditMode = false;
        // this.detailFraudId = evt.detail.fraudId;
        await this.refreshFraudList();
        this.highlightSelectedFraud();
        this.tryToShowDetail();
    }

    handleNewFraud(evt) {
        this.showDetail = true;
        this.isNewFraud = true;
        this.isDetailFraudInEditMode = false;
        this.detailFraudId = null;
        this.detailFraud = null;
        this.highlightSelectedFraud();
    }

    // ---------------------------
    toastErrorEvent(e) {
        const errEvent = new ShowToastEvent({
            title: 'Fraud List Error',
            message: 'Fail to get Fraud list, error detail : ' + e.body?.message,
            variant: 'error',
            mode: 'dismissable' 
        });
        this.dispatchEvent(errEvent);
    }

    buildFinalStatus(status, approvalStatus) {
        if (!approvalStatus) {
            return status;
        } else if (approvalStatus === 'Approved') {
            return status + ' (Approved)';
        } else {
            return status + ' (Waiting)';
        }
    }
}
