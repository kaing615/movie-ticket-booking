import User from "../models/user.model.js";
import responseHandler from "../handlers/response.handler.js";
import jwt from "jsonwebtoken";

const tokenDecode = (req) => {
  const header = req.headers["authorization"];
  if (!header?.startsWith("Bearer ")) return false;
  const token = header.slice(7);
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    console.error("JWT verify failed:", e.name); 
    return false;
  }
};

const auth = async (req, res, next) => {
  const decoded = tokenDecode(req);
  if (!decoded) return responseHandler.unauthorized(res);

  const uid = decoded.id || decoded._id || decoded.sub;
  if (!uid) return responseHandler.unauthorized(res);

  const user = await User.findById(uid);
  if (!user) return responseHandler.unauthorized(res);

  if (process.env.NODE_ENV !== "development" && !user.isVerified) {
    return responseHandler.forbidden(res, "Email not verified");
  }

  req.user = user;
  next();
};

export default { auth, tokenDecode };
