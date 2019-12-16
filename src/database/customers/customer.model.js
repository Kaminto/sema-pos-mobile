export const CustomerSchema = {
    name: 'Customer',
    properties: {
        id: { type: 'int', optional: true },
        topUpId: 'string',
        customer_account_id: { type: 'int' },
        topup: 'int',
        balance: 'int',
        active: { type: 'bool', optional: true },
        syncAction: { type: 'string', optional: true },
        created_at: 'date',
        updated_at: 'date'
    }
};

export const CustomerSyncDateSchema = {
    name: 'CustomerSyncDate',
    properties: {
        lastCustomerSync: 'date',
    }
};

