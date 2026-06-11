/**
 * @description Test class for AccountSearchController.
 *              Covers: positive path, empty org, bulk (200 records).
 * @author      sf-sdlc skill
 * @date        2026-06-11
 */
@IsTest
private class AccountSearchControllerTest {

    // ─── Test Setup ──────────────────────────────────────────────────────────

    @TestSetup
    static void makeData() {
        List<Account> accounts = new List<Account>();
        for (Integer i = 1; i <= 5; i++) {
            accounts.add(new Account(
                Name        = 'Test Account ' + i,
                Phone       = '555-000' + String.valueOf(i).leftPad(4, '0'),
                Industry    = 'Technology',
                BillingCity = 'San Francisco',
                Website     = 'https://test' + i + '.example.com'
            ));
        }
        insert accounts;
    }

    // ─── Positive Path ───────────────────────────────────────────────────────

    @IsTest
    static void testGetAccountsReturnsUpToTenRecords() {
        Test.startTest();
        List<Account> result = AccountSearchController.getAccounts();
        Test.stopTest();

        System.assertNotEquals(null, result,
            'getAccounts() should not return null');
        System.assert(result.size() <= 10,
            'getAccounts() should return at most 10 records, got: ' + result.size());
        System.assert(result.size() > 0,
            'getAccounts() should return at least 1 record when data exists');
    }

    @IsTest
    static void testGetAccountsFieldsPopulated() {
        Test.startTest();
        List<Account> result = AccountSearchController.getAccounts();
        Test.stopTest();

        Account first = result[0];
        System.assertNotEquals(null, first.Id,
            'Account Id should be populated');
        System.assertNotEquals(null, first.Name,
            'Account Name should be populated');
        System.assert(first.CreatedDate != null,
            'CreatedDate should always be populated by the system');
    }

    @IsTest
    static void testGetAccountsOrderedByCreatedDateDesc() {
        Test.startTest();
        List<Account> result = AccountSearchController.getAccounts();
        Test.stopTest();

        for (Integer i = 0; i < result.size() - 1; i++) {
            System.assert(
                result[i].CreatedDate >= result[i + 1].CreatedDate,
                'Results should be ordered by CreatedDate DESC'
            );
        }
    }

    // ─── Bulk Test ───────────────────────────────────────────────────────────

    @IsTest
    static void testGetAccountsHonorsLimitOfTenWhenMoreExist() {
        List<Account> bulkAccounts = new List<Account>();
        for (Integer i = 0; i < 200; i++) {
            bulkAccounts.add(new Account(Name = 'Bulk Account ' + i));
        }
        insert bulkAccounts;

        Test.startTest();
        List<Account> result = AccountSearchController.getAccounts();
        Test.stopTest();

        System.assertEquals(10, result.size(),
            'getAccounts() must return exactly 10 records when 200+ exist');
    }

    // ─── Exception Path ──────────────────────────────────────────────────────

    @IsTest
    static void testGetAccountsThrowsAuraHandledException() {
        AccountSearchController.throwExceptionForTest = true;

        Test.startTest();
        try {
            AccountSearchController.getAccounts();
            System.assert(false, 'Expected AuraHandledException to be thrown');
        } catch (AuraHandledException e) {
            System.assertNotEquals(null, e.getMessage(),
                'Exception message should not be null');
        }
        Test.stopTest();
    }

    // ─── Empty Org ───────────────────────────────────────────────────────────

    @IsTest
    static void testGetAccountsReturnsEmptyListWhenNoAccounts() {
        delete [SELECT Id FROM Account];

        Test.startTest();
        List<Account> result = AccountSearchController.getAccounts();
        Test.stopTest();

        System.assertNotEquals(null, result,
            'Result should not be null even when no accounts exist');
        System.assertEquals(0, result.size(),
            'Result should be empty when no accounts exist');
    }
}
