import { Device } from "src/modules/devices/entities/device.entity";
import { UserDevice } from "src/modules/user_devive/entities/user_devive.entity";
import { User } from "src/modules/users/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity("binding")
export class Binding {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ unique: true, length: 50 })
    name: string;

    @ManyToOne(() => UserDevice, (UserDevice => UserDevice.id))
    UserDevice : UserDevice;

    @Column()
    deviceId: string;
    // @OneToMany(() => Device, (device => device.binding))
    // devices: Device[];
}
