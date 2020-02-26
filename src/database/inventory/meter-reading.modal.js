export const MeterReadingSchema = {
    name: 'MeterReading',
    properties: {
        id: { type: 'int', optional: true },
        meterReadingId: { type: 'string', optional: true },
        kiosk_id: { type: 'int', optional: true },
        meterValue: { type: 'int', optional: true },
        active: { type: 'bool', optional: true },
        syncAction: { type: 'string', optional: true },
        created_at: { type: 'date', optional: true },
        updated_at: { type: 'date', optional: true },
    }
};