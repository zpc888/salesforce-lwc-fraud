public with sharing class FraudApiClient {
    private static final String BASE_URL = 'http://3.129.216.253:8080';
    private static final String GEN_ATTESTATION_PATH = '/api/v1/fraud-attestations';
    private static final String GEN_CLIENT_CREDIT_REPORT_PATH = '/api/v1/credit-report';
    private static final String DOCUSIGN_EVENT_NOTIFY_PATH = '/api/v1/docusign/event/notification';

    public FraudApiClient() {
    }

    public static Map<String, Object> notifyEsignStatus(Map<String, String> params, Map<String, Object> jsonObj) {
        String finalPath = DOCUSIGN_EVENT_NOTIFY_PATH;
        if (params != null && params.size() > 0) {
            for (String k: params.keySet()) {
                if (finalPath.length() == DOCUSIGN_EVENT_NOTIFY_PATH.length()) {
                    finalPath = finalPath + '?';
                } else {
                    finalPath = finalPath + '&';
                }
                finalPath = finalPath + k + '=' + params.get(k);
            }
        }
        return callApi(finalPath, 'POST', jsonObj);
    }

    public static Map<String, Object> genClientCreditBureauReport(String clientId, String clientName) {
        // email, phone are not used now, so ignoring for now
        Map<String, Object> req = new Map<String, Object>{
            'id' => clientId,
            'fullName' => clientName
        };
/*  output Map structure
{
  "data": {
    "creditScore": "string",
    "creditDate": "2023-10-30T16:08:10.973Z"
  },
  "pdf": {
    "documentId": "string",
    "status": "string",
    "base64Content": "string"
  }
}
*/
        return callApi(GEN_CLIENT_CREDIT_REPORT_PATH, 'POST', req);
    }

    public static Map<String, Object> genAttestationThenSendToSign(String fraudId) {
        Fraud__c fraud = [
            SELECT Id, Name, Account__c, 
                    Fraud_Amount__c, Fraud_Reason__c, Other_Reason_Detail__c, 
                    Status__c, Approval_Status__c, CreatedDate, lastModifiedDate, 
                    (SELECT Id, Name, Item_Order__c, Tx_Date__c, Card_Number__c, Amount__c, Merchant__c 
                    FROM Fraud_Items__r)
            FROM Fraud__c
            WHERE id = :fraudId
        ];
        Account acct = [
            select Id, Name, Phone, (select Id, Phone, Email from Contacts)
            from Account
            where Id = :fraud.Account__c
        ];
        List<Contact> acctContacts = acct.Contacts;
        String phone = acct.Phone;
        String email = null;
        if (acctContacts != null && acctContacts.size() > 0) {
            email = acctContacts[0].Email;
            if (phone == null) {
                phone = acctContacts[0].Phone;
            }
        }
        if (email == null) {
            throw new AppException('Please add email to contact of client: ' + acct.Name);
        }

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
                'id' => acct.Id,
                'fullName' => acct.Name,
                'email' => email,
                'phone' => phone
            },
            'fraud' => new Map<String, Object> {
                'fraudNumber' => fraud.Name,
                'clientName' => acct.Name,
                'fraudReason' => fraud.Fraud_Reason__c,
                'otherReasonDetail' => Fraud.Other_Reason_Detail__c,
                'items' => items
            },
            'callback' => new Map<String, Object>{
                'callbackUrl' => 'https://ability-business-3077-dev-ed.scratch.my.salesforce.com/services/apexrest/fraud/v1/esign/status/callback/after-esigned',
                'oauthUrl' => 'https://ability-business-3077-dev-ed.scratch.my.salesforce.com/services/oauth2/token',
                'grantType'=> 'client_credentials',
                'clientId' => '3MVG99nUjAVk2edwYTM8ZHhUfVBKY.in7kFNX7ortXNlaHZ2LFiqiOASh8znJ7WtA7ftBnOGogyVcS26.MKIa',
                'clientSecret' => 'ECAB64013CEC0A2DB944975E3E87228ACEDFDEBDC3382DC2B6723F7D07724950'
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
        req.setHeader('x-vendor-client-id', 'prot');
        req.setHeader('x-vendor-client-secret', '13523');
        System.debug('gz debug: >>> request: ' + req.getEndpoint() + ' ' + method);
        Http http = new Http();
        HttpResponse res = http.send(req);
        System.debug('gz debug: <<< response: ' + res.getStatusCode() + ' ' + res.getStatus());
        String resPayload = res.getBody();
        System.debug('gz debug: <<< response body: ' + resPayload);
        return (Map<String, Object>)JSON.deserializeUntyped(resPayload);
    }    
}