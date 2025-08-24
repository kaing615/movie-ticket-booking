import responseHandler from "../handlers/response.handler.js";

const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) return responseHandler.unauthorized(res);
    if (!allowedRoles.includes(role)) {
      return responseHandler.forbidden(res, "Forbidden");
    }
    next();
  };
};
export default authorizeRoles;
