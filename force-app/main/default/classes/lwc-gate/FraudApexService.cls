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

        Fraud_Attestation_Doc__c docRec = [
            SELECT Id, Sign_Status__c
            FROM Fraud_Attestation_Doc__c
            WHERE Name = :docId
        ];
        docRec.Sign_Status__c = 'Completed';
        update docRec;

        res.statusCode = 200;
        res.addHeader('Content-Type', 'application/json;charset=UTF-8');
        res.responseBody = Blob.valueOf('{"ok": true, "signStatus": "Completed"}');
    }
}