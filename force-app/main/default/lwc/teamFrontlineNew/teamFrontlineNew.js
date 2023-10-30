import { LightningElement } from 'lwc';
import FraudItemModal from 'c/fraudItemModal';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import FRAUD_OBJECT from '@salesforce/schema/Fraud__c';
import FRAUD_CLIENT_FIELD from '@salesforce/schema/Fraud__c.Account__c';
import FRAUD_REASON_FIELD from '@salesforce/schema/Fraud__c.Fraud_Reason__c';
import FRAUD_OTHER_REASON_FIELD from '@salesforce/schema/Fraud__c.Other_Reason_Detail__c';

// import ITEM_ID from '@salesforce/schema/Fraud_Item__c.Id';
// import FRAUD_MASTER from '@salesforce/schema/Fraud_Item__c.Fraud__c';
// import ITEM_ORDER   from '@salesforce/schema/Fraud_Item__c.Item_Order__c';

import syncFraudItems from '@salesforce/apex/FraudController.syncFraudItems';

import { fraud_item_base_columns, fraud_item_actions } from 'c/fraudCommon'

export default class TeamFrontlineNew extends LightningElement {
    fraudObjectApi = FRAUD_OBJECT;
    fraudClientField = FRAUD_CLIENT_FIELD;
    fraudReasonField = FRAUD_REASON_FIELD;
    fraudOtherReasonField = FRAUD_OTHER_REASON_FIELD;

    detailFraudId;
    showDetailFraudReasonOther = false;

    itemCols = [...fraud_item_base_columns, {
        type: 'action', typeAttributes: { rowActions: fraud_item_actions, }, 
    }];
    kidCounter = 0;
    itemData = [];
    deletedItemIds = [];

    handleDetailFraudReasonChanged(evt) {
        this.showDetailFraudReasonOther = evt.detail?.value === 'Other';
    }

    handleHideFraudDetail(evt) {
        const event = new CustomEvent('hidefrauddetailclick', { 
            detail: {
                sourceComponent: 'NewFraudComponent'
            }
        });
        this.dispatchEvent(event);
    }

    handleSuccess(event) {
        this.detailFraudId = event.detail.id;
        const itemVOs = this.itemData.map((item, index) => {
            item.Item_Order__c = index + 1;
            item.Fraud__c = this.detailFraudId;
            return item;
        });
        syncFraudItems({
            fraudId: this.detailFraudId,
            newOrUpdated: itemVOs,
            deletedItemIds: this.deletedItemIds,
        }).then(r => {
            const okEvent = new CustomEvent('insertnewfraudok', {
                detail: {
                    fraudId: this.detailFraudId,
                },
            });
            this.dispatchEvent(okEvent);
        }).catch(err => {
            const errEvent = new ShowToastEvent({
                title: 'Transaction Items Sync Error',
                message: 'Fail to add/update/delete Transaction Items: ' + err.body?.message,
                variant: 'error',
            });
            this.dispatchEvent(errEvent);
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        if (!this.itemData || this.itemData.length === 0) {
            const errEvent = new ShowToastEvent({
                title: 'No Transaction Items',
                message: 'No Fraud Items, Please Enter At Least One Transaction Item',
                variant: 'error',
                mode: 'dismissable',
            });
            this.dispatchEvent(errEvent);
            return;
        }
        const fields = event.detail.fields;
        fields.Status__c = 'Pending';
        this.template.querySelector('lightning-record-edit-form').submit(fields);
    }

    handleReset(event) {
        const inputFields = this.template.querySelectorAll('lightning-input-field');
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            });
        }
    }

    handleItemRowAction(event) {
        const actionName = event.detail.action.name;
        const itemRow = event.detail.row;
        switch (actionName) {
            case 'itemDelete':
                if (itemRow.Id) {           // only to track old item, new item just simply deleted
                    this.deletedItemIds.push(itemRow.Id);
                }
                this.itemData = this.itemData.filter(i => i.kid != itemRow.kid);
                break;
            case 'itemUpdate':
                this.launchItemModalForCUD({...itemRow, isNewItem: false,});
                break;
            case 'itemClone':
                const newItem = {...itemRow, isNewItem: true,};
                newItem.kid = --this.kidCounter;
                newItem.Id = null;
                this.launchItemModalForCUD(newItem);
                break;
            case 'itemUp':
                this.moveItem(itemRow, -1);
                break;
            case 'itemDown':
                this.moveItem(itemRow, 1);
                break;
            default:
                console.log('Unimplemented action: ' + actioName);
        }
    }

    moveItem(item, offset) {
        const idx1 = this.itemData.findIndex(i => i.kid === item.kid);
        const idx2 = idx1 + offset;
        if (idx2 < 0 || idx2 >= this.itemData.length) {
            return;
        }
        const newData = [...this.itemData];
        newData[idx1] = newData[idx2];
        newData[idx2] = item;
        this.itemData = newData;
    }

    get fraudTotalAmount() {
        return this.itemData.map(i => Number(i.Amount__c)).filter(a => !isNaN(a)).reduce((a, b) => a + b, 0);
    }

    async handleNewItem(event) {
        const newItem = { kid: --this.kidCounter, isNewItem: true, };
        this.launchItemModalForCUD(newItem);
    }

    async launchItemModalForCUD(fraudItem) {
        const result = await FraudItemModal.open({
            size: 'small',
            fraudItem,
        });
        // console.log(JSON.stringify(result));
        if (result) {
            if (result.deleted) {                           // deletion
                this.itemData = this.itemData.filter(i => i.kid !== result.kid);
                if (result.Id) {
                    this.deletedItemIds.push(result.Id);
                }
            } else if (result.kid === this.kidCounter) {    // add new
                this.itemData = [...this.itemData, result];
            } else {                                        // update
                const newData = this.itemData.map(i => i.kid === result.kid ? result : i);
                this.itemData = [...newData];               // must itemData reference being changed, it doesn't care about item changes
            }
        }
        // else the modal was cancelled
    }
}