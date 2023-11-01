import { Device } from 'src/modules/devices/entities/device.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class Chart {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('timestamp')
    Date: Date;

    @Column('int')
    timestamp: number;

    @ManyToOne(() => Device, (device) => device.startTime)
    device: Device;
}
