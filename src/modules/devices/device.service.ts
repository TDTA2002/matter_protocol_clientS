import { Injectable, Param } from '@nestjs/common';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Device } from './entities/device.entity';
import { ILike, Repository } from 'typeorm';
import { WebSocket } from 'ws'
import { Socket, io } from 'socket.io-client'
import { log } from 'console';

@Injectable()
export class DeviceService {

  private socket: Socket;
  constructor(@InjectRepository(Device) private readonly devices: Repository<Device>) { }

  async create(createDeviceDto: CreateDeviceDto) {
    try {
      console.log("vao r", createDeviceDto);
      let newDevice = await this.devices.save(createDeviceDto);
      if (!newDevice) {
        return [false, "create failure"]
      }
      return [true, "create success", newDevice]
    } catch (err) {
      // console.log('error device', err);
      return [false, "error device1", null]
    }
  }
  async findAll() {
    try {
      let newDevice = await this.devices.find();
      if (!newDevice) {
        return [false, "get failure"]
      }
      return [true, "get success", newDevice]
    } catch (err) {
      console.log('error device', err);
      return [false, "error device", null]
    }
  }
  findOne(id: number,) {
    return `This action returns a #${id} device`;
  }



  async realtime(node_id: any, status: any) {
    try {
      console.log('status', status);

      let devicesSource = await this.devices.findOne({
        where: {
          node_id: node_id
        }
      })
      // if (!devicesSource.pair) {
      //   return  {
      //     status: false,
      //     data: null,
      //     message: "Decvice unconnected"
      //   }
      // }
      let update = { ...devicesSource }
      update.isDeviceOn = status.status
      let userSourceUpdate = this.devices.merge(devicesSource, update);
      let result = await this.devices.save(userSourceUpdate);
      return {
        status: true,
        data: result,
        message: "Update success!"
      }
    } catch (err) {
      return {
        status: false,
        data: null,
        message: "Lỗi model"
      }
    }
  }
  async realtime1(node_id: any, status: any) {
    try {
      console.log('status', status);
let parsenode = parseInt(node_id)
      let devicesSource = await this.devices.findOne({
        where: {
          node_id: parsenode
        }
      })
      // if (!devicesSource.pair) {
      //   return  {
      //     status: false,
      //     data: null,
      //     message: "Decvice unconnected"
      //   }
      // }
      let update = { ...devicesSource }
      update.isDeviceOn = status.status
      let userSourceUpdate = this.devices.merge(devicesSource, update);
      let result = await this.devices.save(userSourceUpdate);
      return {
        status: true,
        data: result,
        message: "Update success!"
      }
    } catch (err) {
      return {
        status: false,
        data: null,
        message: "Lỗi model"
      }
    }
  }
  async update(id: string, updateDeviceDto: UpdateDeviceDto) {
    try {
      let devicesSource = await this.devices.findOne({
        where: {
          id: id
        }
      })

      let userSourceUpdate = this.devices.merge(devicesSource, updateDeviceDto);
      let result = await this.devices.save(userSourceUpdate);
      return {
        status: true,
        data: result,
        message: "Update success!"
      }
    } catch (err) {
      return {
        status: false,
        data: null,
        message: "Lỗi model"
      }
    }
  }
  async delete(id: string) {
    try {
      const deletedDevice = await this.devices.delete(id);
      if (!deletedDevice) {
        return [false, "delete failure"]
      }
      return [true, "delete success", deletedDevice]
    } catch (err) {
      return [false, "error device", null]
    }
  }
  async findbyname(name: string) {
    console.log("findbyname", name);

    try {
      let result = await this.devices.findOne({
        where: {
          name
        }
      });

      if (!result) {
        return {
          status: false,
          data: null,
          message: "name not found!"
        }
      }

      return {
        status: true,
        data: result,
        message: "Find name ok!"
      }
    } catch (err) {
      console.log("🚀 ~ file: device.service.ts:99 ~ DeviceService ~ findbyname ~ err:", err)
      return {
        status: false,
        data: null,
        message: "Lỗi model"
      }
    }
  }
  async pair(id: string, updateDeviceDto) {
    try {
      let devicesSource = await this.devices.findOne({
        where: {
          id: id
        }
      })

      let userSourceUpdate = this.devices.merge(devicesSource, updateDeviceDto);
      let result = await this.devices.save(userSourceUpdate);
      return {
        status: true,
        data: result,
        message: "pair success!"
      }
    } catch (err) {
      return {
        status: false,
        data: null,
        message: "Lỗi model"
      }
    }
  }
  async findbyId(id: string) {
    try {
      let result = await this.devices.findOne({
        where: {
          id
        }
      });

      if (!result) {
        return {
          status: false,
          data: null,
          message: "name not found!"
        }
      }

      return {
        status: true,
        data: result,
        message: "Find name ok!"
      }
    } catch (err) {
      console.log("🚀 ~ file: device.service.ts:99 ~ DeviceService ~ findbyname ~ err:", err)
      return {
        status: false,
        data: null,
        message: "Lỗi model"
      }
    }
  }
  async getData1() {
    return new Promise((resolve, reject) => {
      let data1;
      var socket = new WebSocket("ws://192.168.1.41:5580/ws");

      socket.onopen = function (event) {
        console.log("Kết nối WebSocket đã được thiết lập.");

        var message = {
          "message_id": "5",
          "command": "get_nodes"
        };

        socket.send(JSON.stringify(message));
      };

      const promise = new Promise((resolve, reject) => {
        socket.onmessage = function (event) {
          const data1 = event.data;
          // console.log("id", data1);

          setTimeout(() => {
            resolve(data1); // Hoặc reject(data1) trong trường hợp xảy ra lỗi
          }, 100);

          socket.close();
        };
      });

      promise.then((data) => {
        console.log("Dữ liệu đã được xử lý:", data);
      }).catch((error) => {
        console.error("Đã xảy ra lỗi:", error);
      });

      socket.onclose = function (event) {
        console.log("Kết nối WebSocket đã đóng.");
        if (!data1) {
          reject(new Error("Không nhận được dữ liệu."));
        }
      };

      socket.onerror = function (error) {
        console.error("Lỗi WebSocket: " + error);
        reject(error);
      };
    });
  }

