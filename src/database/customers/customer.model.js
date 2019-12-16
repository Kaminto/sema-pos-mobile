export const CustomerSchema = {
    name: 'Customer',
    properties: {
        id: { type: 'string', optional: true },
        customerId: 'string',
        name: { type: 'string' },
        customerTypeId: { type: 'int' },
        salesChannelId: { type: 'int' },
        siteId: { type: 'int' },
        reminder_date: { type: 'string', optional: true },
        frequency: { type: 'string' },
        dueAmount: { type: 'int' },
        address: { type: 'string' },
        gpsCoordinates: { type: 'string' },
        phoneNumber: { type: 'string' },
        secondPhoneNumber: { type: 'string' },
        active: { type: 'bool', optional: true },
        syncAction: { type: 'string', optional: true },
        createdDate: 'date',
        updatedDate: 'date'
    }

};

export const CustomerSyncDateSchema = {
    name: 'CustomerSyncDate',
    properties: {
        lastCustomerSync: 'date',
    }
};

