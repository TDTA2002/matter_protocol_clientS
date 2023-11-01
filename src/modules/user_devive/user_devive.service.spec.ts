import { Test, TestingModule } from '@nestjs/testing';
import { UserDeviveService } from './user_devive.service';

describe('UserDeviveService', () => {
  let service: UserDeviveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserDeviveService],
    }).compile();

    service = module.get<UserDeviveService>(UserDeviveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
