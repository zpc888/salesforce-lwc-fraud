import { LightningElement, api } from 'lwc';
// import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import getFraudAttestationByFraudId from '@salesforce/apex/FraudController.getFraudAttestationByFraudId';
import genFraudAttestationDoc from '@salesforce/apex/FraudController.genFraudAttestationDoc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { format_date } from 'c/fraudCommon'

const TO_VIEW_PDF_ICON = "utility:preview";
const TO_HIDE_PDF_ICON = "utility:hide";
// const TO_VIEW_PDF_ICON = "standard:document_preview";
// const TO_HIDE_PDF_ICON = "standard:document";

export default class FraudAttestationReadonly extends LightningElement {
    formatDate = format_date;

    _fraudId;
    @api editable = false;

    attestationInfo;
    pdfUrl;

    timeoutRef;

    toggleUnsignedIconName = TO_VIEW_PDF_ICON;
    toggleSignedIconName = TO_VIEW_PDF_ICON;

    get toggleUnsignedLabel() {
        return TO_VIEW_PDF_ICON === this.toggleUnsignedIconName ? 
                "View Fraud Attestation" : "Hide Fraud Attestation";
    }

    get toggleSignedLabel() {
        return TO_VIEW_PDF_ICON === this.toggleSignedIconName ? 
                "View Signed Attestation" : "Hide Signed Attestation";
    }

    handleToggleUnsignedClick(event) {
        if (this.toggleUnsignedIconName === TO_VIEW_PDF_ICON) {
            if (this.toggleSignedIconName !== TO_VIEW_PDF_ICON) {
                this.toggleSignedIconName = TO_VIEW_PDF_ICON;
            }
            this.toggleUnsignedIconName = TO_HIDE_PDF_ICON;
            // unsigned pdf
            // this.pdfUrl = '/sfc/servlet.shepherd/document/download/069Da0000020zGYIAY';     // 110
            this.pdfUrl = '/sfc/servlet.shepherd/document/download/' + this.attestationInfo?.contentDocId;
        } else {        // unsigned pdf is shown (impossible unsigned + signed are on)
            this.toggleUnsignedIconName = TO_VIEW_PDF_ICON;
            this.pdfUrl = null;
        }
    }

    handleToggleSignedClick(event) {
        if (this.toggleSignedIconName === TO_VIEW_PDF_ICON) {
            if (this.toggleUnsignedIconName !== TO_VIEW_PDF_ICON) {
                this.toggleUnsignedIconName = TO_VIEW_PDF_ICON;
            }
            this.toggleSignedIconName = TO_HIDE_PDF_ICON;
            // this.pdfUrl = sigend-pdf-url
            this.pdfUrl = '/sfc/servlet.shepherd/document/download/' + this.attestationInfo?.signedContentDocId;
        } else {        // signed pdf is shown (impossible unsigned + signed are on)
            this.toggleSignedIconName = TO_VIEW_PDF_ICON;
            this.pdfUrl = null;
        }
    }

    @api get fraudId() {
        return this._fraudId;
    }

    set fraudId(newId) {
        this._fraudId = newId;
        this.pdfUrl = null;
        this.toggleUnsignedIconName = TO_VIEW_PDF_ICON;
        this.toggleSignedIconName = TO_VIEW_PDF_ICON;
        this.attestationInfo = null;
        this.releaseResources();
        this.refresh();
    }

    disconnectedCallback() {
        this.releaseResources();
    }

    releaseResources() {
        if (this.editable && this.timeoutRef) {
            clearTimeout(this.timeoutRef);
            this.timeoutRef = null;
        }
    }

    get isSigned() {
        return this.attestationInfo?.signedDocId;
    }

    get generatedAt() {
        return this.formatDate(this.attestationInfo?.createdDate);
    }

    get signedAt() {
        return this.formatDate(this.attestationInfo?.lastModifiedDate);
    }

    get showGenButton() {
        return this.editable === true || this.editable == 'true';
    }

    refresh() {
        getFraudAttestationByFraudId({fraudId: this._fraudId}).then(data => {
            // id, name, docId, signStatus, signedDocId, 
            // contentDocId, signedContentDocId, createdDate, lastModifiedDate
            if (data.id) {
                this.attestationInfo = data;
                if (this.editable) {
                    this.autoRefreshIfNotSignedYet();
                }
            } else {
                this.attestationInfo = undefined;
            }
        }).catch(error => {
            const errEvent = new ShowToastEvent({
                title: 'Error to retrieve Fraud Attestation',
                message: 'Fail to Fetch Fraud Attestation: ' + error.body?.message,
                variant: 'error',
            });
            this.dispatchEvent(errEvent);            
            this.attestationInfo = undefined;
        })
    }

    autoRefreshIfNotSignedYet() {
        if (this.attestationInfo.signedDocId) {
            this.releaseResources();
        } else {
            this.timeoutRef = setTimeout(() => {
                this.refresh();
            }, 10000);
        }
    }

    genAttestationThenSendUserForSign(event) {
        genFraudAttestationDoc({fraudId: this._fraudId}).then(r => {
            this.attestationInfo = r;
            this.releaseResources();
            this.timeoutRef = setTimeout(() => {
                this.refresh();
            }, 20000);
        }).catch(err => {
            const errEvent = new ShowToastEvent({
                title: 'Fraud Attestation Error',
                message: 'Fail to Generate Fraud Attestation: ' + err.body?.message,
                variant: 'error',
            });
            this.dispatchEvent(errEvent);
            this.attestationInfo = null;
        });
    }

    /*
    @wire(getRelatedListRecords, {
        parentRecordId: '$fraudId',
        relatedListId: 'Attestation_Docs__r',
        fields: ['Fraud_Attestation_Doc__c.Name', 
            'Fraud_Attestation_Doc__c.Document_ID__c',
            'Fraud_Attestation_Doc__c.Sign_Status__c', 
            'Fraud_Attestation_Doc__c.Signed_Document_ID__c']
    })
    getFraudAttestation({ error, data }) {
        if (data) {
            if (data.records?.length > 0) {
                const first = data.records[0];
                this.attestationName = first.fields.Name.value;
                this.attestationDocId = first.fields.Document_ID__c.value;
                this.attestationDocStatus = first.fields.Sign_Status__c.value;
                this.attestationSignedDocId = first.fields.Signed_Document_ID__c?.value;
            } else {
                this.attestationName = undefined;
                this.attestationDocId = undefined;
                this.attestationDocStatus = undefined;
                this.attestationSignedDocId = undefined;
            }
            error = undefined;
        } else if (error) {
            const errEvent = new ShowToastEvent({
                title: 'Error to retrieve Fraud Attestation',
                message: 'Fail to Fetch Fraud Attestation: ' + error.body?.message,
                variant: 'error',
            });
            this.dispatchEvent(errEvent);            
            this.attestationName = undefined;
            this.attestationDocId = undefined;
            this.attestationDocStatus = undefined;
            this.attestationSignedDocId = undefined;
        }
    }
    */
}