# Salesforce DX Project: Next Steps

Now that you’ve created a Salesforce DX project, what’s next? Here are some documentation resources to get you started.

## How Do You Plan to Deploy Your Changes?

Do you want to deploy a set of changes, or create a self-contained application? Choose a [development model](https://developer.salesforce.com/tools/vscode/en/user-guide/development-models).

## Configure Your Salesforce DX Project

The `sfdx-project.json` file contains useful configuration information for your project. See [Salesforce DX Project Configuration](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_config.htm) in the _Salesforce DX Developer Guide_ for details about this file.

## Read All About It

- [Salesforce Extensions Documentation](https://developer.salesforce.com/tools/vscode/)
- [Salesforce CLI Setup Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm)
- [Salesforce DX Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm)
- [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)

## Creation command

```shell
sf org create scratch --definition-file config/project-scratch-def.json --set-default --duration-days 28 --alias poc-fraud-001 --username pengcheng.zhou@gmail.com.fraud001

sf org display -u poc-fraud-001 

sf force user password generate -u pengcheng.zhou@gmail.com.fraud001
# password: tdqYf0idf!xsh  --> T0p$ecret

sf org create user --definition-file config/users/qa01.json   
sf org create user --definition-file config/users/qa02.json   
sf org create user --definition-file config/users/qa03.json   

sf org user display -o qa01@poc.fraud.com

qa01/q5pGidbsyont%
qa03/ki5wlerc@rzRy 
qa03/cnq9Dr$dpfsoh 

SELECT AccountId, DataType, Field, NewValue, OldValue, CreatedById, CreatedDate
FROM AccountHistory
ORDER BY CreatedDate ASC
LIMIT 10

SELECT Id, ParentId, OldValue, NewValue, DataType, Field, CreatedById, CreatedDate
FROM Fraud__History
Order by CreatedDate DESC

SELECT Id, ParentId, OldValue, NewValue, DataType, Field, CreatedById, CreatedDate
FROM Fraud__History
WHERE Field = 'Status__c'
Order by CreatedDate DESC

SELECT Id, Name, Status__c, Approval_Status__c,
    (SELECT Id, Name, Document_ID__c, Sign_Status__c 
     FROM Attestation_Docs__r),
    (SELECT OldValue, NewValue, Field, DataType, CreatedById, CreatedDate
     FROM Histories)
FROM Fraud__c
WHERE Id = 'a00Da000005qYZCIA2'

SELECT Id, Name, Status__c, Approval_Status__c,
    (SELECT OldValue, NewValue, CreatedById, CreatedDate
     FROM Histories WHERE Field = 'Status__c' ORDER BY CreatedDate),
    (SELECT Id, Name, Document_ID__c, Sign_Status__c 
     FROM Attestation_Docs__r)
FROM Fraud__c
WHERE Id = 'a00Da000005qYZCIA2'

sf project retrieve start --metadata 'ApexClass:MyApex*'
sf project retrieve start --metadata 'Profile:Profile*'
sfdx force:source:retrieve --metadata "Profile:Profile*"
sfdx force:source:retrieve --metadata "Profile"

sfdx force:source:retrieve --metadata "Profile:Profile Frontline"
sf project retrieve start --metadata 'Profile:Profile Fraud'
sf project retrieve start --metadata 'Profile:Profile Security'


System.debug(UserInfo.getUserId());
// 005Da00000BXMDJIA5

System.debug(UserInfo.getUserName());
// pengcheng.zhou@gmail.com.fraud001

System.debug(UserInfo.getUserEmail());
// pengcheng.zhou@gmail.com

System.debug(UserInfo.getProfileId());
// 00eDa0000017hRhIAI

System.debug(UserInfo.getUserRoleId());
// 00EDa000001lwV3MAI

String profileId = UserInfo.getProfileId();
Profile p = [Select Name from Profile where Id = :profileId];
System.debug(p.Name);
// System Administrator

String roleId = UserInfo.getUserRoleId();
UserRole r = [Select Name, DeveloperName from UserRole where Id = :roleId];
System.debug(r.Name);
// Frontline Team
System.debug(r.DeveloperName);
// Frontline_Team

```