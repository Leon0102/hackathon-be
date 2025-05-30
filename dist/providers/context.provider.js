"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextProvider = void 0;
const express_ctx_1 = require("express-ctx");
class ContextProvider {
    static get(key) {
        return (0, express_ctx_1.getValue)(ContextProvider.getKeyWithNamespace(key));
    }
    static set(key, value) {
        (0, express_ctx_1.setValue)(ContextProvider.getKeyWithNamespace(key), value);
    }
    static getKeyWithNamespace(key) {
        return `${ContextProvider.nameSpace}.${key}`;
    }
    static setAuthUser(user) {
        ContextProvider.set(ContextProvider.authUserKey, user);
    }
    static getAuthUser() {
        return ContextProvider.get(ContextProvider.authUserKey);
    }
}
exports.ContextProvider = ContextProvider;
ContextProvider.nameSpace = 'request';
ContextProvider.authUserKey = 'user_key';
//# sourceMappingURL=context.provider.js.map