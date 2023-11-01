import { OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { getCommand, Command } from 'src/enum';
import { Chart } from 'src/modules/chart/entities/chart.entity';
import { Device } from 'src/modules/devices/entities/device.entity';

import { Repository } from 'typeorm';

interface deviceType {
    decodedData: string;
    socket: Socket

}

@WebSocketGateway(3005, { cors: true })
export class AddDeviceSocketGateway implements OnModuleInit {
    @WebSocketServer()
    server: Server;
    clients: deviceType[] = [];

    private devices: deviceType[] = [];

    constructor(
        @InjectRepository(Chart) private readonly chartRespositoty: Repository<Chart>,
        @InjectRepository(Device) private readonly Devices: Repository<Device>,
    ) { }

    onModuleInit() {
        this.server.on('connect', async (socket: Socket) => {

            // const WebSocket = require('ws');
            // const serverUrl = 'ws://21.240.175.42:5580/ws';
            // const socketIo = new WebSocket(serverUrl);
            // const param = getCommand(String(2), {
            //     code: "10987858975"
            // });
            // await socketIo.on('open', async () => {
            //     console.log('Đã kết nối tới cổng WebSocket', param);
            //     socketIo.send(JSON.stringify(param));
            // });
            // socketIo.addEventListener('message', async (event) => {
            //     const jsonData = JSON.parse(event.data.toString());
            //     console.log("jsonData", jsonData);

            //     if (jsonData.result && jsonData.result.node_id) {
            //         console.log("node_id:", jsonData.result.node_id);
            //         const node_id = jsonData.result.node_id;
            //         const name = "Tên thiết bị";
            //         const power = 0;
            //         await this.addDevice(node_id, name, power);
            //     }
            // });
            const devices = await this.getAllDevices();
            this.server.emit('receiveCart', devices);
            let device


            socket.on("addDevices", async (newItem: { code: string, name: string, power: number }) => {
                const WebSocket = require('ws');
                const serverUrl = 'ws://192.168.1.41:5580/ws';
                const socketIo = new WebSocket(serverUrl);
                const param = getCommand(String(2), {
                    code: newItem.code
                });
                await socketIo.on('open', async () => {
                    console.log('Đã kết nối tới cổng WebSocket', param);
                    socketIo.send(JSON.stringify(param));
                });
                socketIo.addEventListener('message', async (event) => {
                    const jsonData = JSON.parse(event.data.toString());
                    if (jsonData.result && jsonData.result.node_id) {
                        newItem.code = jsonData.result.node_id
                        device = await this.addDevices(newItem)
                        console.log("devicdw1123e", device);
                        this.server.emit('receiveCart', device);

                        if (device) {
                            for (let i in this.clients) {
                                this.clients[i].socket.emit('receiveCart', device);
                            }
                        }
                    }
                });
            })
        });

    }

    async addDevices(newItem: { code: string; name: string; power: number }) {
        try {


            console.log("newItem", newItem);
            let device = new Device()
            device.node_id = Number(newItem.code)
            device.name = newItem.name
            device.power = newItem.power
            let items = await this.Devices.save(device);
            let listDevice = await this.getAllDevices()
            return listDevice;
        } catch (err) {
            console.error("Lỗi khi thêm thiết bị:", err);
            return false;
        }
    }
    async getAllDevices(): Promise<Device[]> {
        return await this.Devices.find();
    }

}
