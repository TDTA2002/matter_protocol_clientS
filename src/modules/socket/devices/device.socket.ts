import { OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { getCommand, Command } from 'src/enum';
import { Device } from 'src/modules/devices/entities/device.entity';
import { Repository } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Chart } from 'src/modules/chart/entities/chart.entity';
import { JwtService } from 'src/modules/jwt/jwt.service';
import { UserDevice } from 'src/modules/user_devive/entities/user_devive.entity';
import { Binding } from 'src/modules/binding/entities/binding.entity';

interface deviceType {
  decodedData: string;
  socket: Socket
}
 interface BindingDeviceType {
  binding: Binding;
  bindingDevice: Device;
}
@WebSocketGateway(3001, { cors: true })
export class DeviceSocket implements OnModuleInit {
  @WebSocketServer()
  server: Server;
    bindingDevices: BindingDeviceType[] = [];

  private devices: deviceType[] = [];

  constructor(
        private readonly jwt: JwtService,
    @InjectRepository(Device) private readonly Devices: Repository<Device>,
    @InjectRepository(User) private readonly User: Repository<User>,
    @InjectRepository(Chart) private readonly chartRespositoty: Repository<Chart>,
        @InjectRepository(UserDevice)
    private readonly UserDevive: Repository<UserDevice>,
       @InjectRepository(Binding) private readonly Binding: Repository<Binding>,
  ) { }

  onModuleInit() {
    
    this.server.on('connect', async (socket: Socket) => {
       let token: string = String(socket.handshake.query.token);
              let user = this.jwt.verifyToken(token) as User;
      if (token == 'undefined' || !user) {
        socket.emit('connectStatus', {
          message: 'Đăng nhập thất bại',
          status: false,
        });
        socket.disconnect();
      } else {
        socket.on(
        'requireDecoe',
        (data: { message: number; node_id: number; }) => {
          //  socket.emit('decode', "1213");
          // data dau vao cua connect
          this.socketModule(socket, data.message, data.node_id);
        },
      );
      socket.on('unpairDevice', async (data: { message: number, id: string, node_id: number, active: boolean }) => {
        this.socketModule(socket, data.message, data.node_id)
         await this.unpair(socket, data.id, data.active)
        let userDeviceId = await this.getUerDevice(user.id);
        console.log("userDeviceId",userDeviceId);
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
          }else{
             socket.emit('receiveBinding', this.bindingDevices);
          }
        }
      })
      socket.on('showChart', async (id: string) => {
        const data = await this.chartById(id)
        console.log("data", data);
        socket.emit("showChartList", data)
      })
          
      }

    });
  }
    async getDeviceById(deviceId: any) {
    try {
      let listDevice = await this.Devices.find({
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
      if (!UserDeviceId) return null
      return oldUserDevice.userDevice[0];
    } catch (err) {
      console.log('err', err);
      return false;
    }
  }
    async getDeviceByUserId(userDeviceId: any) {
    try {
      let listDevice = await this.Devices.find({
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
  async socketModule(socket: Socket, message: number, node_id: number) {
    const WebSocket = require('ws');
    const serverUrl = 'ws://192.168.1.41:5580/ws';
    const socketIo = new WebSocket(serverUrl);

    const param = getCommand(String(message), {
      node_id: node_id,
    });

    console.log('param', param);

    await socketIo.on('open', async () => {
      console.log('Connected to WebSocket gateway');
      socketIo.send(JSON.stringify(param));
    });
    let jsonData;

    socketIo.on('message', (message) => {
      const bufferdata = Buffer.from(message);
      try {
        jsonData = JSON.parse(bufferdata.toString());
        console.log("jsonData", jsonData);
        if (jsonData?.message_id) {
          if (jsonData?.result && jsonData?.message_id == 8) {
            const decodedData = Buffer.from(
              jsonData?.result[1],
              'base64',
            ).toString('utf-8');
            console.log("decode", decodedData);

            socket.emit('decode', decodedData);
            this.devices.push({
              decodedData,
              socket
            });

          } else if (jsonData?.message_id == 7 && jsonData?.result == null && jsonData.error_code != 5) {
            // this.unpair(socket,"ầnuiawbnf",false)
            socket.emit('unpairScuces', "Đã ngắt kết nối với thiết bị!")
            
            return
          } else {
            console.log('Lỗi', jsonData);
            if (jsonData.error_code == 5) {
              socket.emit('unpairFailed', "Không tìm thấy thấy thiết bị cần ngắt kết nối.");
            } else if (jsonData.error_code == 7) {
              socket.emit('decodeFailed', "Đã có lỗi trong quá trình tìm kiếm mã kết nối, vui lòng thử lại sau!");
            } else if (jsonData.error_code == 0) {
              socket.emit('decodeFailed', "Mã kết nối không hợp lệ, vui lòng thử lại sau!.");
            }
          }
        }
      } catch (error) {
        console.error('Lỗi khi giải mã JSON:', error);
        socket.emit('socketFailed', "Lỗi hệ thống, vui lòng thử lại sau!");
      }
    });

    socketIo.on('error', (error) => {
      console.error('Lỗi kết nối:', error);
    });

    socketIo.on('close', (code, reason) => {
      console.log('Kết nối đã đóng:', code, reason);
    });
  }

  async unpair(socket: Socket, id: string | null, active: boolean) {
    try {
      if (id == null) return false;
      let devieDelete = await this.Devices.update({ id }, { active: false });
      return
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

}
