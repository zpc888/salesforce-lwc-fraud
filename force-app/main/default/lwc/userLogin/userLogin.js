import { LightningElement } from 'lwc';

import login from '@salesforce/apex/UserLoginController.login';

export default class UserLogin extends LightningElement {
    email;
    password;

    handleUserEmail(event) {
        this.email = event.target.value;
    }

    handleUserPassword(event) {
        this.password = event.target.value;
    }

    handleLogin(event) {
        console.log("try to login with Email value = ", this.email, " Password = ", this.password);
        if (this.email != null && this.password != null) {
            login({username: this.email, password: this.password})
                .then( r => {
                    console.log('Login result is: ', r)
                }).catch(e => {
                    console.log('Login error: ', e);
                });
        }
    }
}