import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type UserRole = 'admin' | 'gerente' | 'vendedor';

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nome: string;

  @Column({ unique: true, length: 150 })
  email: string;

  @Column({ select: false })
  senha: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'vendedor',
  })
  cargo: UserRole;

  @Column({ default: true })
  ativo: boolean;

  @Column({ nullable: true, length: 255 })
  avatar: string;

  @Column({ nullable: true, length: 20 })
  telefone: string;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
