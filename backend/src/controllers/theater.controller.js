import Theater from "../models/theater.model.js";
import responseHandler from "../handlers/response.handler.js";

const createTheater = async (req, res) => {
	try {
		res.status(200).json({ message: "Success" });
	} catch (error) {
		responseHandler.error(res);
	}
};

export default { createTheater };
