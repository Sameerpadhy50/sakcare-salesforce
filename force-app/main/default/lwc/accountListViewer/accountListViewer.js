import { LightningElement, track } from 'lwc';
import getAccounts from '@salesforce/apex/AccountListController.getAccounts';

const COLUMNS = [
    { label: 'Account Name', fieldName: 'Name', type: 'text' },
    { label: 'Industry', fieldName: 'Industry', type: 'text' },
    { label: 'Phone', fieldName: 'Phone', type: 'phone' },
    { label: 'Owner', fieldName: 'OwnerName', type: 'text' }
];

export default class AccountListViewer extends LightningElement {
    @track accounts = [];
    @track error;
    @track isLoading = true;
    columns = COLUMNS;

    connectedCallback() {
        this.loadAccounts();
    }

    loadAccounts() {
        this.isLoading = true;
        getAccounts()
            .then((result) => {
                this.accounts = result.map((acc) => ({
                    ...acc,
                    OwnerName: acc.Owner ? acc.Owner.Name : ''
                }));
                this.error = undefined;
            })
            .catch((err) => {
                this.error = this.reduceError(err);
                this.accounts = [];
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    reduceError(err) {
        if (err && err.body && err.body.message) {
            return err.body.message;
        }
        return 'An unknown error occurred while loading accounts.';
    }
}
