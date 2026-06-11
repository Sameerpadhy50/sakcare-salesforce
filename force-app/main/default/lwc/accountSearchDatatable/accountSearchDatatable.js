import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getAccounts from '@salesforce/apex/AccountSearchController.getAccounts';

const SORT_ASC = 'asc',
    SORT_DESC = 'desc',
    ASCENDING = 1,
    DESCENDING = -1,
    EMPTY_STRING = '',
    ZERO = 0;

const COLUMNS = [
    {
        cellAttributes: { alignment: 'left' },
        fieldName: 'Name',
        label: 'Account Name',
        sortable: true,
        type: 'text'
    },
    {
        fieldName: 'Industry',
        label: 'Industry',
        sortable: true,
        type: 'text'
    },
    {
        fieldName: 'Phone',
        label: 'Phone',
        sortable: false,
        type: 'phone'
    },
    {
        fieldName: 'BillingCity',
        label: 'Billing City',
        sortable: true,
        type: 'text'
    },
    {
        fieldName: 'Website',
        label: 'Website',
        sortable: false,
        type: 'url',
        typeAttributes: { label: { fieldName: 'Website' }, target: '_blank' }
    },
    {
        fieldName: 'CreatedDate',
        label: 'Created Date',
        sortable: true,
        type: 'date',
        typeAttributes: {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }
    }
];

export default class AccountSearchDatatable extends LightningElement {

    @track accounts = [];
    @track error;
    @track isLoading = true;
    @track sortedBy = 'CreatedDate';
    @track sortedDirection = SORT_DESC;

    columns = COLUMNS;
    wiredAccountsResult;

    // ─── Wire ────────────────────────────────────────────────────────────────

    @wire(getAccounts)
    wiredAccounts(result) {
        this.wiredAccountsResult = result;
        this.isLoading = false;

        if (result.data) {
            this.accounts = result.data;
            this.error = null;
        } else if (result.error) {
            this.accounts = [];
            this.error = result.error;
            this.dispatchEvent(
                new ShowToastEvent({
                    message: this.errorMessage,
                    title: 'Error loading accounts',
                    variant: 'error'
                })
            );
        }
    }

    // ─── Getters ─────────────────────────────────────────────────────────────

    get hasData() {
        return !this.isLoading && !this.error && this.accounts.length > ZERO;
    }

    get isEmpty() {
        return !this.isLoading && !this.error && this.accounts.length === ZERO;
    }

    get recordCount() {
        return this.accounts.length;
    }

    get errorMessage() {
        if (!this.error) {
            return EMPTY_STRING;
        }
        if (this.error.body && this.error.body.message) {
            return this.error.body.message;
        }
        return 'An unexpected error occurred. Please try again.';
    }

    // ─── Handlers ────────────────────────────────────────────────────────────

    handleSort(event) {
        const { fieldName, sortDirection } = event.detail;
        this.sortedBy = fieldName;
        this.sortedDirection = sortDirection;
        this.accounts = this.sortData(fieldName, sortDirection);
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    sortData(field, direction) {
        const cloned = [...this.accounts];
        let multiplier;

        if (direction === SORT_ASC) {
            multiplier = ASCENDING;
        } else {
            multiplier = DESCENDING;
        }

        cloned.sort((itemA, itemB) => {
            let valA, valB;

            if (itemA[field]) {
                valA = itemA[field].toString().toLowerCase();
            } else {
                valA = EMPTY_STRING;
            }

            if (itemB[field]) {
                valB = itemB[field].toString().toLowerCase();
            } else {
                valB = EMPTY_STRING;
            }

            if (valA < valB) {
                return Number(DESCENDING) * multiplier;
            }
            if (valA > valB) {
                return Number(ASCENDING) * multiplier;
            }
            return ZERO;
        });

        return cloned;
    }
}
