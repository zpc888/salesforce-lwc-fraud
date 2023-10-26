import { LightningElement, api } from 'lwc';
import LightningAlert from 'lightning/alert';
import { updateRecord } from "lightning/uiRecordApi";
import FRAUD_ID_FIELD from '@salesforce/schema/Fraud__c.Id';
import FRAUD_STATUS_FIELD from '@salesforce/schema/Fraud__c.Status__c';
import FRAUD_APPROVAL_STATUS_FIELD from '@salesforce/schema/Fraud__c.Approval_Status__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getFraudTrackingInfo from '@salesforce/apex/FraudController.getFraudTrackingInfo';
import getUserNames from '@salesforce/apex/FraudController.getUserNames';

const ACTIVE_COLOR = 'rgb(144, 238, 144)';
const INACTIVE_COLOR = 'rgb(211, 211, 211)';
const CONNECTOR_COLOR = 'rgb(0, 0, 0)';

const ACTIVE_NODE_STYLE = `fill:${ACTIVE_COLOR};stroke:${CONNECTOR_COLOR};stroke-width:3`;
const DEFAULT_NODE_STYLES = {
        start: `fill:${ACTIVE_COLOR};stroke:${CONNECTOR_COLOR};stroke-width:2`,
        frontline: `fill:${INACTIVE_COLOR};stroke:${CONNECTOR_COLOR};stroke-width:3`,
        fraud: `fill:${INACTIVE_COLOR};stroke:${CONNECTOR_COLOR};stroke-width:3`,
        security: `fill:${INACTIVE_COLOR};stroke:${CONNECTOR_COLOR};stroke-width:3`,
        end: `fill:${INACTIVE_COLOR};stroke:${CONNECTOR_COLOR};stroke-width:2`,
};

export default class FraudProcessFlow extends LightningElement {
    _fraudId;
    fraudTrackingInfo;

    frontlineAge = "";
    fraudAge = "";
    securityAge = "";

    @api whichUser = "frontline";       // frontline, fraud, security -- which drives the available actions based on Fraud status
    @api fraudInEditingMode = false;

    nodeStyles = {...DEFAULT_NODE_STYLES};
    textStyles = {
        start: "font-family:Sans,Arial;",
        frontline: "font-family:Sans,Arial;",
        fraud: "font-family:Sans,Arial;",
        security: "font-family:Sans,Arial;",
        end: "font-family:Sans,Arial;",
    };
    lineStyles = {
        toFrontline: `stroke:${CONNECTOR_COLOR};stroke-width:4`,
        toFraud: `stroke:${CONNECTOR_COLOR};stroke-width:4`,
        toSecurity: `stroke:${CONNECTOR_COLOR};stroke-width:4`,
        toEnd: `stroke:${CONNECTOR_COLOR};stroke-width:4`,
    }
    arrowStyles = {
        toFrontline: `fill:${CONNECTOR_COLOR};stroke:${CONNECTOR_COLOR};stroke-width:4`,
        toFraud: `fill:${CONNECTOR_COLOR};stroke:${CONNECTOR_COLOR};stroke-width:4`,
        toSecurity: `fill:${CONNECTOR_COLOR};stroke:${CONNECTOR_COLOR};stroke-width:4`,
        toEnd: `fill:${CONNECTOR_COLOR};stroke:${CONNECTOR_COLOR};stroke-width:4`,
    }

    status;
    approvalStatus;
    createdAt;
    submitToFraudTeamAt;
    submitToSecurityTeamAt;
    approvedAt;
    createdBy;
    submitToFraudTeamBy;
    submitToSecurityTeamBy;
    approvedBy;

