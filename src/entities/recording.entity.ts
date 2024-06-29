import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('recording')
export class Recording {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'varchar', nullable: true })
  channelName: string;

  @Column({ type: 'varchar', nullable: true })
  uid: string;

  @Column({ type: 'varchar', nullable: true })
  resourceId: string;

  @Column({ type: 'varchar', nullable: true })
  sid: string;

  @Column({ type: 'varchar', nullable: true })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  filePath: string;
}
