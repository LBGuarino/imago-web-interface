import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MammographySeries } from "./MammoSeries";

@Entity({ name: "mammography_study" })
export class MammographyStudy {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 128 })
  studyInstanceUID!: string;

  @Column({ type: "varchar", length: 64 })
  patientId!: string;

  @Column({ type: "varchar", length: 128 })
  patientName!: string;

  @Column({ type: "timestamp" })
  studyDate!: Date;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "varchar", length: 2, default: "MG" })
  modality!: string;

  @OneToMany(() => MammographySeries, (series) => series.study, {
    cascade: true,
  })
  series!: MammographySeries[];
}