    set fraudId(newId) {
        this._fraudId = newId;
        if (!newId) {
            this.resetToDefaultStyle();
            return;
        }
        getFraudTrackingInfo({fraudId: newId}).then(r => {
            this.fraudTrackingInfo = r;
            this.resetToDefaultStyle();
            [this.status, this.approvalStatus, this.createdAt, this.createdBy] = 
                    [r.Status__c, r.Approval_Status__c ?? null, r.CreatedDate, r.CreatedById];
            if (this.status === 'Pending') {                     // in frontline team
                this.prepareInFrontlineTeam(r);
            } else if (!this.approvalStatus) {                   // in fraud team
                this.prepareInFraudTeam(r);
            } else if (this.approvalStatus === 'Pending') {     // in security team
                this.prepareInSecurityTeam(r);
            } else {                                        // Approved   -- Completed
                this.prepareInEndStage(r);
            }
            const userIds = [this.createdBy, this.submitToFraudTeamBy, this.submitToSecurityTeamAt, this.approvedBy];
            getUserNames({userIds: userIds.filter(u => u)}).then(usernames => {
                this.createdBy = this.lookupUserName(this.createdBy, usernames);
                this.submitToFraudTeamBy = this.lookupUserName(this.submitToFraudTeamBy, usernames);
                this.submitToSecurityTeamBy = this.lookupUserName(this.submitToSecurityTeamBy, usernames);
                this.approvedBy = this.lookupUserName(this.approvedBy, usernames);
            }).catch(getUserNameErr => {
                this.toastErrorEvent(getUserNameErr);
            })
            this.createdAt = this.formatDate(this.createdAt);
            this.submitToFraudTeamAt = this.formatDate(this.submitToFraudTeamAt);
            this.submitToSecurityTeamAt = this.formatDate(this.submitToSecurityTeamAt);
            this.approvedAt = this.formatDate(this.approvedAt);
        }).catch(err => {
            this.toastErrorEvent(err);
        });
    }

    lookupUserName(userId, userNameList) {
        if (!userId) {
            return userId;
        }
        const found = userNameList.find(u => u.Id === userId) ?? null;
        if (found) {
            return found.Name;
        } else {
            return userId;
        }
    }

    prepareInFrontlineTeam(r) {
        this.nodeStyles.frontline = ACTIVE_NODE_STYLE;
        this.frontlineAge = this.calcPeriod(this.createdAt, new Date());
    }

    prepareInFraudTeam(r) {
        this.prepareInFrontlineTeam(r);
        this.nodeStyles.fraud = ACTIVE_NODE_STYLE;
        const toFraudTeamHistoryRecord = r.Histories.find(h => h.NewValue === 'Submitted') ?? null;
        if (toFraudTeamHistoryRecord) {
            this.submitToFraudTeamAt = toFraudTeamHistoryRecord.CreatedDate;
            this.submitToFraudTeamBy = toFraudTeamHistoryRecord.CreatedById;

            this.frontlineAge = this.calcPeriod(this.createdAt, this.submitToFraudTeamAt);
            this.fraudAge = this.calcPeriod(this.submitToFraudTeamAt, new Date());
        }
    }

    prepareInSecurityTeam(r) {
        this.prepareInFraudTeam(r);
        this.nodeStyles.security = ACTIVE_NODE_STYLE;
        const toSecurityTeamHistoryRecord = r.Histories.find(h => h.NewValue !== 'Submitted') ?? null;
        if (toSecurityTeamHistoryRecord) {
            this.submitToSecurityTeamAt = toSecurityTeamHistoryRecord.CreatedDate;
            this.submitToSecurityTeamBy = toSecurityTeamHistoryRecord.CreatedById;

            this.fraudAge = this.calcPeriod(this.submitToFraudTeamAt, this.submitToSecurityTeamAt);
            this.securityAge = this.calcPeriod(this.submitToSecurityTeamAt, new Date());
        }
    }

    prepareInEndStage(r) {
        this.prepareInSecurityTeam(r);
        this.nodeStyles.end = ACTIVE_NODE_STYLE;
        this.approvedAt = r.LastModifiedDate;
        this.approvedBy = r.LastModifiedById;

        if (this.submitToSecurityTeamAt) {
            this.securityAge = this.calcPeriod(this.submitToSecurityTeamAt, this.approvedAt);
        }
    }

