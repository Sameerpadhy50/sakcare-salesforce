import { createElement } from 'lwc';
import AccountListViewer from 'c/accountListViewer';
import getAccounts from '@salesforce/apex/AccountListController.getAccounts';

jest.mock(
    '@salesforce/apex/AccountListController.getAccounts',
    () => ({ default: jest.fn() }),
    { virtual: true }
);

describe('c-account-list-viewer', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    it('renders without errors', () => {
        const element = createElement('c-account-list-viewer', { is: AccountListViewer });
        document.body.appendChild(element);
        expect(element).toBeTruthy();
    });

    it('displays datatable when apex returns accounts', async () => {
        getAccounts.mockResolvedValue([
            { Id: '001000000000001', Name: 'Test Account', Industry: 'Tech', Phone: '123', Owner: { Name: 'Admin' } }
        ]);

        const element = createElement('c-account-list-viewer', { is: AccountListViewer });
        document.body.appendChild(element);

        await Promise.resolve();
        await Promise.resolve();

        const table = element.shadowRoot.querySelector('lightning-datatable');
        expect(table).toBeTruthy();
        expect(table.data.length).toBe(1);
    });

    it('shows error message when apex throws', async () => {
        getAccounts.mockRejectedValue(new Error('Apex error'));

        const element = createElement('c-account-list-viewer', { is: AccountListViewer });
        document.body.appendChild(element);

        await Promise.resolve();
        await Promise.resolve();

        const errorEl = element.shadowRoot.querySelector('.slds-text-color_error');
        expect(errorEl).toBeTruthy();
    });

    it('shows spinner while loading', () => {
        getAccounts.mockResolvedValue([]);

        const element = createElement('c-account-list-viewer', { is: AccountListViewer });
        document.body.appendChild(element);

        const spinner = element.shadowRoot.querySelector('lightning-spinner');
        expect(spinner).toBeTruthy();
    });
});
