import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('empresas')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'razao_social', length: 200 })
  razaoSocial: string;

  @Column({ name: 'nome_fantasia', length: 200, nullable: true })
  nomeFantasia: string;

  @Column({ length: 18, nullable: true, unique: true })
  cnpj: string;

  @Column({ length: 100, nullable: true })
  segmento: string;

  @Column({ length: 255, nullable: true })
  website: string;

  @Column({ length: 20, nullable: true })
  telefone: string;

  @Column({ length: 255, nullable: true })
  endereco: string;

  @Column({ length: 100, nullable: true })
  cidade: string;

  @Column({ length: 2, nullable: true })
  estado: string;

  @Column({ length: 9, nullable: true })
  cep: string;

  @Column({ type: 'int', nullable: true })
  funcionarios: number;

  @Column({ name: 'faturamento_anual', type: 'decimal', precision: 15, scale: 2, nullable: true })
  faturamentoAnual: number;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
