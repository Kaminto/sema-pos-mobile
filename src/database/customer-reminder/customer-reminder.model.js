export const CustomerReminderSchema = {
    name: 'CustomerReminder',
    properties: {
        id: { type: 'int', optional: true },
        reminderId:  { type: 'string', optional: true },
        customer_account_id:  { type: 'string', optional: true },
        frequency: { type: 'int', optional: true },
        phoneNumber:  { type: 'string', optional: true },
        address:  { type: 'string', optional: true },
        name:  { type: 'string', optional: true },
        reminder_date:  { type: 'date', optional: true },
        active: { type: 'bool', optional: true },
        lastPurchaseDate:  { type: 'date', optional: true },
        customReminderDate:  { type: 'date', optional: true },
        syncAction: { type: 'string', optional: true },
        created_at: { type: 'date', optional: true },  
        updated_at: { type: 'date', optional: true },
    }
};