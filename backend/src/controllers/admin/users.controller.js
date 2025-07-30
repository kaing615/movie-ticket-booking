import User from "../../models/user.model.js";
import responseHandler from "../../handlers/response.handler.js";

const getManagers = async (req, res) => {
	try {
		const users = await User.find({ role: "theater-manager" });
		responseHandler.ok(res, users);
	} catch (error) {
		responseHandler.error(res);
	}
};

export default { getManagers };
