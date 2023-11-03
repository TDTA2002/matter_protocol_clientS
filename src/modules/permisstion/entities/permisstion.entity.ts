import { UserDevice } from 'src/modules/user_devive/entities/user_devive.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class Permisstion {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string

    @Column()
    node_id: number

    @Column()
    userId: string

    @Column({ default: false })
    isDeviceOn: boolean;

    @Column({ default: false })
    active: boolean

    @ManyToOne(() => UserDevice, (user) => user.permiss)
    user: UserDevice;

}

