import { LightningElement, api } from 'lwc';

export default class PocBusinessStructure extends LightningElement {
    @api businessStructure;     // index, firstName, lastName, middleName, share, levRole, dob, roles, source
    @api isActive = false;

    renderedCallback() {
        // if (this.isActive) {
        //     this.show();
        // } else {
        //     this.hide();
        // }
    }

    @api show() {
        this.refs.expandableSection.show();
        if (!this.isActive) {
            this.refs.sectionHeaderI.classList.add('i-active');
            this.isActive = true;
        }
    }


    @api hide() {
        this.refs.expandableSection.hide();
        if (this.isActive) {
            this.refs.sectionHeaderI.classList.remove('i-active');
            this.isActive = false;
        }
    }

    get identity() {
        if (this.isNew) {
            if (this.businessStructure.firstName && this.businessStructure.lastName) {
                return this.businessStructure.firstName + ' ' 
                    + (this.businessStructure.middleName ? (this.businessStructure.middleName + ' '): '') 
                    + this.businessStructure.lastName;
            } else {
                return '[ NEW ] - #' + this.businessStructure.index;
            }
        } else {
            return this.businessStructure.firstName + ' ' 
                + (this.businessStructure.middleName ? (this.businessStructure.middleName + ' '): '') 
                + this.businessStructure.lastName;
        }
    }

    get idSupplement() {
        if (this.businessStructure.levRole) {
            return this.businessStructure.levRole + ' ' + this.businessStructure.share;
        } else {
            return this.businessStructure.share;
        }
    }

    get isNew() {
        return this.businessStructure?.source !== 'LEV';
    }

    handleShow() {
        this.isActive = true;        // if in renderedCallback, it will cause screen frozen, which (logically guess) is infinite loop
        this.refs.sectionHeaderI.classList.add('i-active');
        this.dispatchEvent(new CustomEvent('show', { detail: {key: this.businessStructure.index,} }));
    }

    handleHide() {
        this.isActive = false;
        this.refs.sectionHeaderI.classList.remove('i-active');
        this.dispatchEvent(new CustomEvent('hide', { detail: {key: this.businessStructure.index,} }));
    }
}