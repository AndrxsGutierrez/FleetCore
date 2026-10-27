import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  IN_MAINTENANCE = 'IN_MAINTENANCE',
  INACTIVE = 'INACTIVE',
}

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, length: 12 })
  plate!: string;

  @Column({ length: 80 })
  brand!: string;

  @Column({ length: 80 })
  model!: string;

  @Column({ type: 'smallint' })
  year!: number;

  @Column({ type: 'integer', default: 0 })
  mileage!: number;

  @Column({ type: 'enum', enum: VehicleStatus, default: VehicleStatus.AVAILABLE })
  status!: VehicleStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', select: false })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', select: false })
  updatedAt!: Date;
}
