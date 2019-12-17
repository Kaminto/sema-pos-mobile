export const CustomerTypesSchema = {
    name: 'CustomerType',
    properties: {
        id: { type: 'int', optional: true },
        description: { type: 'string', optional: true },
        name: { type: 'string', optional: true },
        salesChannelId: { type: 'int', optional: true },
        salesChannelName: { type: 'string', optional: true },
    }
};
  