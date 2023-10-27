public with sharing class FraudController {
    @AuraEnabled
    public static String genFraudAttestationDoc(String fraudId){
        // String base64PDF = 'JVBERi0xLjYKJfbk/N8KMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovVmVyc2lvbiAvMS42Ci9QYWdlcyAyIDAgUgo+PgplbmRvYmoKMTEgMCBvYmoKPDwKL0xlbmd0aCA1OTgKL0ZpbHRlciAvRmxhdGVEZWNvZGUKPj4Kc3RyZWFtDQp4nI2Tz47aMBDG73mKOfSwlZZgO47tcFugrFqp3WrhBdxgSiqIV46p1Lfv2CTb8KcBcTDyeL7ffDOT8dz8rkrz+jyFsklIKoUSGZCUMppLPBnPKIemTAhIwUBQBhkBZ5JNMl0l4wUFxmG1wXD44TsqZZoxTihIKtKMcMJgtU4enqazEcHbhdOHNbyaN+v8R1j9Sj6tYvI+wHNWcDg/j3BKWrFQAn2v4J07XuC1CKVQBSIvUiq4LCJ6brSDL3Zbw3Jf+e0kYgmMMpZSTlR8M9WNWYOtIQZpp4q5Xlc7rFc3GFxYBy9+a1wr0b16BLxsDGhnwj/YBJOHnak9eKfrRpe+snWTdmRWpFyExiH58wb+2ENMra2P6VVd+Up7hNlNq9yTeYS3HZZjoKl+1uAtlLbeVG5/VGckOqMpOmtbv8R32h+cmUBXQJ6luTg6/+6q2qP3b3p//UFIx/hc+y4eRja0KUxhciHiqFhvWTJQJ7uSU5livbgVjEQUIywbUTJiKEgnGT1dEArPQ1zUyJkCiudxRacnC8IxnEVH4wXHV6GSh9W/tkaDHfAGivIjC/f8KouKa7CvxpVbXfs7IZlqDZH/GboGmWmHszzsf7RLepvDb3ByRlIh+BXW094ezu2oXCkG4eRF+IQlfobtdHgxPB3S6ued/uk6sOI+UhhOQA0O54I1s40v7X2EMJloZmgyFwSlpEAhosR9FH6DkqPuJeWDfBRK4rT7kNB80W/+8rz5XJ4L9fNjS0W/pcuLlg4rxJaJvpnzEm4p8BsKoR2XChft+Asq7o9bDQplbmRzdHJlYW0KZW5kb2JqCjEyIDAgb2JqCjw8Ci9MZW5ndGggMjU1Ci9UeXBlIC9PYmpTdG0KL04gOQovRmlsdGVyIC9GbGF0ZURlY29kZQovRmlyc3QgNTIKPj4Kc3RyZWFtDQp4nM1Ry2rDMBD8lfmBVF5ZtmMIgTo0FEqhuIEeQg6OLYIgkYpll/bvu5Kgj1sLPfSgZXd2Z3YHSWTIoSQUSGUoQEWFEpJyVJB1jSXypUQNVRKIB5TCaiV2b88a4qE7aQ9xZwaPfc5KLQ4QGzfbCYT1+vskxL0eTNe4V+yzqwzhlSQ5VnWIhzA2aubKKCVa7d089rxCJWDj7MR9D6IIpA1bRvnwLwCxg0jYSnaRspydpEyxm5QVwdEnL50a5cTjfJxiGUCCaDqvU+dWn1/0ZPpu0bjzAHFjezcYe4J4MvbaevMB/EZ1Zy7aL1p36exfSfI/jEaP//jCn0u+A79EyKINCmVuZHN0cmVhbQplbmRvYmoKMTMgMCBvYmoKPDwKL0xlbmd0aCA0NgovUm9vdCAxIDAgUgovSUQgWzwyNTc0QTM2NzNBOEQxMDcxQjlBMDEyNjJFOTA3OEQwNT4gPDI1NzRBMzY3M0E4RDEwNzFCOUEwMTI2MkU5MDc4RDA1Pl0KL1R5cGUgL1hSZWYKL1NpemUgMTQKL0luZGV4IFswIDEzXQovVyBbMSAyIDFdCi9GaWx0ZXIgL0ZsYXRlRGVjb2RlCj4+CnN0cmVhbQ0KeJwVw8kNACAMBLHZcIQHEp3RfxeUAIslA1csgvnLw4tXb949fYiN4vAARy0C8w0KZW5kc3RyZWFtCmVuZG9iagpzdGFydHhyZWYKMTExMAolJUVPRgo=';
        Map<String, Object> res = FraudApiClient.genAttestationThenSendToSign(fraudId);
        String docId = (String)res.get('documentId');
        String docStatus = (String)res.get('status');
        String base64PDF = (String)res.get('base64Content');

        Fraud_Attestation_Doc__c docRec = new Fraud_Attestation_Doc__c();
        docRec.Fraud__c = fraudId;
        docRec.Document_ID__c = docId;
        docRec.Name = docId;
        docRec.Sign_Status__c = 'In Progress';
        insert docRec;

        return insertDocAndReturnDocId(fraudId, base64PDF);
    }

    private static String insertDocAndReturnDocId(String fraudId, String base64Data) {
        Blob decoded = EncodingUtil.base64Decode(base64Data);
        ContentVersion cv = new ContentVersion();
        cv.Title = 'Fraud Report :' + fraudId;
        cv.PathOnClient = 'Fraud_Attestation_' + fraudId + '.pdf';
        cv.VersionData = decoded;
        cv.IsMajorVersion = true;
        insert cv;

        //Get Content Document ID to link it 
        Id conDocId = [SELECT ContentDocumentId FROM 
                        ContentVersion WHERE Id =:cv.Id].ContentDocumentId;        
        
        // Create ContentDocumentLink
        ContentDocumentLink cdl = New ContentDocumentLink();
        cdl.LinkedEntityId = fraudId;
        cdl.ContentDocumentId = conDocId;
        cdl.shareType = 'V';
        insert cdl;

        return conDocId;

        //finally, add it to the quote page for use ---- don't understand -- for charge client money ??? 
        // -- why client needs to care about this kind of things during development phase?

    //     SBQQ__RelatedContent__c rc = new SBQQ__RelatedContent__c();
    //     rc.OwnerID = '0055x00000ArBNCAA3';
    //     rc.Name =  'test Document';
    //     rc.SBQQ__ExternalID__c = conDocId;
    //     rc.SBQQ__Quote__c = id;
    //     rc.SBQQ__Required__c = false;
        
    //     insert rc;        

    }

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
    public static List<Fraud__c> getFraudsForFraudTeam(){
        try {
            List<Fraud__c> frauds = [
                SELECT Id, Name, Account__r.Id, Account__r.Name, 
                        Account__r.Fraud_Pending_Count__c, Account__r.Fraud_Total_Count__c,
                        Fraud_Amount__c, Fraud_Reason__c, Other_Reason_Detail__c, 
                        Status__c, Approval_Status__c, CreatedDate
                FROM Fraud__c
                WHERE Status__c != 'Pending'
                ORDER BY Name DESC
            ];
            return frauds;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<Fraud__c> getFraudsForSecurityTeam(){
        try {
            List<Fraud__c> frauds = [
                SELECT Id, Name, Account__r.Id, Account__r.Name, 
                        Account__r.Fraud_Pending_Count__c, Account__r.Fraud_Total_Count__c,
                        Fraud_Amount__c, Fraud_Reason__c, Other_Reason_Detail__c, 
                        Status__c, Approval_Status__c, CreatedDate
                FROM Fraud__c
                WHERE Status__c != 'Pending' and Status__c != 'Submitted'
                ORDER BY Name DESC
            ];
            return frauds;
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