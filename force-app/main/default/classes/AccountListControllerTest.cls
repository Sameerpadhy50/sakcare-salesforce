/**
 * @description Test class for AccountListController
 */
@IsTest
private class AccountListControllerTest {

    @TestSetup
    static void makeData() {
        List<Account> accounts = new List<Account>();
        for (Integer i = 0; i < 10; i++) {
            accounts.add(new Account(Name = 'Test Account ' + i, Industry = 'Technology'));
        }
        insert accounts;
    }

    @IsTest
    static void testGetAccountsPositive() {
        Test.startTest();
        List<Account> result = AccountListController.getAccounts();
        Test.stopTest();

        System.assertNotEquals(null, result, 'Result should not be null');
        System.assertEquals(5, result.size(), 'Should return exactly 5 accounts due to LIMIT 5');
    }

    @IsTest
    static void testGetAccountsBulk() {
        List<Account> bulkAccounts = new List<Account>();
        for (Integer i = 0; i < 200; i++) {
            bulkAccounts.add(new Account(Name = 'Bulk Account ' + i));
        }
        insert bulkAccounts;

        Test.startTest();
        List<Account> result = AccountListController.getAccounts();
        Test.stopTest();

        System.assertNotEquals(null, result, 'Result should not be null');
        System.assertEquals(5, result.size(), 'Should still return only 5 accounts due to LIMIT 5');
    }

    @IsTest
    static void testGetAccountsEmpty() {
        delete [SELECT Id FROM Account];

        Test.startTest();
        List<Account> result = AccountListController.getAccounts();
        Test.stopTest();

        System.assertNotEquals(null, result, 'Result should not be null even when no accounts exist');
        System.assertEquals(0, result.size(), 'Should return empty list when no accounts exist');
    }

    @IsTest
    static void testGetAccountsThrowsException() {
        AccountListController.throwExceptionForTest = true;

        Test.startTest();
        try {
            AccountListController.getAccounts();
            System.assert(false, 'Expected AuraHandledException');
        } catch (AuraHandledException e) {
            System.assertNotEquals(null, e.getMessage(), 'Exception message should not be null');
        }
        Test.stopTest();
    }
}
