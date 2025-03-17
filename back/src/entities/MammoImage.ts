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

    @Column({ type: "varchar", length: 128 })
      sopInstanceUID!: string;
  
    @Column({ type: "text" })
      imageUrl!: string;
  
    // Aquí se almacena la información adicional específica de cada imagen en formato JSON.
    @Column({ type: "json", nullable: true })
      metadata!: Record<string, any>;
  
    @ManyToOne(() => MammographySeries, (series) => series.images, {
          onDelete: "CASCADE",
      })
      @JoinColumn({ name: "series_id" })
      series!: MammographySeries;
  }
  