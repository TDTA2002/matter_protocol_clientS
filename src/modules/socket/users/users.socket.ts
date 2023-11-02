import { OnModuleInit } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { JwtService } from 'src/modules/jwt/jwt.service';
import { UserDevice } from 'src/modules/user_devive/entities/user_devive.entity';
import { Device } from 'src/modules/devices/entities/device.entity';
import { Binding } from 'src/modules/binding/entities/binding.entity';
import { getCommand } from 'src/enum';
import { Chart } from 'src/modules/chart/entities/chart.entity';
import { Permisstion } from 'src/modules/permisstion/entities/permisstion.entity';
import { UserRole } from 'src/modules/users/user.enum';

interface BindingDeviceType {
    binding: Binding;
    bindingDevice: Device;
}
interface deviceType {
    user: User;
    socket: Socket;
}
@WebSocketGateway(3001, { cors: true })
export class UserSocketGateway implements OnModuleInit {
    @WebSocketServer()
    server: Server;
    clients: deviceType[] = [];
    bindingDevices: BindingDeviceType[] = [];

    constructor(
        private readonly jwt: JwtService,
        @InjectRepository(User) private readonly User: Repository<User>,
        @InjectRepository(Device) private readonly Device: Repository<Device>,
        @InjectRepository(Binding) private readonly Binding: Repository<Binding>,
        @InjectRepository(Chart)
        private readonly chartRespositoty: Repository<Chart>,
        @InjectRepository(UserDevice)
        private readonly UserDevive: Repository<UserDevice>,
        @InjectRepository(Permisstion)
        private readonly Permisstion: Repository<Permisstion>,
    ) { }