    async handleFrontlineProcessAction(event) {
        const processAction = this.refs.frontlineAction?.value;
        if (!processAction) {
            await LightningAlert.open({
                message: 'Please choose a process action',
                theme: 'error', 
                label: 'Missing Process Action!', 
            });
            return;
        }
        const fields = {};
        fields[FRAUD_ID_FIELD.fieldApiName] = this.fraudId;
        fields[FRAUD_STATUS_FIELD.fieldApiName] = 'Submitted';
        const recordInput = { fields };
        updateRecord(recordInput).then( () => {
            const submitToFraudEvent = new CustomEvent('submittofraudteam', {
                detail: {
                    fraudId: this.fraudId,
                },
            });
            this.dispatchEvent(submitToFraudEvent);
        }).catch(err => {
            const errEvent = new ShowToastEvent({
                title: 'Fail to submit to Fraud Team',
                message: 'Fail to submit to Fraud Team, error detail : ' + err.body?.message,
                variant: 'error',
            });
            this.dispatchEvent(errEvent);
        });
    }

    async handleFraudProcessAction(event) {
        const processAction = this.refs.fraudAction?.value;
        if (!processAction) {
            await LightningAlert.open({
                message: 'Please choose a process action',
                theme: 'error', 
                label: 'Missing Process Action!', 
            });
            return;
        }
        if (processAction === 'Verified') {
            // ensure attestation document is signed
            const attestationDocs = this.fraudTrackingInfo.Attestation_Docs__r;
            let errType = 0;
            if (!attestationDocs || attestationDocs.length === 0) {
                errType = 1;    // missing doc generation
            } else if (attestationDocs[0].Sign_Status__c === 'Completed') {
                errType = 0;    // no error
            } else {
                errType = 2;    // not signed yet
            }
            if (errType > 0) {
                await LightningAlert.open({
                    message: errType === 1 ? 'Please send attentation document to user for signing' : 'User has not signed the attestation document yet',
                    theme: 'error', 
                    label: errType === 1 ? 'Attestation document is not generated yet' : 'Missing user signature', 
                });
                return;                
            }
        }
        const fields = {};
        fields[FRAUD_ID_FIELD.fieldApiName] = this.fraudId;
        fields[FRAUD_STATUS_FIELD.fieldApiName] = processAction;
        fields[FRAUD_APPROVAL_STATUS_FIELD.fieldApiName] = 'Pending';
        const recordInput = { fields };
        updateRecord(recordInput).then( () => {
            const submitToSecurityEvent = new CustomEvent('submittosecurityteam', {
                detail: {
                    fraudId: this.fraudId,
                    bubbles: true,
                    composed: true,
                },
            });
            this.dispatchEvent(submitToSecurityEvent);
        }).catch(err => {
            const errEvent = new ShowToastEvent({
                title: 'Fail to submit to Security Team',
                message: 'Fail to submit to Security Team, error detail : ' + err.body?.message,
                variant: 'error',
            });
            this.dispatchEvent(errEvent);
        });
    }

    async handleSecurityProcessAction(event) {
        const processAction = this.refs.securityAction?.value;
        if (!processAction) {
            await LightningAlert.open({
                message: 'Please choose a process action',
                theme: 'error', 
                label: 'Missing Process Action!', 
            });
            return;
        }
        const fields = {};
        fields[FRAUD_ID_FIELD.fieldApiName] = this.fraudId;
        fields[FRAUD_APPROVAL_STATUS_FIELD.fieldApiName] = 'Approved';
        const recordInput = { fields };
        updateRecord(recordInput).then( () => {
            const approvedBySecurityEvent = new CustomEvent('approvedbysecurityteam', {
                detail: {
                    fraudId: this.fraudId,
                    bubbles: true,
                    composed: true,
                },
            });
            this.dispatchEvent(approvedBySecurityEvent);
        }).catch(err => {
            const errEvent = new ShowToastEvent({
                title: 'Fail to approve by Security Team',
                message: 'Fail to approve by Security Team, error detail : ' + err.body?.message,
                variant: 'error',
            });
            this.dispatchEvent(errEvent);
        });
    }

