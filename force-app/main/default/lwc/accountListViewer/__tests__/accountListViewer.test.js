/**
 * @description Jest unit tests for accountListViewer LWC
 *
 * HOW TO RUN (requires @salesforce/sfdx-lwc-jest installed):
 *   npm run test:unit
 *   npm run test:unit:coverage
 *
 * Coverage targets:
 *  ✅ Component renders without errors
 *  ✅ Datatable shows data when Apex resolves
 *  ✅ Error message shown when Apex rejects
 *  ✅ Spinner shown during loading
 *  ✅ Owner name is flattened correctly from nested Owner.Name
 */

import { createElement } from 'lwc';
import AccountListViewer from 'c/accountListViewer';
import getAccounts from '@salesforce/apex/AccountListController.getAccounts';

// ---------------------------------------------------------
// Mock the Apex imperative call
// ---------------------------------------------------------
jest.mock(
    '@salesforce/apex/AccountListController.getAccounts',
    () => {
        return { default: jest.fn() };
    },
    { virtual: true }
);

// ---------------------------------------------------------
// Helpers
// ---------------------------------------------------------
const MOCK_ACCOUNTS = [
    {
        Id: '001000000000001AAA',
        Name: 'Acme Corp',
        Industry: 'Technology',
        Phone: '555-1234',
        Owner: { Name: 'John Doe' }
    },
    {
        Id: '001000000000002AAA',
        Name: 'Globex Inc',
        Industry: 'Manufacturing',
        Phone: '555-5678',
        Owner: { Name: 'Jane Smith' }
    }
];

// Flush all pending promises / microtasks
const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