    onModuleInit() {
        this.server.on('connect', async (socket: Socket) => {
            console.log('Đã có người connect');
            /* Xóa người dùng khỏi clients nếu disconnect */
            socket.on('disconnect', () => {
                console.log('có 1 user đã out!');
                this.bindingDevices.splice(0, this.bindingDevices.length);
            });
            /* Xác thực người dùng */
            let token: string = String(socket.handshake.query.token);
            let user = this.jwt.verifyToken(token) as User;

            if (token == 'undefined' || !user) {
                socket.emit('connectStatus', {
                    message: 'Đăng nhập thất bại',
                    status: false,
                });
                socket.disconnect();
            } else {
                socket.emit('connectStatus', {
                    message: 'Đăng nhập thành công',
                    status: true,
                });
                let userss = await this.getuserDevice(user.id);
                if (userss) {
                    socket.emit('receiveUserData', userss);
                }
                let userDeviceId = await this.getUerDevice(user.id);
                if (userDeviceId) {
                    let userdevice = await this.getDeviceByUserId(userDeviceId);
                    if (userdevice) {
                        socket.emit('receiveDevice', userdevice);
                    }
                    let binding = await this.getBindingDeviceByUserId(userDeviceId);
                    console.log('binding', binding);
                    if (binding && binding.length > 0) {
                        for (let i = 0; i < binding.length; i++) {
                            let listId = binding[i].deviceId;
                            const parts = listId.split('+');
                            for (let j = 0; j <= parts.length - 1; j++) {
                                let tempDevice = await this.getDeviceById(parts[j]);
                                if (tempDevice) {
                                    this.bindingDevices.push({
                                        binding: binding[i],
                                        bindingDevice: tempDevice[0],
                                    });
                                }

                            }

                        }
                        socket.emit('receiveBinding', this.bindingDevices);

                    }
                }
                let device;
                socket.on(
                    'addDevices',
                    async (newItem: { code: string; name: string; power: number }) => {
                        const WebSocket = require('ws');
                        const serverUrl = 'ws://192.168.1.41:5580/ws';
                        const socketIo = new WebSocket(serverUrl);
                        const param = getCommand(String(2), {
                            code: newItem.code,
                        });
                        await socketIo.on('open', async () => {
                            console.log('Đã kết nối tới cổng WebSocket', param);
                            socketIo.send(JSON.stringify(param));
                        });
                        socketIo.addEventListener('message', async (event) => {
                            const jsonData = JSON.parse(event.data.toString());
                            console.log('event', jsonData);

                            if (jsonData.result && jsonData.result.node_id) {
                                newItem.code = jsonData.result.node_id;
                                console.log('newItem', newItem);

                                device = await this.addDevices(userDeviceId, newItem);
                                console.log('devicdw1123e', device);
                                // this.server.emit('receiveCart', device);
                                if (device) {
                                    socket.emit('receiveDevice', device);
                                }
                            }
                        });
                    },
                );
                socket.on('addBinding', async (data) => {
                    console.log('add Binding', data);
                    let bindingData = await this.addBinding(userDeviceId, data);
                    console.log('bindingData', bindingData);
                    if (bindingData) {
                        console.log('đã đủ dữ liệu để trả về!');
                        let listId = bindingData.deviceId;
                        const parts = listId.split('+');
                        console.log('parts', parts);

                        for (let i = 0; i < parts.length; i++) {
                            let tempDevice = await this.getDeviceById(parts[i]);
                            console.log('tempDevice', tempDevice);

                            if (tempDevice) {
                                this.bindingDevices.push({
                                    binding: bindingData,
                                    bindingDevice: tempDevice[0],
                                });
                            }
                        }
                        socket.emit('receiveBinding', this.bindingDevices);
                        console.log('test 2', this.bindingDevices);
                    }
                });
                let listuser = await this.listUser();
                if (listuser) {
                    socket.emit('listUser', listuser);
                }
                let list11user = await this.listAllUser();
                if (list11user) {
                    socket.emit('listU', list11user);
                }
                socket.on(
                    'addRole',
                    async (newRole: { email: string; role: UserRole }) => {
                        let bindingData = await this.updateRole(newRole);
                        let list11user = await this.listAllUser();
                        if (bindingData) {
                            socket.emit('listUser', bindingData);
                            socket.emit('listU', list11user);
                        }
                    },
                );

                socket.on('showPermis', async (newItem, userId, active) => {
                    const data = await this.addpermission(newItem, userId);
                    const data1 = await this.updatePermissionsActiveStatus(active);
                    socket.emit('showPermisList', data);
                });
                socket.on('EditBinding', async (data: any) => {
                    this.bindingDevices.splice(0, this.bindingDevices.length);
                    let bindingEdit = await this.editBinding(data);
                    if (bindingEdit) {
                        let listId = bindingEdit.deviceId;
                        const parts = listId.split('+');
                        let tempName = bindingEdit.name;
                        for (let i = 0; i < parts.length; i++) {
                            let tempDevice = await this.getDeviceById(parts[i]);
                            if (tempDevice) {
                                this.bindingDevices.push({
                                    binding: bindingEdit,
                                    bindingDevice: tempDevice[0],
                                });
                            }
                        }
                        socket.emit('receiveBinding', this.bindingDevices);
                    }
                });
                socket.on('removeBinding', async (id: string) => {
                    let resultRemove = await this.deleteBinding(id);
                    if (resultRemove == true) {
                        if (userDeviceId) {
                            let userdevice = await this.getDeviceByUserId(userDeviceId);
                            if (userdevice) {
                                socket.emit('receiveDevice', userdevice);
                            }
                            let binding = await this.getBindingDeviceByUserId(userDeviceId);
                            if (binding && binding.length > 0) {
                                for (let i = 0; i < binding.length; i++) {
                                    let listId = binding[i].deviceId;
                                    const parts = listId.split('+');
                                    for (let j = 0; j <= parts.length - 1; j++) {
                                        let tempDevice = await this.getDeviceById(parts[j]);
                                        if (tempDevice) {
                                            this.bindingDevices.push({
                                                binding: binding[i],
                                                bindingDevice: tempDevice[0],
                                            });
                                        }
                                    }
                                }
                                socket.emit('receiveBinding', this.bindingDevices);
                            } else {
                                this.bindingDevices = [];
                                socket.emit('receiveBinding', this.bindingDevices);
                            }
                        }
                    }
                });
                socket.on(
                    'toggle',
                    async (node_id) => {
                        console.log("node_id", node_id);
                        const WebSocket = require('ws');
                        const serverUrl = 'ws://192.168.1.41:5580/ws';
                        const socketIo = new WebSocket(serverUrl);
                        const param = getCommand(String(3), {
                            node_id: node_id,
                            endpoint_id: 1,
                            cluster_id: 6,
                            command_name: "Toggle",
                            payload: {}
                        });

                        await socketIo.on('open', async () => {
                            socketIo.send(JSON.stringify(param));
                        });



                    },
                );
                const WebSocket = require('ws');
                const serverUrl = 'ws://192.168.1.41:5580/ws';
                const socketIo = new WebSocket(serverUrl);
                const param = getCommand(String(4));

                await socketIo.on('open', async () => {
                    console.log('Connected to WebSocket gateway');
                    socketIo.send(JSON.stringify(param));
                });
                socketIo.addEventListener('message', async (event) => {
                    const jsonData = JSON.parse(event.data.toString());
                    if (Array.isArray(jsonData.data)) {
                        const status = jsonData.data.find((item) => typeof item === 'boolean');
                        const node_id = jsonData.data.find((item) => typeof item === 'number');

                        this.createUsageRecord(socket, node_id, status);

                        const chart = this.createUsageRecordEntry
                        if (chart) {
                            console.log("charwdwk1j19t", chart);
                            socket.emit('receiveChart', chart)
                        }
                        if (status !== undefined) {
                            console.log('Giá trị boolean từ jsonData.data:', status);
                        } else {
                            console.log('Không tìm thấy giá trị boolean trong jsonData.data');
                        }
                    } else {
                        console.log('jsonData.data không phải là một mảng.');
                    }
                });
            }
        });
    }

