export const SettingsSchema = {
    name: 'Settings',
    properties: {
        semaUrl: { type: 'string', optional: true },
        site: { type: 'string', optional: true },
        user: { type: 'string', optional: true },
        password: { type: 'string', optional: true },
        uiLanguage: { type: 'string', optional: true },
        siteId: { type: 'string', optional: true },
        token: { type: 'string', optional: true },
        loginSync: { type: 'bool', optional: true },
    }
};


