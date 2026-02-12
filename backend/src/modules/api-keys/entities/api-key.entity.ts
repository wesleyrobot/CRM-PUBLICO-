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

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nome: string;

  @Column({ unique: true, length: 64 })
  chave: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @Column({ default: true })
  ativo: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expira_em?: Date;

  @Column({ type: 'timestamp', nullable: true })
  ultimo_uso?: Date;

  @Column({ type: 'jsonb', default: {} })
  permissoes: {
    criar_leads?: boolean;
    ler_leads?: boolean;
    atualizar_leads?: boolean;
    deletar_leads?: boolean;
    ler_clientes?: boolean;
    ler_empresas?: boolean;
  };

  @Column({ type: 'uuid' })
  usuario_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @CreateDateColumn()
  criado_em: Date;

  @UpdateDateColumn()
  atualizado_em: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletado_em?: Date;
}
