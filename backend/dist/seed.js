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
            { id: "R01", name: "Tesla Focus Room", capacity: 2, features: ["monitor", "wifi", "braille_signage"], availableSlots: ["09:00", "11:00", "16:00"] },
            { id: "R02", name: "Newton Small Room", capacity: 4, features: ["whiteboard", "wifi"], availableSlots: ["09:00", "10:00", "14:00"] },
            { id: "R03", name: "Einstein Medium Room", capacity: 8, features: ["projector", "wifi", "screen"], availableSlots: ["10:00", "13:00", "15:00"] },
            { id: "R04", name: "Curie Conference Room", capacity: 12, features: ["projector", "whiteboard", "wifi"], availableSlots: ["11:00", "14:00", "16:00"] },
            { id: "R05", name: "Darwin Strategy Room", capacity: 10, features: ["tv", "wifi", "conference phone"], availableSlots: ["09:00", "15:00"] },
            { id: "R06", name: "Edison Brainstorm Room", capacity: 6, features: ["whiteboard", "wifi"], availableSlots: ["10:00", "11:00", "13:00"] },
            { id: "R07", name: "Turing Lab", capacity: 20, features: ["projector", "sound system", "wifi"], availableSlots: ["08:00", "09:00", "10:00"] },
            { id: "R08", name: "Hawking Think Tank", capacity: 15, features: ["screen", "video", "wifi"], availableSlots: ["12:00", "14:00", "16:00"] },
            { id: "R09", name: "Feynman Focus Pod", capacity: 2, features: ["monitor", "wifi"], availableSlots: ["09:30", "11:30", "15:00"] },
            { id: "R10", name: "Galileo Meeting Room", capacity: 8, features: ["projector", "wifi"], availableSlots: ["10:00", "13:00"] },
            { id: "R11", name: "Copernicus Board Room", capacity: 14, features: ["tv", "wifi", "conference phone"], availableSlots: ["11:00", "14:00"] },
            { id: "R12", name: "Kepler Creative Room", capacity: 6, features: ["whiteboard", "wifi"], availableSlots: ["09:00", "12:00", "15:00"] },
            { id: "R13", name: "Faraday Innovation Lab", capacity: 18, features: ["projector", "sound system", "wifi"], availableSlots: ["10:00", "13:00", "16:00"] },
            { id: "R14", name: "Tesla Design Studio", capacity: 10, features: ["tv", "screen", "wifi"], availableSlots: ["09:00", "14:00"] },
            { id: "R15", name: "Bohr Discussion Room", capacity: 4, features: ["whiteboard", "wifi"], availableSlots: ["10:00", "11:00", "16:00"] },
            { id: "R16", name: "Planck Research Room", capacity: 6, features: ["monitor", "wifi"], availableSlots: ["09:00", "13:00", "15:00"] },
            { id: "R17", name: "Raman Audio Room", capacity: 12, features: ["sound system", "wifi"], availableSlots: ["11:00", "14:00"] },
            { id: "R18", name: "Hubble Observatory Room", capacity: 20, features: ["projector", "video", "wifi"], availableSlots: ["08:00", "10:00", "12:00"] },
            { id: "R19", name: "Sagan Vision Room", capacity: 10, features: ["tv", "wifi"], availableSlots: ["13:00", "15:00"] },
            { id: "R20", name: "Archimedes Think Room", capacity: 4, features: ["whiteboard", "wifi"], availableSlots: ["09:00", "11:00"] },
            { id: "R21", name: "Da Vinci Studio", capacity: 16, features: ["projector", "screen", "wifi"], availableSlots: ["10:00", "14:00"] },
            { id: "R22", name: "Pasteur Strategy Room", capacity: 8, features: ["whiteboard", "wifi"], availableSlots: ["09:00", "13:00", "16:00"] },
            { id: "R23", name: "Franklin Meeting Room", capacity: 6, features: ["monitor", "wifi"], availableSlots: ["10:30", "14:30"] },
            { id: "R24", name: "Bell Collaboration Room", capacity: 12, features: ["conference phone", "wifi"], availableSlots: ["11:00", "15:00"] },
            { id: "R25", name: "Jobs Executive Room", capacity: 10, features: ["tv", "wifi", "mac adapter"], availableSlots: ["14:00", "16:00"] },
            { id: "R26", name: "Wozniak Dev Room", capacity: 6, features: ["monitor", "wifi"], availableSlots: ["09:00", "11:00", "13:00"] },
            { id: "R27", name: "Gates Planning Room", capacity: 14, features: ["projector", "wifi"], availableSlots: ["10:00", "15:00"] },
            { id: "R28", name: "Musk Innovation Hub", capacity: 20, features: ["projector", "sound system", "wifi"], availableSlots: ["08:00", "12:00"] },
            { id: "R29", name: "Zuckerberg Sync Room", capacity: 8, features: ["screen", "wifi"], availableSlots: ["11:00", "14:00"] },
            { id: "R30", name: "Bezos Board Room", capacity: 16, features: ["tv", "conference phone", "wifi"], availableSlots: ["13:00", "16:00"] },
            { id: "R31", name: "Nash Strategy Pod", capacity: 2, features: ["monitor", "wifi"], availableSlots: ["09:30", "12:00"] },
            { id: "R32", name: "Turing AI Room", capacity: 18, features: ["projector", "screen", "wifi"], availableSlots: ["10:00", "14:00"] },
            { id: "R33", name: "Knuth Logic Room", capacity: 6, features: ["whiteboard", "wifi"], availableSlots: ["11:00", "15:00"] },
            { id: "R34", name: "Shannon Signal Room", capacity: 10, features: ["sound system", "wifi"], availableSlots: ["09:00", "13:00"] },
            { id: "R35", name: "Lovelace Coding Room", capacity: 4, features: ["monitor", "wifi"], availableSlots: ["10:00", "14:00"] },
            { id: "R36", name: "Berners-Lee Web Room", capacity: 8, features: ["projector", "wifi"], availableSlots: ["11:00", "16:00"] },
            { id: "R37", name: "Hinton ML Lab", capacity: 20, features: ["video", "projector", "wifi"], availableSlots: ["09:00", "12:00"] },
            { id: "R38", name: "LeCun Research Room", capacity: 12, features: ["screen", "wifi"], availableSlots: ["10:00", "15:00"] },
            { id: "R39", name: "Ng Training Room", capacity: 16, features: ["projector", "whiteboard", "wifi"], availableSlots: ["11:00", "14:00"] },
            { id: "R40", name: "Karpathy Vision Lab", capacity: 10, features: ["monitor", "wifi"], availableSlots: ["09:00", "13:00"] },
            { id: "R41", name: "Ritchie Systems Room", capacity: 6, features: ["whiteboard", "wifi"], availableSlots: ["10:00", "15:00"] },
            { id: "R42", name: "Thompson Unix Room", capacity: 8, features: ["monitor", "wifi"], availableSlots: ["11:00", "14:00"] },
            { id: "R43", name: "Torvalds Kernel Room", capacity: 12, features: ["screen", "wifi"], availableSlots: ["09:00", "13:00"] },
            { id: "R44", name: "Stroustrup C++ Room", capacity: 10, features: ["whiteboard", "wifi"], availableSlots: ["10:00", "16:00"] },
            { id: "R45", name: "Backus Compiler Room", capacity: 6, features: ["monitor", "wifi"], availableSlots: ["11:00", "15:00"] },
            { id: "R46", name: "McCarthy AI Room", capacity: 14, features: ["projector", "wifi"], availableSlots: ["09:00", "14:00"] },
            { id: "R47", name: "Minsky Cognitive Lab", capacity: 18, features: ["video", "sound system", "wifi"], availableSlots: ["10:00", "13:00"] },
            { id: "R48", name: "Brooks Architecture Room", capacity: 8, features: ["whiteboard", "wifi"], availableSlots: ["11:00", "16:00"] },
            { id: "R49", name: "Kay Learning Room", capacity: 6, features: ["screen", "wifi"], availableSlots: ["09:00", "12:00"] },
            { id: "R50", name: "Engelbart Innovation Room", capacity: 10, features: ["tv", "wifi"], availableSlots: ["14:00", "16:00"] }
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
