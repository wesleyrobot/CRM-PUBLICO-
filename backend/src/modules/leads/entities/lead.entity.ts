import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export type LeadStatus = 'novo' | 'em_contato' | 'qualificado' | 'perdido';

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nome: string;

  @Column({ length: 150, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  telefone: string;

  @Column({ length: 100, nullable: true })
  cargo: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'novo',
  })
  status: LeadStatus;

  @Column({ length: 100, nullable: true })
  origem: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @Column({ type: 'int', default: 0 })
  pontuacao: number;

  @Column({ name: 'data_ultimo_contato', type: 'timestamp', nullable: true })
  dataUltimoContato: Date;

  @Column({ name: 'empresa_id', nullable: true })
  empresaId: string;

  @Column({ name: 'responsavel_id', nullable: true })
  responsavelId: string;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
