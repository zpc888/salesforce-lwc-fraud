public with sharing class FraudApiClient {
    private static final String BASE_URL = 'http://3.129.216.253:8080';
    private static final String GEN_ATTESTATION_PATH = '/api/v1/fraud-attestations';

    public FraudApiClient() {
    }

    public static Map<String, Object> genAttestationThenSendToSign(String fraudId) {
        Fraud__c fraud = [
            SELECT Id, Name, Account__r.Id, Account__r.Name, 
                    Fraud_Amount__c, Fraud_Reason__c, Other_Reason_Detail__c, 
                    Status__c, Approval_Status__c, CreatedDate, lastModifiedDate, 
                    (SELECT Id, Name, Item_Order__c, Tx_Date__c, Card_Number__c, Amount__c, Merchant__c 
                    FROM Fraud_Items__r)
            FROM Fraud__c
            WHERE id = :fraudId
        ];

        List<Map<String, Object>> items = new List<Map<String, Object>>();
        for (Fraud_Item__c item: fraud.Fraud_Items__r) {
            items.add(new Map<String, Object>{
                'txDate' => item.Tx_Date__c,
                'merchant' => item.Merchant__c,
                'cardNumber' => item.Card_Number__c,
                'amount' => item.Amount__c
            });
        }
        Map<String, Object> req = new Map<String, Object>{
            'signer' => new Map<String, Object>{
                'id' => UserInfo.getUserId(),
                'fullName' => 'David Junior',
                'email' => 'David.Smith@nowhere.com',
                'phone' => '416-886-9081'
            },
            'fraud' => new Map<String, Object> {
                'fraudNumber' => fraud.Name,
                'clientName' => fraud.Account__r.Name,
                'fraudReason' => fraud.Fraud_Reason__c,
                'otherReasonDetail' => Fraud.Other_Reason_Detail__c,
                'items' => items
            },
            'callback' => new Map<String, Object>{
                'callbackUrl' => 'https://your.sf.com/services/apexrest/your-service-path',
                'oauthUrl' => 'https://your.sf.com/services/oauth2/token',
                'grantType'=> 'client_credentials',
                'clientId' => 'your-client-id',
                'clientSecret' => 'your-client-secret'
            }
        };

        return callApi(GEN_ATTESTATION_PATH, 'POST', req);
    }

    private static Map<String, Object> callApi(String apiUri, String method, Map<String, Object> reqPayload) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(BASE_URL + apiUri); 
        req.setMethod(method);
        if (reqPayload != null) {
            req.setBody(JSON.serialize(reqPayload));
        }
        req.setHeader('Content-Type', 'application/json');
        req.setHeader('x-oauth-client-id', 'george-zhou');
        req.setHeader('x-oauth-client-secret', 'N0Passw0rd888');
        System.debug('gz debug: >>> request: ' + req.getEndpoint() + ' ' + method);
        Http http = new Http();
        HttpResponse res = http.send(req);
        System.debug('gz debug: <<< response: ' + res.getStatusCode() + ' ' + res.getStatus());
        String resPayload = res.getBody();
        System.debug('gz debug: <<< response body: ' + resPayload);
        return (Map<String, Object>)JSON.deserializeUntyped(resPayload);
    }    
}