import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Room {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    capacity!: number;

    @Column("simple-array")
    features!: string[];

    @Column("simple-array", { nullable: true })
    availableSlots!: string[];
}
