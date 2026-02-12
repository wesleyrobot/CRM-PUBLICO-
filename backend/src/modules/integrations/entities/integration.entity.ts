import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum IntegrationType {
  WEBHOOK = 'webhook',
  API_REST = 'api_rest',
  ZAPIER = 'zapier',
  MAKE = 'make',
  N8N = 'n8n',
  CUSTOM = 'custom',
}

export enum IntegrationEvent {
  LEAD_CREATED = 'lead_created',
  LEAD_UPDATED = 'lead_updated',
  LEAD_DELETED = 'lead_deleted',
  CLIENT_CREATED = 'client_created',
  CLIENT_UPDATED = 'client_updated',
}

@Entity('integrations')
export class Integration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: IntegrationType,
    default: IntegrationType.WEBHOOK,
  })
  type: IntegrationType;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'varchar', length: 20, default: 'POST' })
  method: string;

  @Column({ type: 'text', nullable: true })
  auth_token?: string;

  @Column({ type: 'jsonb', default: {} })
  headers: Record<string, string>;

  @Column({ type: 'jsonb', default: {} })
  config: {
    retry_on_failure?: boolean;
    max_retries?: number;
    timeout_ms?: number;
    custom_payload_template?: string;
  };

  @Column({
    type: 'enum',
    enum: IntegrationEvent,
    array: true,
    default: [IntegrationEvent.LEAD_CREATED],
  })
  events: IntegrationEvent[];

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_triggered_at?: Date;

  @Column({ type: 'int', default: 0 })
  success_count: number;

  @Column({ type: 'int', default: 0 })
  error_count: number;

  @Column({ type: 'text', nullable: true })
  last_error?: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at?: Date;
}
