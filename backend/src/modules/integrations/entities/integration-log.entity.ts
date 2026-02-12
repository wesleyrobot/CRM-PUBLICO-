import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Integration, IntegrationEvent } from './integration.entity';

@Entity('integration_logs')
export class IntegrationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  integration_id: string;

  @ManyToOne(() => Integration)
  @JoinColumn({ name: 'integration_id' })
  integration: Integration;

  @Column({
    type: 'enum',
    enum: IntegrationEvent,
  })
  event: IntegrationEvent;

  @Column({ type: 'jsonb' })
  payload: any;

  @Column({ type: 'int', nullable: true })
  response_status?: number;

  @Column({ type: 'text', nullable: true })
  response_body?: string;

  @Column({ type: 'text', nullable: true })
  error?: string;

  @Column({ default: false })
  success: boolean;

  @Column({ type: 'int', nullable: true })
  duration_ms?: number;

  @CreateDateColumn()
  created_at: Date;
}
