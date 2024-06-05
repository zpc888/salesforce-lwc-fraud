global class UserLoginController {
    @AuraEnabled
    global static String login(String username, String password) {
        try {
            String homeUrl = 'https://app-platform-5327-dev-ed.scratch.my.site.com/dbo/s/';
            ApexPages.PageReference pageRef = Site.login(username, password, homeUrl);
            return pageRef.getUrl();
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    global static string selfRegister(String firstName, String lastName, String phone, String email) {
        try {
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}