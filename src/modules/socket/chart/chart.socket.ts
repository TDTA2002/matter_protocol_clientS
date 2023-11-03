import { OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { emit } from 'process';
import { async } from 'rxjs';
import { Server, Socket } from 'socket.io';
// import { Socket } from 'socket.io-client';
import { getCommand, Command } from 'src/enum';
import { Chart } from 'src/modules/chart/entities/chart.entity';
import { Device } from 'src/modules/devices/entities/device.entity';

import { Repository } from 'typeorm';

interface deviceType {
    decodedData: string;
    socket: Socket

}
@WebSocketGateway(3005, { cors: true })
export class ChartSocketGateway implements OnModuleInit {
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
                    const data2 = await this.getDeviceByUserId()
                    if (data2) {
                        socket.emit('receiveDevice', data2)
                    }
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
        });
    }
    async createUsageRecord(socket: Socket, deviceId: number, status: boolean): Promise<Chart | null> {
        console.log("deviceId", deviceId, status);

        const existingDevice = await this.Devices.findOne({ where: { node_id: deviceId } });


        if (existingDevice) {
            if (status == true) {

                // Nếu trạng thái là true, đánh dấu thiết bị đang hoạt động.
                existingDevice.isDeviceOn = true;
                existingDevice.startTime = new Date();
                await this.Devices.save(existingDevice);
                return null;
            } else {
                const currentTime = new Date();
                const elapsedTime = this.calculateElapsedTime(currentTime, existingDevice.startTime);
                existingDevice.isDeviceOn = false;
                await this.Devices.save(existingDevice);
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
            const device = await this.Devices.findOne({ where: { node_id: deviceId } });

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


    async chartById(id: any) {
        try {
            let listBinding = await this.chartRespositoty.find({
                where: {
                    device: id
                },
            });
            if (!listBinding) return false;
            return listBinding;
        } catch (err) {
            return false;
        }

    }
    async getDeviceByUserId() {
        try {
            let listDevice = await this.Devices.find({
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
