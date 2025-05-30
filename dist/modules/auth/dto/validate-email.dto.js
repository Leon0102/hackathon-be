"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateEmailDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const user_register_dto_1 = require("./user-register.dto");
class ValidateEmailDto extends (0, swagger_1.PickType)(user_register_dto_1.UserRegisterDto, ['email']) {
}
exports.ValidateEmailDto = ValidateEmailDto;
//# sourceMappingURL=validate-email.dto.js.map