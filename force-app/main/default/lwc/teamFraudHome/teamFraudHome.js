import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getFraudsForFraudTeam from '@salesforce/apex/FraudController.getFraudsForFraudTeam';
import { fraud_team_fraud_list_columns } from 'c/fraudCommon'


export default class TeamFraudHome extends LightningElement {
    isSelectedUnprocessedOnly = true;
    isSelectedAll = false;
    isSelectedProcessedOnly = false;
    columns = fraud_team_fraud_list_columns;
    data;

    showDetail = false;
    detailFraudId;
    detailFraud;

    async handleSelectAll(evt) {
        this.filterFraudList(1);
    }
    async handleSelectUnprocessedOnly(evt) {
        this.filterFraudList(2);
    }
    async handleSelectProcessedOnly(evt) {
        this.filterFraudList(3);
    }
    async filterFraudList(choice) {
        this.isSelectedAll = choice === 1;
        this.isSelectedUnprocessedOnly = choice === 2;
        this.isSelectedProcessedOnly = choice === 3;
        await this.refreshFraudList();
        this.highlightSelectedFraud();
        this.tryToShowDetail();
    }

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
                    cellClass: 'Submitted' === f.Status__c ? 'slds-theme_default' : 'slds-theme_shade',
                };
            }
        })
        this.data = [...newData];
    }

    refreshFraudList() {
        const baseOrgUrl = 'https://' + location.host + '/';
        return getFraudsForFraudTeam().then(result => {
            this.data = result.filter(r => {
                if (this.isSelectedAll) { 
                    return true;
                } else if (this.isSelectedUnprocessedOnly) {
                    return r.Status__c === 'Submitted';
                } else {
                    return r.Status__c !== 'Submitted';     // Pending is not selected at 1st place from DB
                }
            }).map(r => { 
                return {
                    ...r,
                    accountUrl: baseOrgUrl + r.Account__r.Id,
                    activeTotalCount: r.Account__r.Fraud_Pending_Count__c + ' / ' + r.Account__r.Fraud_Total_Count__c,
                    accountName: r.Account__r.Name,
                    finalReason: r.Fraud_Reason__c === 'Other' 
                            ? 'Other - ' + r.Other_Reason_Detail__c : r.Fraud_Reason__c,
                    finalStatus: this.buildFinalStatus(r.Status__c, r.Approval_Status__c),
                    cellClass: 'Submitted' === r.Status__c ? 'slds-theme_default' : 'slds-theme_shade',
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

    get wipFraud() {
        return this.detailFraud && this.detailFraud.Status__c === 'Submitted';
    }

    get showDetailFraudReasonOther() {
        return this.detailFraud && this.detailFraud.Fraud_Reason__c === 'Other';
    }
     
    tryToShowDetail() {
        const result = this.data.find(f => f.Id === this.detailFraudId );
        if (result) {
            this.detailFraud = result;
            this.showDetail = true;
            return true;
        } else {
            this.showDetail = false;
            this.detailFraud = null;
            return false;
        }
    }

    handleHideFraudDetail(evt) {
        this.showDetail = false;
        this.detailFraudId = null;
        this.detailFraud = null;
        this.highlightSelectedFraud();
    }

    async refreshFraudListAndDetail() {
        await this.refreshFraudList();
        this.highlightSelectedFraud();
        this.tryToShowDetail();
    }

    async handleFraudRefresh(evt) {
        this.refreshFraudListAndDetail();
    }

    // ---------------------------
    toastErrorEvent(e) {
        const errEvent = new ShowToastEvent({
            title: 'Fraud List Error',
            message: 'Fail to get Fraud list, error detail : ' + e.body?.message,
            variant: 'error',
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
