@RestResource(urlMapping='/fraud/v1/esign/status/callback/*')
global with sharing class FraudApexService {
    public FraudApexService() {

    }

    @HttpPost
    global static void esignStatusCallback() {
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;
        String uri = req.requestURI;
        String callbackEventName = uri.substring(uri.lastIndexOf('/') + 1);
        String jsonStr = req.requestBody.toString();
        Map<String, Object> jsonObj = (Map<String, Object>) JSON.deserializeUntyped(jsonStr);
        String docId = (String) jsonObj.get('documentId');
        String signedDocId = (String) jsonObj.get('signedDocumentId');
        String signedBase64PDF = (String) jsonObj.get('signedBase64Content');

        Fraud_Attestation_Doc__c docRec = [
            SELECT Id, Sign_Status__c, Signed_Document_ID__c, Fraud__c
            FROM Fraud_Attestation_Doc__c
            WHERE Name = :docId
        ];
        // WHERE Document_ID__C = :docId     // is ok too, but since Name is naturally ordered and it saves docId already for now
        docRec.Sign_Status__c = 'Completed';
        docRec.Signed_Document_ID__c = signedDocId;
        update docRec;

        String signedContentDocId = insertDocAndReturnDocId(docRec.Fraud__c, signedDocId, signedBase64PDF);

        res.statusCode = 200;
        res.addHeader('Content-Type', 'application/json;charset=UTF-8');
        res.responseBody = Blob.valueOf('{"ok": true, "signStatus": "Completed"}');
    }

    private static String insertDocAndReturnDocId(String fraudId, String docId, String base64Data) {
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
        cdl.LinkedEntityId = fraudId;
        cdl.ContentDocumentId = conDocId;
        cdl.shareType = 'V';
        insert cdl;

        return conDocId;
    }
}