import { LightningElement, api, wire} from 'lwc';
import strUserId from '@salesforce/user/Id';
import PROFILE_NAME_FIELD from '@salesforce/schema/User.Profile.Name';
import USER_NAME_FIELD from '@salesforce/schema/User.Name';
import {getRecord} from 'lightning/uiRecordApi';

export default class FraudHome extends LightningElement {
    @api frontlineTeamProfileName = 'Profile Frontline';
    @api fraudTeamProfileName = 'Profile Fraud';
    @api securityTeamProfileName = 'Profile Security';

    userId = strUserId;
    userName;
    profileName;

    @wire(getRecord, {recordId: strUserId, fields: [PROFILE_NAME_FIELD, USER_NAME_FIELD]})
    wireUser({data, error}) {
        if (data) {
            this.userName = data.fields.Name.value;
            this.profileName = data.fields.Profile.value.fields.Name.value;
        } else {
            this.profileName = null;
        }
    }

    get isTeamFraudProfile() {
        return this.profileName === this.fraudTeamProfileName;
    }

    get isTeamSecurityProfile() {
        return this.profileName === this.securityTeamProfileName;
        // return true;
    }

    get isTeamFrontlineProfile() {
        return this.profileName === this.frontlineTeamProfileName;
    }

    get isUnknownProfile() {
        return !this.isTeamFraudProfile && !this.isTeamFrontlineProfile && !this.isTeamSecurityProfile;
    }
}