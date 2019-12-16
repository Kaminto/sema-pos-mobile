export const CustomerSchema = {
    name: 'Customer',
    properties: {
        id: { type: 'string', optional: true },
        customerId: { type: 'string', optional: true },
        name: { type: 'string', optional: true },
        customerTypeId: { type: 'int', optional: true },
        salesChannelId: { type: 'int', optional: true },
        siteId: { type: 'int', optional: true },
        reminder_date: { type: 'string', optional: true },
        frequency: { type: 'string', optional: true },
        dueAmount: { type: 'int', optional: true },
        address: { type: 'string', optional: true },
        gpsCoordinates: { type: 'string', optional: true },
        phoneNumber: { type: 'string', optional: true },
        secondPhoneNumber: { type: 'string', optional: true },
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

