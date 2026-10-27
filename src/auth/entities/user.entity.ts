import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Mechanic } from '../../mechanics/entities/mechanic.entity.js';

export enum UserRole {
  ADMIN = 'ADMIN',
  TECHNICIAN = 'TECHNICIAN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, length: 160 })
  email!: string;

  @Column({ name: 'password_hash', select: false })
  passwordHash!: string;

  @Column({ type: 'enum', enum: UserRole })
  role!: UserRole;

  @OneToOne(() => Mechanic, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'mechanic_id' })
  mechanic?: Mechanic | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', select: false })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', select: false })
  updatedAt!: Date;
}
