import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query } from '@nestjs/common';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Response } from 'express';

interface Data1 {
  message_id: string
  result: Result[]
}
interface Data2 {
  error_code?: number
}
interface Result {
  node_id?: number;
}
@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) { }
  @Post('create/:idDvice')//id qr
  async create(@Body() createDeviceDto: CreateDeviceDto, @Param('idDvice') idDvice: string, @Res() res: Response) {

    try {
      //   let data1 = await this.deviceService.getData({
      //     "message_id": "2",
      //     "command": "commission_with_code",
      //     "args": {
      //         "code": "35704412064"
      //     }
      // })    
      //   console.log("data========",data1);
      //   return

      let name = await this.deviceService.findbyname(createDeviceDto.name)
      console.log('name', name);
      if (name.status) {
        console.log('name', name);
        return res.status(name.status ? 200 : 213).json({
          message: 'same name',
          data: null
        })
      } else {

        let data2 = await this.deviceService.getData(
          { 
            "message_id": "2",
            "command": "commission_with_code",
            "args": {
              "code": `${idDvice}`
            }
          }
        ) as Data2 | null;
        // let data2 = {} as Data2 | null //test
        // console.log("data2", data2);

        if (data2.error_code == 0 || data2.error_code) {
          console.log("vao loi");
          return res.status(213).json({
            message: 'you entered incorrectly or connected',
            data: null
          })
        } else {
          const currentDate = new Date();
          const dayOfMonth = currentDate.getDate();
          const month = currentDate.getMonth() + 1;
          const year = currentDate.getFullYear();
          const hours = currentDate.getHours();
          const minutes = currentDate.getMinutes();
          const seconds = currentDate.getSeconds();

          const time = `${dayOfMonth}/${month}/${year}/${hours}:${minutes}:${seconds}`
          // let data1 =
          //   {
          //     message_id: '43',
          //     result: [{ node_id: 125 }]
          //   } as Data1 | null
          let data1 = await this.deviceService.getData({
            "message_id": "5",
            "command": "get_nodes"
          }) as Data1 | null;
          console.log('vao khong loi data1', data1);
          console.log("dataaaaaaaaa", data1?.result[0].node_id);
          if (data1.result.length > 0) {
            // createDeviceDto.timeCreate = time
            createDeviceDto.node_id = data1.result[0].node_id;
            let [status, message, data] = await this.deviceService.create(createDeviceDto);
            return res.status(status ? 200 : 213).json({
              message,
              data
            })
          } else {
            return res.status(409).json({
              message: 'no nodeId',
              data: null
            })
          }
        }
      }
    } catch (err) {
      console.log("🚀 ~ file: device.controller.ts:52 ~ DeviceController ~ create ~ err:", err);
      return res.status(500).json({
        message: "Controller error11111!"
      })
    }
  }
  // @Post('toggle')
  // async creates() {
  //   try {

  //     let data1 = await this.deviceService.getData(
  //       {
  //         "message_id": "6",
  //         "command": "device_command",
  //         "args": {
  //             "node_id": 12,
  //             "endpoint_id": 1,
  //             "cluster_id": 6, //OnOff
  //             "command_name": "Off",// On,Off or Toggle
  //             "payload": {}
  //         }
  //     }
  //     ) as Data1;
  //     if (data1) {

  //     }
  //   } catch (err) {

  //   }
  // }
  @Get()
  //get all device
  async findAll(@Res() res: Response, @Query('q') q: string) {
    try {
      if (q != '') {
        let data = await this.deviceService.search(q)
        return res.status(data.status ? 200 : 213).json({
          message: data.message,
          data: data.data
        })
      } else {
        let [status, message, data] = await this.deviceService.findAll();
        return res.status(status ? 200 : 213).json({
          message,
          data
        })
      }

    } catch (err) {
      return res.status(500).json({
        message: "Controller error!"
      })
    }
  }
  @Post('toggledevive/:id')// id device 
  //turn on/off 
  async findId(@Param('id') id: string, @Res() res: Response) {
    try {
      let data1 = await this.deviceService.findbyId(id);
      console.log('data1', data1);
      if (data1.status) {
        let socketDataOnOff = await this.deviceService.getData({
          "message_id": "3",
          "command": "device_command",
          "args": {
            "node_id": data1.data.node_id,
            "endpoint_id": 1,
            "cluster_id": 6, //OnOff
            "command_name": "Toggle",// On,Off or Toggle
            "payload": {}
          }
        })

        console.log('idsssssssssss', data1.data.node_id);
        return res.status(data1.status ? 200 : 213).json({
          message: 'tun on/off',
          data: data1.data
        })
      } else {
        return res.status(213).json({
          message: 'tun on/off err',
          data: null
        })
      }
    } catch (err) {
      return res.status(500).json({
        message: "Controller error!"
      })
    }
  }
  @Post('realtimes/:id')
  async realtime(@Param('id') id: any, @Body() status: boolean, @Res() res: Response) {
    try {
      let realTime = await this.deviceService.realtime(id, status)
      return res.status(status ? 200 : 213).json({
        message: realTime.message,
        data: realTime.data
      })
    } catch (error) {

    }
  }

  @Post('pair')
  async pairDevice() {


  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
    return this.deviceService.update(id, updateDeviceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deviceService.delete(id);
  }
}
