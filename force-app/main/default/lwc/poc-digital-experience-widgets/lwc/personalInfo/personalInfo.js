import { LightningElement, api } from 'lwc';

export default class PersonalInfo extends LightningElement {
    @api value = {
        "firstName": "John",
        "lastName": "Doe",
        "contact": {
            "email": "johne.doe@gmail.com",
            "phone": "416-555-8888",
        },
        "address": {
            "line1": "33 Yonge Street",
            "city": "Toronto",
            "province": "ON",
            "zip": "M5E 1G4"
        }
    }
}