import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum WorkshopStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('workshops')
export class Workshop {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 120 })
  name!: string;

  @Column({ length: 250 })
  address!: string;

  @Column({ type: 'enum', enum: WorkshopStatus, default: WorkshopStatus.ACTIVE })
  status!: WorkshopStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', select: false })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', select: false })
  updatedAt!: Date;
}
