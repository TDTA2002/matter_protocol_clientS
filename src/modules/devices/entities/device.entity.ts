
import { UserDevice } from "src/modules/user_devive/entities/user_devive.entity";
import { BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Binding } from "src/modules/binding/entities/binding.entity";
import { Chart } from "src/modules/chart/entities/chart.entity";
@Entity("devices")
export class Device {
    @PrimaryGeneratedColumn('uuid')
    id: string


   @Column()
   name: string;

   @Column()
   node_id: number; // number

    @Column()
    power: number

    @Column({ default: false })
    isDeviceOn: boolean;

    @Column({ default: () => 'CURRENT_TIMESTAMP' }) // Sử dụng CURRENT_TIMESTAMP để tự động lưu thời gian hiện tại
    startTime: Date;

    @BeforeUpdate()
    async setUpdateTime() {
        this.startTime = new Date(); // Cập nhật thời gian mỗi khi entity được cập nhật
    }
    @OneToMany(() => Chart, (device) => device.device) // Sử dụng tên relation "timestamp" từ entity Device
    time:Chart

    @ManyToOne(() => UserDevice, (userDevice => userDevice.id))
    @JoinColumn({ name: 'userDeviceId' })
    userDevice:UserDevice

    @Column( {default: true})
    active: boolean

}