  getData(message) {
    console.log("Đã vào getData");
    return new Promise((resolve, reject) => {
      console.log('vao get data1');

      const serverUrl = 'ws://192.168.1.41:5580/ws';
      const socket = new WebSocket(serverUrl);
      //open
      //   socket.onopen = function (event) {
      //     console.log("Kết nối WebSocket đã được thiết lập.");
      //     socket.send(JSON.stringify(message));
      // };
      //open

      socket.on('open', () => {
        console.log('Đã kết nối vào WebSocket gatewaydevice.');
        socket.send(JSON.stringify(message));
      });
      socket.on('message', (message) => {
        if (typeof message == 'object') {
          const decodedString = Buffer.from(message, 'hex').toString();
          let toParse = JSON.parse(decodedString);
          if (toParse?.message_id) {
            resolve(toParse);
          }
        }
        // const decodedString = Buffer.from(message, 'hex').toString();
        // resolve(decodedString);
        // try {
        //   jsonData = JSON.parse(message);

        //   console.log("🚀 ~ file: device.service.ts:168 ~ DeviceService ~ socket.on ~ jsonData:", decodedString)
        //   if (jsonData?.fabric_id) {
        //     // console.log('fabric_id');
        //   } else {

        //     resolve(jsonData);
        //   }
        //   // console.log('Nhận tin nhắn từ server:', jsonData);
        // } catch (error) {
        //   console.error('Lỗi khi giải mã JSON:', error);
        //   reject(error);
        // }
      });

      // Sự kiện khi có lỗi
      socket.on('error', (error) => {
        console.error('Lỗi kết nốisocketdevice:', error);
        reject(error);
      });

      // Sự kiện khi đóng kết nối
      socket.on('close', (code, reason) => {
        console.log('Kết nối đã đóngdevice:', code, reason);
      });

      socket.on('connect', () => {
        console.log('Connected to WebSocket serverdevice');
      });

      // socket.emit('message', 'Hello from WebSocket client');
    });
  }
  async search(nameDevice: string) {
    try {
      console.log('vào search');

      let devicesSource = await this.devices.find({
        where: {
          name: ILike(`%${nameDevice}%`)
        }
      })
      return {
        status: true,
        data: devicesSource,
        message: "search success!"
      }
    } catch (err) {
      return {
        status: false,
        data: null,
        message: "Lỗi model"
      }
    }
  }
}
