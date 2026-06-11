/**
 * @description Controller class to fetch top 10 Account records
 *              for display in the Account Search Datatable LWC.
 * @author      sf-sdlc skill
 * @date        2026-06-11
 */
public with sharing class AccountSearchController {

    @TestVisible
    private static Boolean throwExceptionForTest = false;

    /**
     * @description Retrieves top 10 Account records ordered by CreatedDate descending.
     *              Fields returned: Id, Name, Phone, Industry, BillingCity, Website, CreatedDate.
     * @return List<Account> up to 10 Account records
     */
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts() {
        try {
            if (throwExceptionForTest) {
                throw new AuraHandledException('Test exception');
            }
            return [
                SELECT Id,
                       Name,
                       Phone,
                       Industry,
                       BillingCity,
                       Website,
                       CreatedDate
                FROM   Account
                WITH   USER_MODE
                ORDER BY CreatedDate DESC
                LIMIT  10
            ];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
