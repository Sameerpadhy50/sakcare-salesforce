/**
 * @description Provides Account records for the accountListViewer LWC.
 * @author generated
 * @date 2026-06-12
 */
public with sharing class AccountListController {

    @TestVisible
    private static Boolean throwExceptionForTest = false;

    /**
     * @description Returns up to 5 Account records with key fields for display.
     * @return List of Account records
     */
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts() {
        try {
            if (throwExceptionForTest) {
                throw new AuraHandledException('Test exception');
            }
            return [
                SELECT Id, Name, Industry, Phone, Owner.Name
                FROM Account
                WITH USER_MODE
                ORDER BY CreatedDate DESC
                LIMIT 5
            ];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
