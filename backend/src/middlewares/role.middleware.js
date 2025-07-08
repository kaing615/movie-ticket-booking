import responseHandler from "../handlers/response.handler.js";
/**
 * Middleware to authorize user roles.
 *
 * @param {string[]} allowedRoles - Array of roles that are allowed to access the route.
 *
 * @returns {Function} Middleware function that checks if the user's role is authorized.
 * If the user's role is not in the allowedRoles, it responds with unauthorized status.
 */

const authorizeRoles = (allowedRoles) => {
	return (req, res, next) => {
		const userrole = req.user?.role;
		if (!userrole || !allowedRoles.includes(userrole)) {
			return responseHandler.unauthorized(res);
		}
		next();
	};
};
export default authorizeRoles;
