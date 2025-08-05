//Cách chạy: chạy lệnh
// cd backend
// node seed.js

import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs"; // Import bcrypt

// Import models
import User from "./src/models/user.model.js";
import TheaterSystem from "./src/models/theaterSystem.model.js";
import Theater from "./src/models/theater.model.js";
import Movie from "./src/models/movie.model.js";
import Room from "./src/models/room.model.js";
import Seat from "./src/models/seat.model.js";
import Show from "./src/models/show.model.js";
import Booking from "./src/models/booking.model.js";
import Ticket from "./src/models/ticket.model.js";
import Review from "./src/models/review.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URL;
console.log(MONGO_URI);
// const MONGO_URI = process.env.MONGO_URL || "mongodb://localhost:27017/moviebooking";
console.log(MONGO_URI);
const seedDatabase = async () => {
	try {
		await mongoose.connect(MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log("MongoDB connected for seeding...");

		// Clear existing data (optional)
		console.log("Clearing existing data...");
		await User.deleteMany({});
		await TheaterSystem.deleteMany({});
		await Theater.deleteMany({});
		await Movie.deleteMany({});
		await Room.deleteMany({});
		await Seat.deleteMany({});
		await Show.deleteMany({});
		await Booking.deleteMany({});
		await Ticket.deleteMany({});
		await Review.deleteMany({});
		console.log("Existing data cleared.");

		// 1. Create Users
		// Hash passwords before saving
		const salt = await bcrypt.genSalt(10);
		const adminPassword = await bcrypt.hash("password123", salt);
		const adminUser = await User.create({
			email: "admin@example.com",
			userName: "AdminUser",
			password: adminPassword,
			role: "admin",
			isVerified: true,
		});

		const managerPassword = await bcrypt.hash("password123", salt);
		const theaterManagerUser = await User.create({
			email: "manager@example.com",
			userName: "ManagerUser",
			password: managerPassword,
			role: "theater-manager",
			isVerified: true,
		});

		const customerPassword1 = await bcrypt.hash("password123", salt);
		const customerUser1 = await User.create({
			email: "customer1@example.com",
			userName: "CustomerUser1",
			password: customerPassword1,
			role: "customer",
			isVerified: true,
		});

		const customerPassword2 = await bcrypt.hash("password123", salt);
		const customerUser2 = await User.create({
			email: "customer2@example.com",
			userName: "CustomerUser2",
			password: customerPassword2,
			role: "customer",
			isVerified: true,
		});

		const anotherManagerPassword = await bcrypt.hash("securepass", salt);
		const anotherTheaterManagerUser = await User.create({
			email: "manager2@example.com",
			userName: "ManagerUser2",
			password: anotherManagerPassword,
			role: "theater-manager",
			isVerified: true,
		});
		console.log("Users created with hashed passwords.");

		// 2. Create TheaterSystems
		const cineplexSystem = await TheaterSystem.create({
			name: "Cineplex",
			code: "CPX",
			logo: "https://placehold.co/100x50/000/FFF?text=Cineplex",
			description: "Leading movie theater chain.",
		});

		const grandCinemasSystem = await TheaterSystem.create({
			name: "Grand Cinemas",
			code: "GCM",
			logo: "https://placehold.co/100x50/000/FFF?text=GrandC",
			description: "Premium movie experience.",
		});
		console.log("TheaterSystems created.");

		// 3. Create Theaters
		const downtownTheater = await Theater.create({
			managerId: theaterManagerUser._id,
			theaterName: "Downtown Cineplex",
			location: "123 Main St, Anytown",
			theaterSystemId: cineplexSystem._id,
		});

		const uptownTheater = await Theater.create({
			managerId: anotherTheaterManagerUser._id,
			theaterName: "Uptown Grand Cinemas",
			location: "456 Oak Ave, Bigcity",
			theaterSystemId: grandCinemasSystem._id,
		});
		console.log("Theaters created.");

		// 4. Create Rooms
		const room1Downtown = await Room.create({
			theaterId: downtownTheater._id,
			roomNumber: "Room 101",
		});

		const room2Downtown = await Room.create({
			theaterId: downtownTheater._id,
			roomNumber: "Room 102",
		});

		const room1Uptown = await Room.create({
			theaterId: uptownTheater._id,
			roomNumber: "Grand Hall A",
		});
		console.log("Rooms created.");

		// 5. Create Seats for Room 101 (Downtown)
		const seatsRoom101 = [];
		for (let i = 1; i <= 10; i++) {
			seatsRoom101.push(
				await Seat.create({
					roomId: room1Downtown._id,
					seatNumber: `A${i}`,
					seatType: "standard",
				})
			);
		}
		for (let i = 1; i <= 4; i++) {
			seatsRoom101.push(
				await Seat.create({
					roomId: room1Downtown._id,
					seatNumber: `VIP${i}`,
					seatType: "VIP",
				})
			);
		}
		// Seats for Room 102 (Downtown)
		const seatsRoom102 = [];
		for (let i = 1; i <= 8; i++) {
			seatsRoom102.push(
				await Seat.create({
					roomId: room2Downtown._id,
					seatNumber: `B${i}`,
					seatType: "standard",
				})
			);
		}
		// Seats for Grand Hall A (Uptown)
		const seatsGrandHallA = [];
		for (let i = 1; i <= 15; i++) {
			seatsGrandHallA.push(
				await Seat.create({
					roomId: room1Uptown._id,
					seatNumber: `C${i}`,
					seatType: "standard",
				})
			);
		}
		console.log("Seats created for various rooms.");

		// 6. Create Movies
		const movie1 = await Movie.create({
			movieName: "Dune: Part Two",
			description:
				"Paul Atreides unites with Chani and the Fremen while seeking revenge against those who destroyed his family.",
			genres: ["Sci-Fi", "Action", "Adventure"],
			duration: 166,
			releaseDate: new Date("2024-03-01T00:00:00Z"),
			country: "USA",
			poster: "https://placehold.co/200x300/000/FFF?text=Dune+2+Poster",
			banner: "https://placehold.co/800x400/000/FFF?text=Dune+2+Banner",
			movieRating: "T13",
			status: "showing",
			director: "Denis Villeneuve",
			trailer: "https://www.youtube.com/embed/SomeDuneTrailer",
			allowedShowStart: new Date("2024-02-28T00:00:00Z"),
		});

		const movie2 = await Movie.create({
			movieName: "Kung Fu Panda 4",
			description:
				"Po is tapped to become the Spiritual Leader of the Valley of Peace, but first, he needs to find and train a new Dragon Warrior.",
			genres: ["Animation", "Action", "Adventure"],
			duration: 94,
			releaseDate: new Date("2024-03-08T00:00:00Z"),
			country: "USA",
			poster: "https://placehold.co/200x300/000/FFF?text=KFP4+Poster",
			banner: "https://placehold.co/800x400/000/FFF?text=KFP4+Banner",
			movieRating: "P",
			status: "showing",
			director: "Mike Mitchell",
			trailer: "https://www.youtube.com/embed/SomeKFP4Trailer",
			allowedShowStart: new Date("2024-03-05T00:00:00Z"),
		});

		const movie3 = await Movie.create({
			movieName: "The Creator",
			description:
				"A future war between the human race and the forces of artificial intelligence.",
			genres: ["Sci-Fi", "Action", "Drama"],
			duration: 133,
			releaseDate: new Date("2023-09-29T00:00:00Z"),
			country: "USA",
			poster: "https://placehold.co/200x300/000/FFF?text=Creator+Poster",
			banner: "https://placehold.co/800x400/000/FFF?text=Creator+Banner",
			movieRating: "T16",
			status: "ended",
			director: "Gareth Edwards",
			trailer: "https://www.youtube.com/embed/SomeCreatorTrailer",
			allowedShowStart: new Date("2023-09-28T00:00:00Z"),
		});

		const movie4 = await Movie.create({
			movieName: "Inside Out 2",
			description:
				"Riley's mind is undergoing a sudden demolition to make room for something entirely unexpected: new Emotions!",
			genres: ["Animation", "Comedy", "Drama"],
			duration: 96,
			releaseDate: new Date("2024-06-14T00:00:00Z"),
			country: "USA",
			poster: "https://placehold.co/200x300/000/FFF?text=IO2+Poster",
			banner: "https://placehold.co/800x400/000/FFF?text=IO2+Banner",
			movieRating: "P",
			status: "coming",
			director: "Kelsey Mann",
			trailer: "https://www.youtube.com/embed/SomeIO2Trailer",
			allowedShowStart: new Date("2024-06-10T00:00:00Z"),
		});
		console.log("Movies created.");

		// 7. Create Shows
		const show1_downtown_movie1 = await Show.create({
			movieId: movie1._id,
			theaterId: downtownTheater._id,
			roomId: room1Downtown._id,
			startTime: new Date("2025-07-20T14:00:00Z"),
			endTime: new Date("2025-07-20T16:46:00Z"), // 166 minutes after start
			status: "planned",
		});

		const show2_downtown_movie2 = await Show.create({
			movieId: movie2._id,
			theaterId: downtownTheater._id,
			roomId: room1Downtown._id,
			startTime: new Date("2025-07-20T17:00:00Z"),
			endTime: new Date("2025-07-20T18:34:00Z"), // 94 minutes after start
			status: "planned",
		});

		const show3_downtown_movie1_late = await Show.create({
			movieId: movie1._id,
			theaterId: downtownTheater._id,
			roomId: room2Downtown._id,
			startTime: new Date("2025-07-20T20:00:00Z"),
			endTime: new Date("2025-07-20T22:46:00Z"),
			status: "planned",
		});

		const show4_uptown_movie2 = await Show.create({
			movieId: movie2._id,
			theaterId: uptownTheater._id,
			roomId: room1Uptown._id,
			startTime: new Date("2025-07-21T10:30:00Z"),
			endTime: new Date("2025-07-21T12:04:00Z"),
			status: "planned",
		});

		const show5_uptown_movie3 = await Show.create({
			movieId: movie3._id,
			theaterId: uptownTheater._id,
			roomId: room1Uptown._id,
			startTime: new Date("2025-07-21T13:00:00Z"),
			endTime: new Date("2025-07-21T15:13:00Z"),
			status: "finished", // Example of a finished show
		});
		console.log("Shows created.");

		// 8. Create Bookings
		const bookedSeats1 = [seatsRoom101[0]._id, seatsRoom101[1]._id]; // A1, A2
		const booking1 = await Booking.create({
			userId: customerUser1._id,
			showId: show1_downtown_movie1._id,
			seatIds: bookedSeats1,
			totalPrice: 2 * 10.0,
			status: "paid",
		});

		const bookedSeats2 = [
			seatsRoom101[5]._id,
			seatsRoom101[6]._id,
			seatsRoom101[7]._id,
		]; // A6, A7, A8
		const booking2 = await Booking.create({
			userId: customerUser2._id,
			showId: show2_downtown_movie2._id,
			seatIds: bookedSeats2,
			totalPrice: 3 * 10.0,
			status: "pending", // Example of pending booking
		});

		const bookedSeats3 = [seatsGrandHallA[0]._id]; // C1
		const booking3 = await Booking.create({
			userId: customerUser1._id,
			showId: show4_uptown_movie2._id,
			seatIds: bookedSeats3,
			totalPrice: 1 * 12.5, // Different price for Uptown
			status: "paid",
		});
		console.log("Bookings created.");

		// 9. Create Tickets for the Bookings
		const ticket1_b1 = await Ticket.create({
			bookingId: booking1._id,
			ownerId: customerUser1._id,
			showId: show1_downtown_movie1._id,
			price: 10.0,
			seatId: seatsRoom101[0]._id,
		});
		const ticket2_b1 = await Ticket.create({
			bookingId: booking1._id,
			ownerId: customerUser1._id,
			showId: show1_downtown_movie1._id,
			price: 10.0,
			seatId: seatsRoom101[1]._id,
		});
		booking1.tickets.push(ticket1_b1._id, ticket2_b1._id);
		await booking1.save();

		const ticket1_b2 = await Ticket.create({
			bookingId: booking2._id,
			ownerId: customerUser2._id,
			showId: show2_downtown_movie2._id,
			price: 10.0,
			seatId: seatsRoom101[5]._id,
		});
		const ticket2_b2 = await Ticket.create({
			bookingId: booking2._id,
			ownerId: customerUser2._id,
			showId: show2_downtown_movie2._id,
			price: 10.0,
			seatId: seatsRoom101[6]._id,
		});
		const ticket3_b2 = await Ticket.create({
			bookingId: booking2._id,
			ownerId: customerUser2._id,
			showId: show2_downtown_movie2._id,
			price: 10.0,
			seatId: seatsRoom101[7]._id,
		});
		booking2.tickets.push(ticket1_b2._id, ticket2_b2._id, ticket3_b2._id);
		await booking2.save();

		const ticket1_b3 = await Ticket.create({
			bookingId: booking3._id,
			ownerId: customerUser1._id,
			showId: show4_uptown_movie2._id,
			price: 12.5,
			seatId: seatsGrandHallA[0]._id,
		});
		booking3.tickets.push(ticket1_b3._id);
		await booking3.save();
		console.log("Tickets created and linked to bookings.");

		// 10. Create Reviews
		const review1_movie1_user1 = await Review.create({
			userId: customerUser1._id,
			movieId: movie1._id,
			rating: 9,
			comment: "Absolutely epic! A masterpiece of sci-fi.",
		});
		movie1.ratingScore += review1_movie1_user1.rating;
		movie1.ratingCount += 1;

		const review2_movie1_user2 = await Review.create({
			userId: customerUser2._id,
			movieId: movie1._id,
			rating: 8,
			comment: "Visually stunning and great story.",
		});
		movie1.ratingScore += review2_movie1_user2.rating;
		movie1.ratingCount += 1;

		const review1_movie2_user1 = await Review.create({
			userId: customerUser1._id,
			movieId: movie2._id,
			rating: 7,
			comment: "Fun for the whole family, classic Po.",
		});
		movie2.ratingScore += review1_movie2_user1.rating;
		movie2.ratingCount += 1;

		const review1_movie3_user2 = await Review.create({
			userId: customerUser2._id,
			movieId: movie3._id,
			rating: 6,
			comment: "Interesting concept, but a bit slow at times.",
		});
		movie3.ratingScore += review1_movie3_user2.rating;
		movie3.ratingCount += 1;

		await movie1.save();
		await movie2.save();
		await movie3.save();
		console.log("Reviews created and movie ratings updated.");

		console.log(
			"Database seeding completed successfully with diverse data!"
		);
	} catch (error) {
		console.error("Error seeding database:", error);
		process.exit(1); // Exit with a non-zero code to indicate an error
	} finally {
		await mongoose.disconnect();
		console.log("MongoDB disconnected.");
	}
};

seedDatabase();
