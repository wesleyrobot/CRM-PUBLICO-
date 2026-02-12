import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddContactFieldsToLeads1770500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'leads',
      new TableColumn({
        name: 'whatsapp',
        type: 'varchar',
        length: '20',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'leads',
      new TableColumn({
        name: 'ddd',
        type: 'varchar',
        length: '3',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'leads',
      new TableColumn({
        name: 'razao_social',
        type: 'varchar',
        length: '200',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('leads', 'whatsapp');
    await queryRunner.dropColumn('leads', 'ddd');
    await queryRunner.dropColumn('leads', 'razao_social');
  }
}
