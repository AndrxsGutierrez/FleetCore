import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Mechanic } from '../../mechanics/entities/mechanic.entity.js';
import { Vehicle } from '../../vehicles/entities/vehicle.entity.js';
import { Workshop } from '../../workshops/entities/workshop.entity.js';

export enum MaintenanceType {
  PREVENTIVE = 'PREVENTIVE',
  CORRECTIVE = 'CORRECTIVE',
}

export enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('maintenances')
export class Maintenance {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'enum', enum: MaintenanceType })
  type!: MaintenanceType;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'integer' })
  mileage!: number;

  @Column({ name: 'scheduled_date', type: 'timestamptz' })
  scheduledDate!: Date;

  @Column({ name: 'scheduled_end_date', type: 'timestamptz' })
  scheduledEndDate!: Date;

  @Column({
    type: 'enum',
    enum: MaintenanceStatus,
    default: MaintenanceStatus.SCHEDULED,
  })
  status!: MaintenanceStatus;

  @Column({ name: 'work_performed', type: 'text', nullable: true })
  workPerformed!: string | null;

  @Column({
    name: 'final_cost',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value?: number | null) => value,
      from: (value?: string | null) => (value == null ? value : Number(value)),
    },
  })
  finalCost!: number | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  @Column({ name: 'final_mileage', type: 'integer', nullable: true })
  finalMileage!: number | null;

  @ManyToOne(() => Vehicle, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle!: Vehicle;

  @ManyToOne(() => Mechanic, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'mechanic_id' })
  mechanic!: Mechanic;

  @ManyToOne(() => Workshop, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'workshop_id' })
  workshop!: Workshop;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', select: false })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', select: false })
  updatedAt!: Date;
}
