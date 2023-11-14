@RestResource(urlMapping='/docusign/v1/esign/status/callback/*')
global with sharing class DocusignApexService {
    public DocusignApexService() {
    }

    @HttpPost
    global static void esignStatusCallback() {
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;
        String uri = req.requestURI;
        String callbackEventName = uri.substring(uri.lastIndexOf('/') + 1);
        String jsonStr = req.requestBody.toString();
        Map<String, Object> jsonObj = (Map<String, Object>) JSON.deserializeUntyped(jsonStr);

        // need to change connected-app policy -- IP Relaxation = Relax IP restrictions, otherwise it returns 403 forbidden error
        Map<String, Object> ret = FraudApiClient.notifyEsignStatus(req.params, jsonObj);
        res.statusCode = 200;
        res.addHeader('Content-Type', 'application/json;charset=UTF-8');
        res.responseBody = Blob.valueOf(JSON.serialize(ret));
    }
}