    async getUerDevice(id: string) {
        try {
            let oldUserDevice = await this.User.findOne({
                where: {
                    id,
                },
                relations: {
                    userDevice: true,
                },
            });
            let UserDeviceId = oldUserDevice?.userDevice[0]?.userId;
            if (!UserDeviceId) {
                // kiểm tra nếu đã có userDevice thì trả về, nếu chưa có thì tạo mới

                const newDevice = this.UserDevive.create({
                    userId: id,
                    email: oldUserDevice.email,
                });
                let newUserDevice = await this.UserDevive.save(newDevice);
                if (!newUserDevice) return false;
                return newUserDevice;
            }
            return oldUserDevice.userDevice[0];
        } catch (err) {
            return false;
        }
    }
    async getuserDevice(id: string) {
        try {
            let oldUserDevice = await this.User.findOne({
                where: {
                    id,
                },
                relations: {
                    userDevice: true,
                },
            });
            return oldUserDevice;
        } catch (err) {
            return false;
        }
    }
    async addDevices(
        userDeviceId: any,
        newItem: { code: string; name: string; power: number },
    ) {
        try {
            if (userDeviceId.role == 'ADMIN') {
                let device = new Device();
                device.node_id = Number(newItem.code);
                device.name = newItem.name;
                device.power = newItem.power;
                device.userDevice = userDeviceId;
                await this.Device.save(device);
            }

            let data = await this.getDeviceByUserId(userDeviceId);
            return data;
        } catch (err) {
            console.error('Lỗi khi thêm thiết bị:', err);

            return false;
        }
    }

    async getDeviceByUserId(userDeviceId: any) {
        try {
            let listDevice = await this.Device.find({
                where: {
                    userDevice: userDeviceId,
                    active: true,
                },
            });
            if (!listDevice) return false;

            return listDevice;
        } catch (err) {
            return false;
        }
    }

    async getDeviceById(deviceId: any) {
        try {
            let listDevice = await this.Device.find({
                where: {
                    id: deviceId,
                },
            });
            if (!listDevice) return false;
            return listDevice;
        } catch (err) {
            return false;
        }
    }
    async getBindingDeviceByUserId(userDeviceId: any) {
        try {
            let listBinding = await this.Binding.find({
                where: {
                    UserDevice: userDeviceId,
                },
            });
            if (!listBinding) return false;
            return listBinding;
        } catch (err) {
            return false;
        }
    }
    async addBinding(
        userDeviceId: any,
        data: {
            name: string;
            data: string;
        },
    ) {
        try {
            let newBinding = new Binding();
            newBinding.name = data.name;
            newBinding.UserDevice = userDeviceId;
            newBinding.deviceId = data.data;
            let bindingItem = await this.Binding.save(newBinding);
            if (!bindingItem) return false;
            return bindingItem;
        } catch (err) {
            return false;
        }
    }
    async chartById(id: any) {
        try {
            let listBinding = await this.chartRespositoty.find({
                where: {
                    device: id,
                },
            });
            if (!listBinding) return false;
            return listBinding;
        } catch (err) {
            return false;
        }
    }
    async addpermission(newItems: any[], userId: string): Promise<boolean> {
        try {
            const existingPermissions = await this.Permisstion.find({
                where: {
                    userId: userId,
                },
            });

            for (const existingPermission of existingPermissions) {
                await this.Permisstion.remove(existingPermission);
            }

            if (newItems && newItems.length > 0) {
                console.log('newItems', newItems);
                console.log('Số lượng mục mới', newItems.length);
                for (const newItem of newItems) {
                    const newPermission = new Permisstion();
                    newPermission.userId = userId;
                    newPermission.node_id = newItem.node_id;
                    newPermission.name = newItem.name;
                    console.log('newPermission', newPermission);
                    await this.Permisstion.save(newPermission);
                }
            }

            return true;
        } catch (error) {
            console.error('Lỗi', error);
            return false;
        }
    }

