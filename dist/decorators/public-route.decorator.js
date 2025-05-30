"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicRoute = exports.PUBLIC_ROUTE_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.PUBLIC_ROUTE_KEY = 'public_route';
const PublicRoute = (isPublic = false) => (0, common_1.SetMetadata)(exports.PUBLIC_ROUTE_KEY, isPublic);
exports.PublicRoute = PublicRoute;
//# sourceMappingURL=public-route.decorator.js.map