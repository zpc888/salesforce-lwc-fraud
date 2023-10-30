public with sharing class FraudController {
    @AuraEnabled
    public static Map<String, Object> genFraudAttestationDoc(String fraudId){
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

        String contentDocId = insertDocAndReturnDocId(docRec.Id, docId, base64PDF);

        Map<String, Object> ret = new Map<String, Object>{
            'id' => docRec.Id,
            'name' => docRec.Name,
            'docId' => docRec.Document_ID__c,
            'signStatus' => docRec.Sign_Status__c,
            'createdDate' => System.now(),
            'lastModifiedDate' => docRec.LastModifiedDate,
            'contentDocId' => contentDocId
        };
        return ret;        
    }

    private static String insertDocAndReturnDocId(String linkedEntityId, String docId, String base64Data) {
        Blob decoded = EncodingUtil.base64Decode(base64Data);
        ContentVersion cv = new ContentVersion();
        cv.Title = docId;
        cv.PathOnClient = 'generated-' + docId + '.pdf';
        cv.VersionData = decoded;
        cv.IsMajorVersion = true;
        insert cv;

        //Get Content Document ID to link it 
        Id conDocId = [SELECT ContentDocumentId FROM 
                        ContentVersion WHERE Id =:cv.Id].ContentDocumentId;        
        
        // Create ContentDocumentLink
        ContentDocumentLink cdl = New ContentDocumentLink();
        cdl.LinkedEntityId = linkedEntityId;
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

    @AuraEnabled
    public static Map<String, Object> genOrRegenClientCredit(String clientId, String clientName, String existingReportId) {
        try {
            Map<String, Object> apiResult = FraudApiClient.genClientCreditBureauReport(clientId, clientName);
            Map<String, Object> data = (Map<String, Object>) apiResult.get('data');
            Map<String, Object> pdf = (Map<String, Object>) apiResult.get('pdf');

            Client_Credit_Report__c report = null;
            if (existingReportId == null) {         // new one
                report = new Client_Credit_Report__c();
                report.Account__c = clientId;
                report.Credit_Score__c = (String) data.get('creditScore');
                report.Credit_Date__c = (String) data.get('creditDate');
                report.Report_ID__c = (String) pdf.get('documentId');
                insert report;
            } else {                                // update
                report = [select Id, Account__c, Credit_Score__c, Credit_Date__c, Report_ID__c 
                        from Client_Credit_Report__c
                        where Id = :existingReportId];
                report.Credit_Score__c = (String) data.get('creditScore');
                report.Credit_Date__c = (String) data.get('creditDate');
                report.Report_ID__c = (String) pdf.get('documentId');
                update report;
            }
            String contentDocId = insertDocAndReturnDocId(report.Id, report.Report_ID__c, (String) pdf.get('base64Content'));
            
            Map<String, Object> ret = new Map<String, Object> {
                'clientId' => clientId,
                'clientName' => clientName,
                'creditReportId' => report.Id,
                'creditScore' => report.Credit_Score__c,
                'creditDate' => report.Credit_Date__c,
                'docId' => report.Report_ID__c,
                'contentDocId' => contentDocId
            };
            return ret;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    // SELECT Account__r.Id, Account__r.Name, Id, Report_ID__c, Credit_Score__c, Credit_Date__c
    // FROM Client_Credit_Report__c
    // WHERE Account__c in (SELECT Account__c FROM Fraud__c where Id = 'a00Da000005qfRNIAY')
    // ORDER BY CreatedDate DESC

    // clientId, clientName, creditReportId, creditScore, creditDate, docId, contentDocId
    @AuraEnabled
    public static Map<String, Object> getClientCreditByFraudId(String fraudId){
        try {
            Fraud__c fraud = [
                SELECT Account__r.Id, Account__r.Name
                FROM Fraud__c
                WHERE Id = :fraudId
            ];
            List<Client_Credit_Report__c> reports = [
                SELECT Id, Report_ID__c, Credit_Score__c, Credit_Date__c
                FROM Client_Credit_Report__c
                WHERE Account__c = :fraud.Account__r.Id
                ORDER BY CreatedDate DESC
            ];
            Client_Credit_Report__c report = reports != null && reports.size() > 0 ? reports[0] : null;
            Map<String, Object> ret = new Map<String, Object> {
                'clientId' => fraud.Account__r.Id,
                'clientName' => fraud.Account__r.Name
            };
            if (report != null) {
                ret.put('creditReportId', report.Id);
                ret.put('creditScore', report.Credit_Score__c);
                ret.put('creditDate', report.Credit_Date__c);
                ret.put('docId', report.Report_ID__c);
                List<ContentDocumentLink> docLinks = [
                    Select ContentDocumentId 
                    FROM ContentDocumentLink 
                    where LinkedEntityId = :report.Id and IsDeleted = false
                    ORDER BY SystemModstamp DESC
                ];
                String contentDocId = null;
                if (docLinks != null && docLinks.size() > 0) {
                    contentDocId = docLinks[0].ContentDocumentId;
                }
                ret.put('contentDocId', contentDocId);
            }
            return ret;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static String getLatestAttestationStatus(String fraudId){
        try {
            List<Fraud_Attestation_Doc__c> attestations = [
                SELECT Id, Name, Document_ID__c, Sign_Status__c, Signed_Document_ID__c 
                FROM Fraud_Attestation_Doc__c
                WHERE Fraud__c = :fraudId
                ORDER BY CreatedDate DESC
            ];
            if (attestations == null || attestations.size() == 0) {
                return 'noAttestationDoc';
            } else {
                if (attestations[0].Signed_Document_ID__c == null) {
                    return 'notSignedYet';
                } else {
                    return 'signedAlready';
                }
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Map<String, Object> getFraudAttestationByFraudId(String fraudId){
        try {
            List<Fraud_Attestation_Doc__c> attestations = [
                SELECT Id, Name, Document_ID__c, Sign_Status__c, Signed_Document_ID__c, 
                        CreatedDate, LastModifiedDate
                FROM Fraud_Attestation_Doc__c
                WHERE Fraud__c = :fraudId
                ORDER BY CreatedDate DESC
            ];
            if (attestations.size() == 0) {
                return new Map<String, Object>();
            }
            List<ContentDocumentLink> docLinks = [
                Select ContentDocumentId 
                FROM ContentDocumentLink 
                where LinkedEntityId = :attestations[0].Id and IsDeleted = false
                ORDER BY SystemModstamp DESC
            ];
            String contentDocId = null;
            String signedContentDocId = null;
            if (docLinks.size() == 1) {
                contentDocId = docLinks[0].ContentDocumentId;
            } else if (docLinks.size() == 2) {                      // descending order now
                signedContentDocId = docLinks[0].ContentDocumentId;
                contentDocId = docLinks[1].ContentDocumentId;
            } else if (docLinks.size() > 2) {
                // something went wrong and do fine match
                List<String> contentDocIds = new List<String>();
                for (ContentDocumentLink dl: docLinks) {
                    contentDocIds.add(dl.ContentDocumentId);
                }
                List<ContentVersion> contentVers = [select Title, ContentDocumentId 
                        FROM ContentVersion where ContentDocumentId in :contentDocIds];
                for (ContentVersion cv: contentVers) {
                    if (cv.Title == attestations[0].Document_ID__c) {
                        contentDocId = cv.ContentDocumentId;
                    } else if (cv.Title == attestations[0].Signed_Document_ID__c) {
                        signedContentDocId = cv.ContentDocumentId;
                    }
                }
            }
            Map<String, Object> ret = new Map<String, Object>{
                'id' => attestations[0].Id,
                'name' => attestations[0].Name,
                'docId' => attestations[0].Document_ID__c,
                'signStatus' => attestations[0].Sign_Status__c,
                'signedDocId' => attestations[0].Signed_Document_ID__c,
                'createdDate' => attestations[0].CreatedDate,
                'lastModifiedDate' => attestations[0].LastModifiedDate,
                'contentDocId' => contentDocId,
                'signedContentDocId' => signedContentDocId
            };
            return ret;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
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