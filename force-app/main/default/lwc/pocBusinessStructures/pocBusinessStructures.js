import { LightningElement } from 'lwc';

export default class PocBusinessStructures extends LightningElement {
    data = [ 
        {
            index: '1',
            firstName: 'George',
            lastName: 'Zhou',
            share: '50',
            source: 'LEV',
            levRole: 'Director',
        },
        {
            index: '2',
            firstName: 'Angela',
            lastName: 'Zhou',
            share: '25',
            source: 'LEV',
            levRole: 'Voting Shareholder',
        },
        {
            index: '3',
            firstName: 'Lily',
            lastName: 'Zhou',
            share: '25',
            source: 'LEV',
            levRole: null,
        },
        {
            index: '4',
        },
    ];

    handleShow(event) {
        const index = event.detail.key;
        const allComps = this.template.querySelectorAll('c-poc-business-structure');
        const others = this.data.map((d, i) => d.index === index ? -1 : i).filter(i => i >= 0);
        others.forEach(i => allComps[i].hide());
        // allComps[this.data.findIndex(i => i.index === index)].isActive = true;
        // allComps[others.findIndex(i => i === -1)].activate();
    }
}