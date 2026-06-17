// Generic Apex mock — all @salesforce/apex imports resolve to a jest.fn()
const apexMock = jest.fn();
module.exports = apexMock;
