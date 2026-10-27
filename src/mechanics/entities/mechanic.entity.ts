import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum MechanicStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('mechanics')
export class Mechanic {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'full_name', length: 120 })
  fullName!: string;

  @Column({ unique: true, length: 160 })
  email!: string;

  @Column({ length: 100 })
  specialty!: string;

  @Column({ type: 'enum', enum: MechanicStatus, default: MechanicStatus.ACTIVE })
  status!: MechanicStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', select: false })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', select: false })
  updatedAt!: Date;
}
