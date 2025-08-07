import { Test, TestingModule } from '@nestjs/testing';
import { BadgesController } from './badges.controller';
import { BadgesService } from './badges.service';
import { Badge } from 'src/entities/badge.entity';

describe('BadgesController', () => {
  let controller: BadgesController;

  const mockBadgeService = {
    getBadges: jest.fn(),
    getBadgeById: jest.fn((id) => {
      const badge = new Badge();
      badge.id = id;
      badge.name = `Badge ${id}`;
      badge.description = `Description for badge ${id}`,
      badge.condition = 10;
      return badge;
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BadgesController],
      providers: [BadgesService],
    }).overrideProvider(BadgesService).useValue(mockBadgeService).compile();

    controller = module.get<BadgesController>(BadgesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all badges', async () => {
    const badgesArray = [
      { id: 1, name: 'Badge One', description: 'Description One', condition: 10},
      { id: 2, name: 'Badge Two', description: 'Description Two', condition: 20}, 
    ];

    mockBadgeService.getBadges.mockResolvedValue(badgesArray);

    const result = await controller.getAllBadges();

    expect(result).toEqual(badgesArray);
    expect(mockBadgeService.getBadges).toHaveBeenCalledTimes(1);
  });

  it('should return badge by id', async () => {
    const requestedId = 2;
    const expectedBadge = {
      id: requestedId,
      name: `Badge ${requestedId}`,
      description: `Description for badge ${requestedId}`,
      condition: 10,
    };

    (mockBadgeService.getBadgeById as jest.Mock).mockImplementation((id: number | string) => {
      const numericId = Number(id);
      return Promise.resolve({
        id: numericId,
        name: `Badge ${numericId}`,
        description: `Description for badge ${numericId}`,
        condition: 10,
      });
    });

    const result = await controller.getBadgeById(requestedId.toString());

    expect(result).toEqual(expectedBadge);
    expect(mockBadgeService.getBadgeById).toHaveBeenCalledTimes(1);
  });
});
