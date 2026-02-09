"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("./data-source");
const Room_1 = require("./entity/Room");
function seed() {
    return __awaiter(this, void 0, void 0, function* () {
        yield data_source_1.AppDataSource.initialize();
        console.log("Database connected. Seeding...");
        const roomRepo = data_source_1.AppDataSource.getRepository(Room_1.Room);
        // Clear existing
        yield roomRepo.clear();
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
            const room = new Room_1.Room();
            room.name = r.name;
            room.capacity = r.capacity;
            room.features = r.features;
            room.availableSlots = r.availableSlots;
            yield roomRepo.save(room);
        }
        console.log("Seeding complete.");
        process.exit(0);
    });
}
seed().catch(err => {
    console.error(err);
    process.exit(1);
});
