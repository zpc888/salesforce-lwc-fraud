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