    get showTimeline() {
        return typeof this.fraudId === 'string';
    }

    get frontlineTeamActions() {
        if (typeof this.fraudId === 'string' && !this.fraudInEditingMode) {
            if (this.whichUser === 'frontline' && this.status === 'Pending') {
                return [
                    { label: 'Hand over to Fraud Team', value: 'Submitted' },
                ];
            }
        }
        return null;
    }

    get fraudTeamActions() {
        if (typeof this.fraudId === 'string' && !this.fraudInEditingMode) {
            if (this.whichUser === 'fraud' && this.status === 'Submitted') {
                return [
                    { label: 'Not a fraud and close it', value: 'Closed' },
                    { label: 'Verified the fraud case', value: 'Verified' },
                ];
            }
        }
        return null;
    }

    get securityTeamActions() {
        if (typeof this.fraudId === 'string' && !this.fraudInEditingMode) {
            if (this.whichUser === 'security' && (this.status === 'Closed' || this.status === 'Verified')) {
                return [
                    { label: 'Approve "' + this.status + '" action by Fraud Team', value: 'Approved' },
                ];
            }
        }
        return null;
    }

    @api get fraudId() {
        return this._fraudId;
    }

    formatDate(i) {
        if (!i) {
            return i;
        }
        let d = i;
        if (typeof i === 'string') {
            d = new Date();
            d.setTime(Date.parse(i));
        }
        return new Intl.DateTimeFormat('en-CA', {
            year: 'numeric', month: 'numeric', day: 'numeric', 
            hour: 'numeric', minute: 'numeric', hour12: true,
            timeZone: "America/Toronto",
        }).format(d);
    }

    calcPeriod(i1, i2) {
        let [d1, d2] = [i1, i2];
        if (typeof d1 === 'string') {
            d1 = Date.parse(d1);
        }
        if (typeof d2 === 'string') {
            d2 = Date.parse(d2);
        }
        const isDateType = x => x && Object.prototype.toString.call(x) === "[object Date]";
        const t1 = isDateType(d1) ? d1.getTime() : (d1 ?? (new Date()).getTime());
        const t2 = isDateType(d2) ? d2.getTime() : (d2 ?? (new Date()).getTime());
        const gapInSecs = Math.abs( Math.floor((t1 - t2)/1000) );
        const th = Math.floor( gapInSecs / 3600 );
        const d = Math.floor( th / 24 );
        const h = th % 24;
        const m = Math.floor( (gapInSecs % 3600) / 60 );
        let ret = "";
        if (d != 0) {
            ret += d + "d";
        }
        if (h != 0) {
            ret += h + "h";
        }
        if (m != 0) {
            ret += m + "m";
        }
        if (d === 0 && h === 0 && m < 3) {
            ret = "< 3 minutes";
        }
        return ret;
    }

    resetToDefaultStyle() {
        this.fraudTrackingInfo = null;
        this.nodeStyles = {...DEFAULT_NODE_STYLES};
        this.frontlineAge = "";
        this.fraudAge = "";
        this.securityAge = "";

        this.createdAt = null;
        this.submitToFraudTeamAt = null;
        this.submitToSecurityTeamAt = null;
        this.approvedAt = null;
        this.createdBy = null;
        this.submitToFraudTeamBy = null;
        this.submitToSecurityTeamBy = null;
        this.approvedBy = null;

        if (this.refs.frontlineAction?.value) {
            this.refs.frontlineAction.value = null;
        }
        if (this.refs.fraudAction?.value) {
            this.refs.fraudAction.value = null;
        }
        if (this.refs.securityAction?.value) {
            this.refs.securityAction.value = null;
        }
    }

    toastErrorEvent(e) {
        const errEvent = new ShowToastEvent({
            title: 'Get Fraud Tracking Error',
            message: 'Fail to get Fraud Tracking Info, error detail : ' + e.body?.message,
            variant: 'error',
            mode: 'dismissable' 
        });
        this.dispatchEvent(errEvent);
    }    
}
