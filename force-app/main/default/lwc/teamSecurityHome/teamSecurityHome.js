import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getFraudsForSecurityTeam from '@salesforce/apex/FraudController.getFraudsForSecurityTeam';
import { security_team_fraud_list_columns } from 'c/fraudCommon'


export default class TeamSecurityHome extends LightningElement {
    isSelectedUnapprovedOnly = true;
    isSelectedAll = false;
    isSelectedApprovedOnly = false;
    columns = security_team_fraud_list_columns;
    data;

    showDetail = false;
    detailFraudId;
    detailFraud;

    handleSelectAll(evt) {
        this.filterFraudList(1);
    }
    handleSelectUnapprovedOnly(evt) {
        this.filterFraudList(2);
    }
    handleSelectApprovedOnly(evt) {
        this.filterFraudList(3);
    }
    filterFraudList(choice) {
        this.isSelectedAll = choice === 1;
        this.isSelectedUnapprovedOnly = choice === 2;
        this.isSelectedApprovedOnly = choice === 3;
        this.refreshFraudList();
    }

    connectedCallback() {
        this.refreshFraudList();
    }

    highlightSelectedFraud() {
        if (!this.data || !this.detailFraudId) {
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
                    cellClass: 'Pending' === f.Approval_Status__c ? 'slds-theme_default' : 'slds-theme_shade',
                };
            }
        })
        this.data = [...newData];
    }

    refreshFraudList() {
        const baseOrgUrl = 'https://' + location.host + '/';
        return getFraudsForSecurityTeam().then(result => {
            this.data = result.filter(r => {
                if (this.isSelectedAll) { 
                    return true;
                } else if (this.isSelectedUnapprovedOnly) {
                    return r.Approval_Status__c === 'Pending';
                } else {
                    return r.Approval_Status__c !== 'Pending';      // either Approved or Rejcted -- Not implemented   
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
                    cellClass: 'Pending' === r.Approval_Status__c ? 'slds-theme_default' : 'slds-theme_shade',
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
        return this.detailFraud && this.detailFraud.Approval_Status__c === 'Pending';
    }

    get showDetailFraudReasonOther() {
        return this.detailFraud && this.detailFraud.Fraud_Reason__c === 'Other';
    }
     
    tryToShowDetail() {
        const result = this.data.find(f => f.Id === this.detailFraudId );
        if (result) {
            this.showDetail = true;
            this.detailFraud = result;
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
