import { Binding } from "src/modules/binding/entities/binding.entity";
import { Device } from "src/modules/devices/entities/device.entity";
import { Permisstion } from "src/modules/permisstion/entities/permisstion.entity";
import { User } from "src/modules/users/entities/user.entity";
import { UserRole } from "src/modules/users/user.enum";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("user_device")
export class UserDevice {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column()
    userId: string;

    @Column({ unique: true, length: 150 })
    email: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.OWNER })
    role: UserRole;

    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn({ name: 'userId' })
    user: User

    @OneToMany(() => Device, (device => device.id))
    devices: Device[]

    @OneToMany(() => Binding, (binding => binding.id))
    bindings: Binding[]

    @OneToMany(() => Permisstion, (permiss) => permiss.user)
    permiss: Permisstion[]
}