// ---------------------------------------------------------
// Test Suite
// ---------------------------------------------------------
describe('c-account-list-viewer', () => {

    afterEach(() => {
        // Clean up DOM after every test
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    // -------------------------------------------------------
    // Test 1: Component renders without errors
    // -------------------------------------------------------
    it('renders the component without errors', () => {
        getAccounts.mockResolvedValue([]);
        const element = createElement('c-account-list-viewer', {
            is: AccountListViewer
        });
        document.body.appendChild(element);
        expect(element).toBeTruthy();
    });

    // -------------------------------------------------------
    // Test 2: Shows spinner during loading (before promise resolves)
    // -------------------------------------------------------
    it('shows a lightning-spinner while accounts are loading', () => {
        // Do NOT resolve yet — keep the promise pending
        getAccounts.mockReturnValue(new Promise(() => {}));
        const element = createElement('c-account-list-viewer', {
            is: AccountListViewer
        });
        document.body.appendChild(element);

        const spinner = element.shadowRoot.querySelector('lightning-spinner');
        expect(spinner).not.toBeNull();
    });

    // -------------------------------------------------------
    // Test 3: Datatable renders with correct data when Apex resolves
    // -------------------------------------------------------
    it('renders lightning-datatable with account data on success', async () => {
        getAccounts.mockResolvedValue(MOCK_ACCOUNTS);

        const element = createElement('c-account-list-viewer', {
            is: AccountListViewer
        });
        document.body.appendChild(element);

        await flushPromises();

        const table = element.shadowRoot.querySelector('lightning-datatable');
        expect(table).not.toBeNull();
        expect(table.data).toHaveLength(2);
        expect(table.data[0].Name).toBe('Acme Corp');
        expect(table.data[0].OwnerName).toBe('John Doe');
        expect(table.data[1].Name).toBe('Globex Inc');
        expect(table.data[1].OwnerName).toBe('Jane Smith');
    });

    // -------------------------------------------------------
    // Test 4: Owner.Name is flattened to OwnerName correctly
    // -------------------------------------------------------
    it('flattens nested Owner.Name to OwnerName on each row', async () => {
        getAccounts.mockResolvedValue([
            { Id: '001x', Name: 'TestCo', Industry: 'Finance', Phone: null, Owner: { Name: 'Alice' } }
        ]);

        const element = createElement('c-account-list-viewer', {
            is: AccountListViewer
        });
        document.body.appendChild(element);
        await flushPromises();

        const table = element.shadowRoot.querySelector('lightning-datatable');
        expect(table.data[0].OwnerName).toBe('Alice');
    });

    // -------------------------------------------------------
    // Test 5: OwnerName defaults to empty string when Owner is null
    // -------------------------------------------------------
    it('sets OwnerName to empty string when Owner is null', async () => {
        getAccounts.mockResolvedValue([
            { Id: '001x', Name: 'NullOwnerCo', Industry: 'Retail', Phone: null, Owner: null }
        ]);

        const element = createElement('c-account-list-viewer', {
            is: AccountListViewer
        });
        document.body.appendChild(element);
        await flushPromises();

        const table = element.shadowRoot.querySelector('lightning-datatable');
        expect(table.data[0].OwnerName).toBe('');
    });

    // -------------------------------------------------------
    // Test 6: Shows error message when Apex rejects
    // -------------------------------------------------------
    it('shows an error message when Apex call fails', async () => {
        getAccounts.mockRejectedValue({
            body: { message: 'Something went wrong' },
            ok: false,
            status: 400
        });

        const element = createElement('c-account-list-viewer', {
            is: AccountListViewer
        });
        document.body.appendChild(element);
        await flushPromises();

        const errorDiv = element.shadowRoot.querySelector('.slds-text-color_error');
        expect(errorDiv).not.toBeNull();
        expect(errorDiv.textContent).toBe('Something went wrong');
    });

    // -------------------------------------------------------
    // Test 7: No datatable rendered when Apex returns empty list
    // -------------------------------------------------------
    it('renders datatable with empty data when Apex returns no accounts', async () => {
        getAccounts.mockResolvedValue([]);

        const element = createElement('c-account-list-viewer', {
            is: AccountListViewer
        });
        document.body.appendChild(element);
        await flushPromises();

        const table = element.shadowRoot.querySelector('lightning-datatable');
        expect(table).not.toBeNull();
        expect(table.data).toHaveLength(0);
    });

    // -------------------------------------------------------
    // Test 8: Datatable has correct columns defined
    // -------------------------------------------------------
    it('passes the correct column definitions to lightning-datatable', async () => {
        getAccounts.mockResolvedValue(MOCK_ACCOUNTS);

        const element = createElement('c-account-list-viewer', {
            is: AccountListViewer
        });
        document.body.appendChild(element);
        await flushPromises();

        const table = element.shadowRoot.querySelector('lightning-datatable');
        const columnLabels = table.columns.map((c) => c.label);
        expect(columnLabels).toContain('Account Name');
        expect(columnLabels).toContain('Industry');
        expect(columnLabels).toContain('Phone');
        expect(columnLabels).toContain('Owner');
    });

    // -------------------------------------------------------
    // Test 9: Spinner hides after data loads
    // -------------------------------------------------------
    it('hides spinner after data resolves', async () => {
        getAccounts.mockResolvedValue(MOCK_ACCOUNTS);

        const element = createElement('c-account-list-viewer', {
            is: AccountListViewer
        });
        document.body.appendChild(element);
        await flushPromises();

        const spinner = element.shadowRoot.querySelector('lightning-spinner');
        expect(spinner).toBeNull();
    });

    // -------------------------------------------------------
    // Test 10: Fallback error message for unknown error shape
    // -------------------------------------------------------
    it('shows a generic error message when error has no body.message', async () => {
        getAccounts.mockRejectedValue(new Error('Network failure'));

        const element = createElement('c-account-list-viewer', {
            is: AccountListViewer
        });
        document.body.appendChild(element);
        await flushPromises();

        const errorDiv = element.shadowRoot.querySelector('.slds-text-color_error');
        expect(errorDiv).not.toBeNull();
        expect(errorDiv.textContent).toBe(
            'An unknown error occurred while loading accounts.'
        );
    });
});
