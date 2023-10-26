import TX_DATE      from '@salesforce/schema/Fraud_Item__c.Tx_Date__c';
import MERCHANT     from '@salesforce/schema/Fraud_Item__c.Merchant__c';
import CARD_NUMBER  from '@salesforce/schema/Fraud_Item__c.Card_Number__c';
import ITEM_AMOUNT  from '@salesforce/schema/Fraud_Item__c.Amount__c';

export const fraud_item_actions = [
    { label: 'Update', name: 'itemUpdate', iconName: 'action:edit', },
    { label: 'Clone', name: 'itemClone', iconName: 'action:clone', },
    { label: 'Up', name: 'itemUp', iconName: 'utility:arrowup', },
    { label: 'Down', name: 'itemDown', iconName: 'utility:arrowdown', },
    { label: 'Delete', name: 'itemDelete', iconName: 'action:delete', },
];

export const fraud_item_base_columns = [
    {
        label: 'Transaction Date',
        iconName: 'standard:today',
        fieldName: TX_DATE.fieldApiName,
        type: 'date', 
        typeAttributes: {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        },
    },
    {
        label: 'Merchant',
        iconName: 'standard:store_group',
        fieldName: MERCHANT.fieldApiName,
    },
    {
        label: 'Card Number',
        iconName: 'custom:custom40',
        fieldName: CARD_NUMBER.fieldApiName,
    },
    {
        label: 'Amount',
        iconName: 'custom:custom17',
        fieldName: ITEM_AMOUNT.fieldApiName,
        type: 'currency',
    },
];

export const frontline_team_fraud_list_columns = [
    { label: 'Fraud No.', fieldName: 'Name', cellAttributes: {
        class: { fieldName: 'cellClass' }
    } },
    { label: 'Client Name', fieldName: 'accountUrl', 
            type: 'url', typeAttributes: {label: { fieldName: 'accountName' }, target: '_blank'}, cellAttributes: {
        class: { fieldName: 'cellClass' }
    } },
    { label: 'Fraud Reason', fieldName: 'finalReason', cellAttributes: {
        class: { fieldName: 'cellClass' }
    }},
    { label: 'Fraud Amount', fieldName: 'Fraud_Amount__c', type: 'currency', cellAttributes: {
        class: { fieldName: 'cellClass' }
    }},
    { label: 'Status', fieldName: 'finalStatus' , cellAttributes: {
        class: { fieldName: 'cellClass' }
    }},
    { label: 'Created Date', fieldName: 'CreatedDate', type: 'date', 
        typeAttributes: {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        }, cellAttributes: {
        class: { fieldName: 'cellClass' }
    } },
    { type: 'button', typeAttributes: {
        label: 'Show Detail',
        name: 'showDetail',
        title: 'Detail',
        value: 'View',
    }, cellAttributes: {
        class: { fieldName: 'cellClass' }
    }},
];

export const fraud_team_fraud_list_columns = [
    { label: 'Fraud No.', fieldName: 'Name', cellAttributes: {
        class: { fieldName: 'cellClass' }
    } },
    { label: 'Client Name', fieldName: 'accountUrl', 
            type: 'url', typeAttributes: {label: { fieldName: 'accountName' }, target: '_blank'}, cellAttributes: {
        class: { fieldName: 'cellClass' }
    } },
    { label: 'Active/Total', fieldName: 'activeTotalCount', cellAttributes: {
        class: { fieldName: 'cellClass' }
    } },
    { label: 'Fraud Reason', fieldName: 'finalReason', cellAttributes: {
        class: { fieldName: 'cellClass' }
    }},
    { label: 'Fraud Amount', fieldName: 'Fraud_Amount__c', type: 'currency', cellAttributes: {
        class: { fieldName: 'cellClass' }
    }},
    { label: 'Status', fieldName: 'finalStatus' , cellAttributes: {
        class: { fieldName: 'cellClass' }
    }},
    { label: 'Created Date', fieldName: 'CreatedDate', type: 'date', 
        typeAttributes: {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        }, cellAttributes: {
        class: { fieldName: 'cellClass' }
    } },
    { type: 'button', typeAttributes: {
        label: 'Show Detail',
        name: 'showDetail',
        title: 'Detail',
        value: 'View',
    }, cellAttributes: {
        class: { fieldName: 'cellClass' }
    }},
];