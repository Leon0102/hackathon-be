"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = void 0;
const passport_1 = require("@nestjs/passport");
function AuthGuard(options) {
    const strategies = ['jwt'];
    if (options === null || options === void 0 ? void 0 : options.public) {
        strategies.push('public');
    }
    return (0, passport_1.AuthGuard)(strategies);
}
exports.AuthGuard = AuthGuard;
//# sourceMappingURL=auth.guard.js.map