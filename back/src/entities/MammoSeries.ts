import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { MammographyStudy } from "./MammoStudy";
import { MammographyImage } from "./MammoImage";

@Entity({ name: "mammography_series" })
export class MammographySeries {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 128 })
  seriesInstanceUID!: string;

  @Column({ type: "enum", enum: ["R", "L"] })
  laterality!: "R" | "L";

  @Column({
    type: "enum",
    enum: ["CC", "MLO", "RCC", "LCC", "RMLO", "LMLO"],
    nullable: true,
  })
  viewPosition?: "RCC" | "LCC" | "RMLO" | "LMLO" | "CC" | "MLO";

  @Column({ type: "text", nullable: true })
  seriesDescription?: string;

  @ManyToOne(() => MammographyStudy, (study) => study.series, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "study_id" })
  study!: MammographyStudy;

  @OneToMany(() => MammographyImage, (image) => image.series, {
    cascade: true,
  })
  images!: MammographyImage[];
}