    async updatePermissionsActiveStatus(activeStatus: {
        [node_id: string]: boolean;
    }): Promise<boolean> {
        try {
            const nodeIds = Object.keys(activeStatus);
            for (const nodeIdString of nodeIds) {
                const nodeIdNumber = parseInt(nodeIdString, 10);
                const permission = await this.Permisstion.findOne({
                    where: {
                        node_id: nodeIdNumber,
                    },
                });
                if (permission) {
                    permission.active = activeStatus[nodeIdString];
                    await this.Permisstion.save(permission);
                }
            }
            return true;
        } catch (error) {
            console.error('Lỗi', error);
            return false;
        }
    }
    async updateRole(newRole: { email: string; role: UserRole }) {
        try {
            let user = await this.UserDevive.findOne({
                where: { email: newRole.email },
            });
            if (user) {
                user.role = newRole.role;
                await this.UserDevive.save(user);
                let users = await this.listUser();
                return users;
            }
        } catch (err) {
            console.log('err', err);
            return false;
        }
    }

    async listUser() {
        try {
            const users = await this.UserDevive.find({
                where: { role: UserRole.MEMBER },
            });
            return users;
        } catch (err) {
            console.error('Lỗi khi lấy danh sách người dùng', err);
            throw err;
        }

    }

    async listAllUser() {
        try {
            const users = await this.UserDevive.find({
                where: { role: UserRole.OWNER },
            });
            return users;
        } catch (err) {
            console.error('Lỗi khi lấy danh sách người dùng', err);
            throw err;

        }
    }
    async ListPerById(UserDevice: any) {
        try {
            const device = await this.Permisstion.find({
                where: {
                    userId: UserDevice,
                },
            });
            return device;
        } catch (err) {
            console.log('err', err);
            return false;
        }
    }
    async editBinding(data: any) {
        try {
            let binding = await this.Binding.findOne({
                where: {
                    id: data.id,
                },
            });
            if (!binding) return false;
            if (data.name) {
                binding.name = data.name;
            }
            if (data.deviceIds && data.deviceIds.length > 0) {
                binding.deviceId = binding.deviceId + '+' + data.deviceIds;
            }
            let result = await this.Binding.save(binding);
            return result;
        } catch (error) {
            return false;
        }
    }
    async deleteBinding(bindingId: any) {
        try {
            const binding = await this.Binding.findOne({
                where: {
                    id: bindingId,
                },
            });
            if (!binding) {
                return false;
            }
            const deleteResult = await this.Binding.remove(binding);
            if (deleteResult) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return false;
        }
    }
    async createUsageRecord(socket: Socket, deviceId: number, status: boolean): Promise<Chart | null> {
        console.log("deviceId", deviceId, status);

        const existingDevice = await this.Device.findOne({ where: { node_id: deviceId } });


        if (existingDevice) {
            if (status == true) {

                // Nếu trạng thái là true, đánh dấu thiết bị đang hoạt động.
                existingDevice.isDeviceOn = true;
                existingDevice.startTime = new Date();
                await this.Device.save(existingDevice);
                const data2 = await this.getDeviceByUser()
                if (data2) {
                    socket.emit('receiveDevice', data2)
                }
                return null;
            } else {
                const currentTime = new Date();
                const elapsedTime = this.calculateElapsedTime(currentTime, existingDevice.startTime);
                existingDevice.isDeviceOn = false;
                await this.Device.save(existingDevice);
                const data2 = await this.getDeviceByUser()
                if (data2) {
                    socket.emit('receiveDevice', data2)
                }
                return this.createUsageRecordEntry(socket, deviceId, elapsedTime);
            }
        } else {
            // Nếu không có bản ghi cho thiết bị này, tạo một bản ghi mới.
            return this.createUsageRecordEntry(socket, deviceId, 0);
        }

    }

    private calculateElapsedTime(currentTime: Date, startTime: Date): number {
        return (currentTime.getTime() - startTime.getTime()) / 1000;
    }

    private async createUsageRecordEntry(socket: Socket, deviceId: number, elapsedTime: number): Promise<Chart> {
        const record = new Chart();
        record.timestamp = elapsedTime;
        record.Date = new Date();

        try {
            const device = await this.Device.findOne({ where: { node_id: deviceId } });

            if (device) {
                record.device = device;
                await this.chartRespositoty.save(record);

                const data = await this.chartById(deviceId);
                if (data && data.length > 0) {
                    console.log("Dữ liệu", data);
                    socket.emit('showChartList', data);
                    return data[0];
                } else {
                    throw new Error("Không thể tìm thấy dữ liệu hoặc dữ liệu không hợp lệ");
                }
            } else {
                console.error("Thiết bị không tồn tại");

            }
        } catch (error) {
            console.error("Lỗi khi tạo bản ghi sử dụng:", error);
            throw error;
        }
    }
    async getDeviceByUser() {
        try {
            let listDevice = await this.Device.find({
                where: {
                    active: true,
                },
            });
            if (!listDevice) return false;
            console.log('listDevice', listDevice);

            return listDevice;
        } catch (err) {
            return false;
        }
    }

}
