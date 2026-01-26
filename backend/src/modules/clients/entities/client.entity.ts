import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('clientes')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nome: string;

  @Column({ length: 150, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  telefone: string;

  @Column({ length: 20, nullable: true })
  celular: string;

  @Column({ length: 100, nullable: true })
  cargo: string;

  @Column({ length: 100, nullable: true })
  departamento: string;

  @Column({ name: 'data_nascimento', type: 'date', nullable: true })
  dataNascimento: Date;

  @Column({ default: true })
  ativo: boolean;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @Column({ name: 'empresa_id', nullable: true })
  empresaId: string;

  @Column({ name: 'responsavel_id', nullable: true })
  responsavelId: string;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
