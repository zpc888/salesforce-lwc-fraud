import { api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import LightningModal from 'lightning/modal';

export default class FraudItemModal extends LightningModal {
    _frautItem;
    txDate;
    merchant;
    cardNumber;
    amount;
    isNewFraudItem;

    set fraudItem(item) {
        this._frautItem = item;
        this.txDate = item.Tx_Date__c;
        this.merchant = item.Merchant__c;
        this.cardNumber = item.Card_Number__c
        this.amount = item.Amount__c;
        this.isNewFraudItem = item.isNewItem ?? false;
    }

    @api get fraudItem() {
        return this._frautItem;
    }

    get fraudItemTitle() {
        return this.isNewFraudItem ? 'Create New Fraud Item' : 'Maintain Old Fraud Item';
    }

    get isValid() {
        return this.txDate
            && this.merchant
            && this.isValidCardNumber(this.cardNumber)
            && this.amount && this.amount > 0;
    }

    handleInputChange(event) {
        // salesforce LWC is not two-way binding
        const src = event.target.name;
        const val = event.target.value;
        if (src === 'txDate') {
            this.txDate = val;
        } else if (src === 'merchant') {
            this.merchant = val;
        } else if (src === 'cardNumber') {
            this.cardNumber = val;
        } else if (src === 'amount') {
            this.amount = val;
        }
    }

    tryToDelete() {
        this.close(Object.assign({}, this.fraudItem, {deleted: true}));
    }

    tryToSave() {
        if (this.isValid) {
            const ret = Object.assign({}, this.fraudItem, {
                Tx_Date__c: this.txDate,
                Merchant__c: this.merchant,
                Card_Number__c: this.cardNumber,
                Amount__c: this.amount,
            });
            this.close(ret);
        } else {
            const errEvent = new ShowToastEvent({
                title: 'Validation Error',
                message: 'All input fields are mandatory and amount must be > 0, card must have at least 3 digits',
                variant: 'error',
                mode: 'dismissable' 
            });
            this.dispatchEvent(errEvent);
        }
    }

    isValidCardNumber(card) {
        const num = Number(card);
        if (isNaN(num)) {
            return false;
        } else {
            return card.length >= 3;
        }
    }
}