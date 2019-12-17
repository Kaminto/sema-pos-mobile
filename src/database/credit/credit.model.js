
export const CreditSchema = {
    name: 'Credit',
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

export const CreditSyncDateSchema = {
    name: 'CreditSyncDate',
    properties: {
        lastCreditSync: 'date',
    }
};
