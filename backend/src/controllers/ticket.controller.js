import responseHandler from "../handlers/response.handler.js";
import Ticket from "../models/ticket.model.js";
import Booking from "../models/booking.model.js";

export const getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('showId', 'startTime movieId')
            .populate('seatId', 'seatNumber row')
            .populate('ownerId', 'userName email');

        if (!ticket || ticket.isDeleted) {
            return responseHandler.notFound(res, "Không tìm thấy vé!");
        }

        responseHandler.ok(res, {
            message: "Lấy thông tin vé thành công!",
            ticket
        });
    } catch (err) {
        responseHandler.error(res, err.message);
    }
};

export const getUserTickets = async (req, res) => {
    try {
        const userId = req.user._id;
        const { status } = req.query;

        let query = { 
            ownerId: userId,
            isDeleted: false
        };
        if (status) {
            query.status = status;
        }

        const tickets = await Ticket.find(query)
            .populate('showId', 'startTime movieId')
            .populate('seatId', 'seatNumber row')
            .sort({ createdAt: -1 });

        responseHandler.ok(res, {
            message: "Lấy danh sách vé thành công!",
            tickets
        });
    } catch (err) {
        responseHandler.error(res, err.message);
    }
};

export const markTicketAsUsed = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const ticket = await Ticket.findById(ticketId);

        if (!ticket || ticket.isDeleted) {
            return responseHandler.notFound(res, "Không tìm thấy vé!");
        }

        if (ticket.status !== "active") {
            return responseHandler.badRequest(res, "Vé không hợp lệ hoặc đã được sử dụng!");
        }

        ticket.status = "used";
        await ticket.save();

        // Cập nhật booking để cho phép review
        const booking = await Booking.findById(ticket.bookingId);
        if (booking) {
            const allTickets = await Ticket.find({ bookingId: booking._id });
            const allUsed = allTickets.every(t => t.status === "used");
            
            if (allUsed) {
                booking.canReview = true;
                await booking.save();
            }
        }

        responseHandler.ok(res, {
            message: "Cập nhật trạng thái vé thành công!",
            ticket
        });
    } catch (err) {
        responseHandler.error(res, err.message);
    }
};

export const cancelTicket = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const ticket = await Ticket.findById(ticketId);

        if (!ticket || ticket.isDeleted) {
            return responseHandler.notFound(res, "Không tìm thấy vé!");
        }

        if (ticket.status !== "active") {
            return responseHandler.badRequest(res, "Chỉ có thể hủy vé chưa sử dụng!");
        }

        ticket.status = "cancelled";
        await ticket.save();

        // Cập nhật trạng thái booking nếu cần
        const booking = await Booking.findById(ticket.bookingId);
        if (booking) {
            const remainingActiveTickets = await Ticket.countDocuments({
                bookingId: booking._id,
                status: "active"
            });
            
            if (remainingActiveTickets === 0) {
                booking.status = "cancelled";
                await booking.save();
            }
        }

        responseHandler.ok(res, {
            message: "Hủy vé thành công!",
            ticket
        });
    } catch (err) {
        responseHandler.error(res, err.message);
    }
};

export const refundTicket = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const ticket = await Ticket.findById(ticketId);

        if (!ticket || ticket.isDeleted) {
            return responseHandler.notFound(res, "Không tìm thấy vé!");
        }

        if (ticket.status !== "cancelled") {
            return responseHandler.badRequest(res, "Chỉ có thể hoàn tiền cho vé đã hủy!");
        }

        ticket.status = "refunded";
        await ticket.save();

        responseHandler.ok(res, {
            message: "Hoàn tiền vé thành công!",
            ticket
        });
    } catch (err) {
        responseHandler.error(res, err.message);
    }
};

export default {
    getTicketById,
    getUserTickets,
    markTicketAsUsed,
    cancelTicket,
    refundTicket
};