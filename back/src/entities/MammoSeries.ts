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
  
    // Lateralidad: "R" para derecha, "L" para izquierda
    @Column({ type: "enum", enum: ["R", "L"] })
      laterality!: "R" | "L";
  
    // Posición de la vista: "CC" (Cranio-Caudal), "MLO" (Medio-Lateral Oblicua)
    @Column({ type: "enum", enum: ["CC", "MLO"], nullable: true })
    viewPosition?: "CC" | "MLO";
  
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
