export const CustomerObjSchema = {
    name: 'CustomerObj',
    properties: {
        active: { type: 'bool', optional: true },
        address_line1: { type: 'string', optional: true },
        address_line2: { type: 'string', optional: true },
        address_line3: { type: 'string', optional: true },
        consumer_base: { type: 'string', optional: true },
        created_at: { type: 'string', optional: true },
        customer_type_id: { type: 'int', optional: true },
        distance: { type: 'string', optional: true },
        due_amount: { type: 'string', optional: true },
        frequency: { type: 'string', optional: true },
        gender: { type: 'string', optional: true },
        gps_coordinates: { type: 'string', optional: true },
        id: { type: 'string', optional: true },
        income_level: { type: 'string', optional: true },
        kiosk_id: { type: 'int', optional: true },
        multimedia1: { type: 'string', optional: true },
        multimedia2: { type: 'string', optional: true },
        multimedia3: { type: 'string', optional: true },
        multimedia4: { type: 'string', optional: true },
        name: { type: 'string', optional: true },
        notes: { type: 'string', optional: true },
        phone_number: { type: 'string', optional: true },
        reminder_date: { type: 'string', optional: true },
        sales_channel_id: { type: 'int', optional: true },
        second_phone_number: { type: 'string', optional: true },
        updated_at: { type: 'string', optional: true },
        what3words: { type: 'string', optional: true },
    }
};

export const ProductObjSchema = {
    name: 'ProductObj',
    properties: {
        active: { type: 'bool', optional: true },
        category_id: { type: 'int', optional: true },
        cogs_amount: { type: 'string', optional: true },
        created_at: { type: 'string', optional: true },
        description: { type: 'string', optional: true },
        id: { type: 'int', optional: true },
        maximum_quantity: { type: 'int', optional: true },
        minimum_quantity: { type: 'int', optional: true },
        name: { type: 'string', optional: true },
        price_amount: { type: 'string', optional: true },
        price_currency: { type: 'string', optional: true },
        sku: { type: 'string', optional: true },
        unit_measure: { type: 'string', optional: true },
        unit_per_product: { type: 'int', optional: true },
        updated_at: { type: 'string', optional: true },
        wastage_name: { type: 'string', optional: true },
    }
};

export const OrderItemsSchema = {
    name: 'OrderItems',
    properties: {
        active: { type: 'bool', optional: true },
        cogs_total: { type: 'int', optional: true },
        created_at: { type: 'date', optional: true },
        currency_code: { type: 'string', optional: true },
        id: { type: 'int', optional: true },
        price_total: { type: 'int', optional: true },
        product: { type: 'ProductObj', optional: true },
        product_id: { type: 'int', optional: true },
        quantity: { type: 'int', optional: true },
        receipt_id: { type: 'string', optional: true },
        updated_at: { type: 'date', optional: true },
    }
};



export const OrderSchema = {
    name: 'Order',
    properties: {
        amount_card: { type: 'string', optional: true },
        amount_cash: { type: 'int', optional: true },
        amount_loan: { type: 'int', optional: true },
        amount_mobile: { type: 'int', optional: true },
        cogs: { type: 'int', optional: true },
        currency_code: { type: 'string', optional: true },
        customerAccountId: { type: 'string', optional: true },
        customer_account: { type: 'string', optional: true },
        //customer_account: {type: 'linkingObjects', objectType: 'Customer', property: 'orders'},
        customer_account_id: { type: 'string', optional: true },
        customer_type_id: { type: 'int', optional: true },
        delivery_id: { type: 'string', optional: true },
        id: { type: 'string', optional: true },
        isLocal: { type: 'string', optional: true },
        is_sponsor_selected: { type: 'bool', optional: true },
        kiosk_id: { type: 'int', optional: true },
        payment_type: { type: 'string', optional: true },
        //receipt_line_items: { type: 'OrderItems[]' },
        receipt_line_items: { type: 'string', optional: true },
        sales_channel_id: { type: 'int', optional: true },
        sponsor_amount: { type: 'string', optional: true },
        sponsor_id: { type: 'string', optional: true },
        total: { type: 'int', optional: true },
        user_id: { type: 'string', optional: true },
        uuid: { type: 'string', optional: true },
        receiptId: { type: 'string', optional: true },
        active: { type: 'bool', optional: true },
        status: { type: 'string', optional: true }, // pending - onCredit - fully paid
        syncAction: { type: 'string', optional: true },
        created_at: { type: 'date', optional: true },
        updated_at: { type: 'date', optional: true },
    }
};
