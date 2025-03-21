import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { MammographySeries } from "./MammoSeries";

@Entity({ name: "mammography_image" })
export class MammographyImage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 128, unique: true })
  sopInstanceUID!: string;

  @Column({ type: "text" })
  imageUrl!: string;

  // Metadata original ANTES de anonimizar
  @Column({ type: "jsonb", nullable: true })
  originalMetadata!: Record<string, any>;

  // Metadata anonimizada y procesada
  @Column({ type: "jsonb", nullable: true })
  processedMetadata!: Record<string, any>;

  @ManyToOne(() => MammographySeries, (series) => series.images, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "series_id" })
  series!: MammographySeries;
}
