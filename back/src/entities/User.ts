import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from "typeorm";
import { Healthcenter } from "./Healthcenter";
  
  
  @Entity({ name: "users" })
  export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 255, nullable: false })
    uid!: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    title!: string;
  
    @Column({ type: "varchar", length: 255, nullable: false })
    firstName!: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    lastName!: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    dni!: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    address!: string;
  
    @ManyToOne(() => Healthcenter, (healthcenter) => healthcenter.users)
    @JoinColumn({ name: "healthcenter_id" })
    healthcenter!: Healthcenter;
  
  }
  