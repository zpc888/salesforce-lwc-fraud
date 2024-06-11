import { LightningElement } from 'lwc';

export default class PageIndividual extends LightningElement {
    personalInfo = {
        "firstName": "George",
        "lastName": "Zhou",
        "contact": {
            "email": "George.Zhou@gmail.com",
            "phone": "416-666-8888",
        },
        "address": {
            "line1": "88 Yonge Street",
            "city": "Toronto",
            "province": "ON",
            "zip": "M5E 1G3"
        }
    }
    personalFinance = {
        y2023Income: 800000,
        y2023Asset: 880000,
        liability: 88880
    }
}