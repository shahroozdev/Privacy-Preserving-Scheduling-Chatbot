import { AppDataSource } from "./data-source";
import { Room } from "./entity/Room";

async function seed() {
    await AppDataSource.initialize();
    console.log("Database connected. Seeding...");

    const roomRepo = AppDataSource.getRepository(Room);
    
    // Clear existing
    await roomRepo.clear();

    const rooms = [
        {
            name: "Room A (Small)",
            capacity: 4,
            features: ["whiteboard", "wifi"],
            availableSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"]
        },
        {
            name: "Room B (Medium)",
            capacity: 8,
            features: ["projector", "whiteboard", "wifi", "screen"],
            availableSlots: ["10:00", "13:00", "14:00"]
        },
        {
            name: "Room C (Large)",
            capacity: 20,
            features: ["projector", "video", "sound system", "wifi"],
            availableSlots: ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"]
        },
        {
            name: "Room D (Focus)",
            capacity: 2,
            features: ["monitor", "wifi"],
            availableSlots: ["09:00", "10:30", "11:00"]
        },
        {
            name: "Room E (Exec)",
            capacity: 10,
            features: ["tv", "conference phone", "wifi", "mac adapter"],
            availableSlots: ["14:00", "15:00"]
        }
    ];

    for (const r of rooms) {
        const room = new Room();
        room.name = r.name;
        room.capacity = r.capacity;
        room.features = r.features;
        room.availableSlots = r.availableSlots;
        await roomRepo.save(room);
    }

    console.log("Seeding complete.");
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
