export enum CommandType {
  Discover = 'discover',
  PairDevice = 'commission_with_code',
  ToggleDevice = 'device_command',
  StartListening = 'start_listening',
  GetNodes = 'get_nodes',
  OnOff = 'device_command',
  Unpair = 'remove_node',
  OpenCommissioningWindow = 'open_commissioning_window',
  CommissionOnNetwork = 'commission_on_network',
  GetNode = 'get_node',
}
export enum MessageId {
  Discover = '1',
  PairDevice = '2',
  ToggleDevice = '3',
  StartListening = '4',
  GetNodes = '5',
  OnOff = '6',
  Unpair = '7',
  OpenCommissioningWindow = '8',
  CommissionOnNetwork = '9',
  GetNode = '10',
}

export interface Command {
  message_id: MessageId;
  command: CommandType;
  args?: {
    [key: string]: any;
  };
}
export const getCommand = (mId :any , option?: any):any => {
    switch(mId){
        case MessageId.Discover: //1
            return {   
                 message_id: MessageId.Discover,
                command: CommandType.Discover,
            }
        case MessageId.PairDevice: //2
            return {
                message_id: MessageId.PairDevice,
                command: CommandType.PairDevice,
                args: option,
            }
        case MessageId.ToggleDevice: //3
            return {
                message_id: MessageId.ToggleDevice,
                command: CommandType.ToggleDevice,
                args: option,
            }
        case MessageId.StartListening: //4
            return {
                message_id: MessageId.StartListening,
                command: CommandType.StartListening,
            }
        case MessageId.GetNodes: //5
            return {
                message_id: MessageId.GetNodes,
                command: CommandType.GetNodes,
            }
        case MessageId.OnOff://6
            return {
                message_id: MessageId.OnOff,
                command: CommandType.OnOff,
                args: option,
            }
        case MessageId.Unpair://7
            return {
                message_id: MessageId.Unpair,
                command: CommandType.Unpair,
                args: option,
            }
        case MessageId.OpenCommissioningWindow://8
            return {
                message_id: MessageId.OpenCommissioningWindow,
                command: CommandType.OpenCommissioningWindow,
                args: option,
            }
        case MessageId.CommissionOnNetwork://9
            return {
                message_id: MessageId.CommissionOnNetwork,
                command: CommandType.CommissionOnNetwork,
                args: option,
            }
        case MessageId.GetNode://10
            return {
                message_id: MessageId.GetNode,
                command: CommandType.GetNode,
                args: option,
            }

    }
}