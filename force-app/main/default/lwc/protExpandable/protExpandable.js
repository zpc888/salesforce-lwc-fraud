import { LightningElement, api } from 'lwc';

export default class ProtExpandable extends LightningElement {
    handleSectionHeadClick(event) {
        this.toggle();
    }

    @api toggle() {
        if (this.refs.sectBody.style.display === 'none') {
            this.show();
        } else {
            this.hide();
        }
    }

    @api hide() {
        this.refs.sectBody.style.display = 'none';
        this.refs.sect.classList.remove('expanded');
        this.dispatchEvent(new CustomEvent('hide'));
    }

    @api show() {
        this.refs.sectBody.style.display = 'block';
        this.refs.sect.classList.add('expanded');
        this.dispatchEvent(new CustomEvent('show'));
    }
}
