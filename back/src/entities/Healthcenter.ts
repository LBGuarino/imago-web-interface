import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity({name: "healthcenters"})
export class Healthcenter{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({})
    name!: string;

    @Column()
    authorized!: string;

    @OneToMany(() => User, (user) => user.healthcenter, {
        cascade: true,
    })
    users!: User[];
}