"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthUser = void 0;
const common_1 = require("@nestjs/common");
function AuthUser() {
    return (0, common_1.createParamDecorator)((_data, context) => {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (user === null || user === void 0 ? void 0 : user[Symbol.for('isPublic')]) {
            return;
        }
        return user;
    })();
}
exports.AuthUser = AuthUser;
//# sourceMappingURL=auth-user.decorator.js.map