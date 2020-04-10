
export const CreditSchema = {
    name: 'Credit',
    properties: {
        id: { type: 'int', optional: true },
        topUpId: { type: 'string', optional: true },
        receipt_id:  { type: 'string', optional: true },
        customer_account_id: { type: 'string', optional: true },
        topup: { type: 'int', optional: true },
        balance: { type: 'int', optional: true },
        active: { type: 'bool', optional: true },
        syncAction: { type: 'string', optional: true },
        created_at: { type: 'date', optional: true },
        updated_at: { type: 'date', optional: true },
    }
};

export const CreditSyncDateSchema = {
    name: 'CreditSyncDate',
    properties: {
        lastCreditSync: 'date',
    }
};
