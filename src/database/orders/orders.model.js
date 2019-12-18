export const ProductMRPSchema = {
    name: 'ProductMRP',
    properties: {
        id: { type: 'int', optional: true },
        currencyCode: 'string',
        priceAmount: { type: 'int' },
        cogsAmount: 'int',
        productId: { type: 'int' },
        salesChannelId: { type: 'int' },
        siteId: { type: 'int' },
        active: { type: 'bool', optional: true },
        syncAction: { type: 'string', optional: true },
        created_at: { type: 'date', optional: true },
        updated_at: { type: 'date', optional: true },
    }
};

// active: 1
// amountCash: 5111
// amountLoan: 0
// amountMobile: 0
// cogs: 22090
// createdDate: "2019-12-17T18:00:29.409Z"
// currencyCode: "ugx"
// customerId: "07845fb0-3030-11e9-a440-41d55a52b4dc"
// customerTypeId: 5
// id: "517a4540-20f7-11ea-a04e-53e9ba2e5ac2"
// paymentType: ""
// products: (2) [{…}, {…}]
// receiptId: "518c1f90-20f7-11ea-a04e-53e9ba2e5ac2"
// salesChannelId: 2
// siteId: 1112
// total: 5111



// active: true
// amount_card: "0.00"
// amount_cash: "16000.00"
// amount_loan: "0.00"
// amount_mobile: "0.00"
// cogs: "4"
// created_at: "2019-12-12T08:40:45.000Z"
// currency_code: "rwf"
// customerAccountId: "0529f4f0-3030-11e9-8cd3-d92736264baf"
// customer_account: {id: "0529f4f0-3030-11e9-8cd3-d92736264baf", created_at: "2019-02-14T08:10:41.000Z", updated_at: "2019-11-24T16:36:03.000Z", active: true, name: "Jeanine sengiyumva", …}
// customer_account_id: "0529f4f0-3030-11e9-8cd3-d92736264baf"
// customer_type_id: 6
// delivery_id: null
// id: "1bb8cf20-1cbb-11ea-a7ec-8b2686df22b6"
// isLocal: false
// is_sponsor_selected: false
// kiosk_id: 1112
// payment_type: ""
// receipt_line_items: [{…}]
// sales_channel_id: 2
// sponsor_amount: "0.00"
// sponsor_id: null
// total: "16000.00"
// updated_at: "2019-12-12T08:40:45.000Z"
// user_id: null
// uuid: "1bbd3bf0-1cbb-11ea-a7ec-8b2686df22b6"