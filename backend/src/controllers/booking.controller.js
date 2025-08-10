import responseHandler from "../handlers/response.handler.js";
import Booking from "../models/booking.model.js";
import Ticket from "../models/ticket.model.js";

export const getBookingOfUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const { status } = req.query;

        let query = { userId };
        if (status) {
            query.status = status;
        }

        const bookings = await Booking.find(query)
            .populate({
                path: 'showId',
                populate: [
                    {
                        path: 'movieId',
                        select: 'movieName duration poster' // Thêm thông tin phim
                    },
                    {
                        path: 'roomId',
                        select: 'roomNumber',
                        populate: {
                            path: 'theaterId',
                            select: 'theaterName' // Thêm thông tin rạp
                        }
                    }
                ],
                select: 'startTime endTime' // Thêm giờ chiếu và kết thúc
            })
            .populate({
                path: 'seatIds',
                select: 'seatNumber seatType row' // Thêm thông tin ghế
            })
            .populate({
                path: 'tickets',
                populate: {
                    path: 'seatId',
                    select: 'seatNumber seatType row' // Thêm thông tin ghế cho ticket
                }
            })
            .sort({ createdAt: -1 });

        // Format lại dữ liệu trước khi trả về
        const formattedBookings = bookings.map(booking => {
            const bookingObj = booking.toObject();
            return {
                ...bookingObj,
                movieInfo: {
                    name: booking.showId.movieId.movieName,
                    duration: booking.showId.movieId.duration,
                    poster: booking.showId.movieId.poster
                },
                showInfo: {
                    startTime: booking.showId.startTime,
                    endTime: booking.showId.endTime
                },
                theaterInfo: {
                    theaterName: booking.showId.roomId.theaterId.theaterName,
                    roomNumber: booking.showId.roomId.roomNumber
                },
                seats: booking.seatIds.map(seat => ({
                    seatNumber: seat.seatNumber,
                    seatType: seat.seatType,
                    row: seat.row
                }))
            };
        });

        responseHandler.ok(res, {
            message: "Lấy danh sách đặt vé thành công!",
            bookings: formattedBookings
        });
    } catch (err) {
        console.error("Error fetching user bookings:", err);
        responseHandler.error(res, err.message);
    }
};

export const createBooking = async (req, res) => {
    try {
        const userId = req.user._id; // Lấy userId từ JWT token
        const {
            showId,
            seatIds,
            totalPrice
        } = req.body;

        // Kiểm tra xem ghế đã được đặt chưa
        const existingBooking = await Booking.findOne({
            showId,
            seatIds: { $in: seatIds },
            status: { $in: ["pending", "paid"] }
        });

        if (existingBooking) {
            return responseHandler.badRequest(res, "Một số ghế đã được đặt!");
        }

        const newBooking = new Booking({
            userId,
            showId,
            seatIds,
            totalPrice,
            status: "pending"
        });

        await newBooking.save();

        // Tạo các ticket tương ứng
        const tickets = await Promise.all(seatIds.map(async (seatId) => {
            const ticket = new Ticket({
                bookingId: newBooking._id,
                ownerId: userId,
                showId,
                seatId,
                price: totalPrice / seatIds.length, // Chia đều giá cho các ghế
                status: "active"
            });
            await ticket.save();
            return ticket;
        }));

        // Cập nhật lại booking với danh sách ticket
        newBooking.tickets = tickets.map(ticket => ticket._id);
        await newBooking.save();

        return responseHandler.created(res, {
            message: "Đặt vé thành công!",
            booking: newBooking
        });
    } catch (err) {
        console.error("Error creating booking:", err);
        responseHandler.error(res, err.message);
    }
};

export const updateBooking = async (req, res) => {
    try {
        const { status } = req.body;
        const bookingId = req.params.id;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return responseHandler.notFound(res, "Không tìm thấy đơn đặt vé!");
        }

        // Chỉ cho phép update những booking chưa bị cancel/expire
        if (["cancelled", "expired"].includes(booking.status)) {
            return responseHandler.badRequest(res, "Không thể cập nhật đơn đặt vé đã hủy/hết hạn!");
        }

        booking.status = status;

        // Nếu booking được thanh toán, cập nhật status của các ticket
        if (status === "paid") {
            await Ticket.updateMany(
                { bookingId: booking._id },
                { $set: { status: "active" } }
            );
        }

        // Nếu booking bị hủy, cập nhật status của các ticket
        if (status === "cancelled") {
            await Ticket.updateMany(
                { bookingId: booking._id },
                { $set: { status: "cancelled" } }
            );
        }

        await booking.save();

        responseHandler.ok(res, {
            message: "Cập nhật đơn đặt vé thành công!",
            booking
        });
    } catch (err) {
        console.error("Error updating booking:", err);
        responseHandler.error(res, err.message);
    }
};

export const deleteBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return responseHandler.notFound(res, "Không tìm thấy đơn đặt vé!");
        }

        // Chỉ cho phép xóa những booking ở trạng thái pending
        if (booking.status !== "pending") {
            return responseHandler.badRequest(res, "Chỉ có thể xóa đơn đặt vé đang chờ thanh toán!");
        }

        // Xóa các ticket liên quan
        await Ticket.deleteMany({ bookingId: booking._id });
        
        // Xóa booking
        await Booking.findByIdAndDelete(bookingId);

        responseHandler.ok(res, { 
            message: "Xóa đơn đặt vé thành công!" 
        });
    } catch (err) {
        console.error("Error deleting booking:", err);
        responseHandler.error(res, err.message);
    }
};

export default {
    createBooking,
    updateBooking,
    deleteBooking,
    getBookingOfUser
};