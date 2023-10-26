public with sharing class FraudController {
    // @AuraEnabled(cacheable = true)
    @AuraEnabled
    public static List<Fraud__c> getFraudsForFrontlineTeam(){
        try {
            List<Fraud__c> myFrauds = [
                SELECT Id, Name, Account__r.Id, Account__r.Name, 
                        Fraud_Amount__c, Fraud_Reason__c, Other_Reason_Detail__c, 
                        Status__c, Approval_Status__c, CreatedDate
                FROM Fraud__c
                WHERE CreatedById = :UserInfo.getUserId()
                ORDER BY Name DESC
            ];
            return myFrauds;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<User> getUserNames(List<String> userIds){
        try {
            return [select Id, Name, UserName from User where Id in :userIds];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }


    @AuraEnabled
    public static Fraud__c getFraudTrackingInfo(String fraudId){
        try {
            Fraud__c fraud = [
                SELECT Id, Name, Status__c, Approval_Status__c, CreatedById, CreatedDate, LastModifiedDate, LastModifiedById,
                    (SELECT OldValue, NewValue, CreatedById, CreatedDate
                     FROM Histories 
                     WHERE Field = 'Status__c' 
                     ORDER BY CreatedDate),
                    (SELECT Id, Name, Document_ID__c, Sign_Status__c, CreatedById, CreatedDate 
                     FROM Attestation_Docs__r)
                FROM Fraud__c
                WHERE Id = :fraudId
            ];
            return fraud;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Fraud__c getFraudById(String fraudId){
        try {
            Fraud__c fraud = [
                SELECT Id, Name, Account__r.Id, Account__r.Name, 
                        Fraud_Amount__c, Fraud_Reason__c, Other_Reason_Detail__c, 
                        Status__c, Approval_Status__c, CreatedDate, lastModifiedDate, 
                        (SELECT Id, Name, Item_Order__c, Tx_Date__c, Card_Number__c, Amount__c, Merchant__c 
                        FROM Fraud_Items__r)
                FROM Fraud__c
                WHERE id = :fraudId
            ];
            return fraud;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<Fraud_Item__c> getFraudItemsByFraudId(String fraudId){
        try {
            List<Fraud_Item__c> ret = [
                SELECT Id, Name, Item_Order__c, Tx_Date__c, Card_Number__c, Amount__c, Merchant__c, Fraud__c
                FROM Fraud_Item__c
                WHERE Fraud__c = :fraudId
                Order By Item_Order__c
            ];
            return ret;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Boolean syncFraudItems(String fraudId, List<Fraud_Item__c> newOrUpdated, List<String> deletedItemIds) {
        try {
            List<Fraud_Item__c> newItems = new List<Fraud_Item__c>();
            List<Fraud_Item__c> oldItems = new List<Fraud_Item__c>();
            for (Fraud_Item__c item: newOrUpdated) {
                if (item.Id == null) {
                    newItems.add(item);
                } else {
                    oldItems.add(item);
                }
            }
            // New
            if (newItems.size() > 0) {
                insert newItems;
            }
            // Update
            if (oldItems.size() > 0) {
                update oldItems;
            }
            // Delete
            if (deletedItemIds != null && deletedItemIds.size() > 0) {
                List<Fraud_Item__c> toBeDeleted = [ SELECT Id, Name FROM Fraud_Item__c WHERE Id in :deletedItemIds ];
                delete toBeDeleted;
            }
            return true;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}