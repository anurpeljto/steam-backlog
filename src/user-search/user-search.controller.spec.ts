import { Test, TestingModule } from '@nestjs/testing';
import { UserSearchController } from './user-search.controller';

describe('UserSearchController', () => {
  let controller: UserSearchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserSearchController],
    }).compile();

    controller = module.get<UserSearchController>(UserSearchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
