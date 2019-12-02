var Realm = require('realm');
let realm;

// Realm schema creation
const SEMA_SCHEMA = {
    name: 'SemaRealm',
    primaryKey: 'id',
    properties: {
        id: 'string',
        data: 'string'
    }
};
export default realm = new Realm({ schema: [SEMA_SCHEMA] });