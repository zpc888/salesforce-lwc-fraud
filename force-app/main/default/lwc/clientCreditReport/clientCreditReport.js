import { LightningElement, api } from 'lwc';
import { format_date } from 'c/fraudCommon'
import getClientCreditByFraudId from '@salesforce/apex/FraudController.getClientCreditByFraudId';
import genOrRegenClientCredit from '@salesforce/apex/FraudController.genOrRegenClientCredit';

const TO_VIEW_PDF_ICON = "utility:preview";
const TO_HIDE_PDF_ICON = "utility:hide";

export default class ClientCreditReport extends LightningElement {
    formatDate = format_date;

    _fraudId;

    creditReport;
    reportUrl;

    toggleReportIconName = TO_VIEW_PDF_ICON;

    get hasExistingCreditReport() {
        return this.creditReport?.creditReportId;
    }

    get shouldShowGenCreditReport() {
        return this.creditReport && !this.creditReport.creditReportId;
    }

    @api get fraudId() {
        return this._fraudId;
    }

    set fraudId(newId) {
        this._fraudId = newId;
        this.reportUrl = null;
        this.creditReport = null;
        this.toggleReportIconName = TO_VIEW_PDF_ICON;
        this.refresh();
    }

    get creditScoreDisplay() {
        return this.creditReport?.creditScore;
    }

    get creditDateDisplay() {
        const cd = this.creditReport?.creditDate;
        if (cd) {
            return this.formatDate(cd, true);
        } else {
            return "<Unknown>";
        }
    }

    refresh() {
        getClientCreditByFraudId({fraudId: this._fraudId}).then(data => {
            // clientId, clientName, creditReportId, creditScore, creditDate, docId, contentDocId
            this.creditReport = data;
        }).catch(error => {
            const errEvent = new ShowToastEvent({
                title: 'Error to retrieve Client Credit Report',
                message: 'Fail to Fetch Client Credit Report' + error.body?.message,
                variant: 'error',
            });
            this.dispatchEvent(errEvent);            
            this.creditReport = null;
        });
    }

    handleGenRegenCreditReportClick(event) {
        // if this.creditReport?.id  ==> re-gen  else gen
        this.reportUrl = null;
        this.toggleReportIconName = TO_VIEW_PDF_ICON;
        genOrRegenClientCredit({
            clientId: this.creditReport?.clientId,
            clientName: this.creditReport?.clientName,
            existingReportId: this.creditReport?.creditReportId,
        }).then(data => {
            this.creditReport = data;
        }).catch(error => {
            const errEvent = new ShowToastEvent({
                title: 'Error to Generate Client Credit Report',
                message: 'Fail to Generate Client Credit Report' + error.body?.message,
                variant: 'error',
            });
            this.dispatchEvent(errEvent);            
            this.creditReport = null;
        });
    }

    get toggleReportLabel() {
        return TO_VIEW_PDF_ICON === this.toggleReportIconName ? 
                "View Credit Bureau Report PDF" : "Hide Credit Bureau Report PDF";
    }

    handleToggleReportClick(event) {
        if (this.toggleReportIconName === TO_VIEW_PDF_ICON) {
            this.toggleReportIconName = TO_HIDE_PDF_ICON;
            this.reportUrl = '/sfc/servlet.shepherd/document/download/' + this.creditReport?.contentDocId;
        } else {
            this.toggleReportIconName = TO_VIEW_PDF_ICON;
            this.reportUrl = null;
        }
    }
}
