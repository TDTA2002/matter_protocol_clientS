import { Test, TestingModule } from '@nestjs/testing';
import { UserDeviveController } from './user_devive.controller';
import { UserDeviveService } from './user_devive.service';

describe('UserDeviveController', () => {
  let controller: UserDeviveController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserDeviveController],
      providers: [UserDeviveService],
    }).compile();

    controller = module.get<UserDeviveController>(UserDeviveController);
  });

  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
