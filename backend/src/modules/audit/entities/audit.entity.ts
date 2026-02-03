import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE';

@Entity('auditoria')
export class Audit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  tabela: string;

  @Column({ length: 20 })
  acao: AuditAction;

  @Column({ name: 'registro_id', type: 'uuid' })
  registroId: string;

  @Column({ name: 'dados_anteriores', type: 'jsonb', nullable: true })
  dadosAnteriores: Record<string, any>;

  @Column({ name: 'dados_novos', type: 'jsonb', nullable: true })
  dadosNovos: Record<string, any>;

  @Column({ name: 'usuario_id', type: 'uuid', nullable: true })
  usuarioId: string;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;
}
