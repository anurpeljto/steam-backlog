import { Test, TestingModule } from '@nestjs/testing';
import { BadgesController } from './badges.controller';
import { BadgesService } from './badges.service';
import { Badge } from 'src/entities/badge.entity';
import { NotFoundException } from '@nestjs/common';

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
      return Promise.resolve(badge);
    }),
    createBadge: jest.fn((body: Badge) => Promise.resolve({...body, id: 1})),
    updateBadge: jest.fn().mockImplementation((badge: Badge, badge_id: string) => Promise.resolve({...badge, id: badge_id})),
    deleteBadge: jest.fn().mockImplementation((id: string) => {
      const badge = new Badge();
      badge.id = Number(id),
      badge.name = `Badge ${id}`;
      badge.description = `Description for badge ${id}`;
      badge.condition = 10;
      return Promise.resolve(badge);
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BadgesController],
      providers: [BadgesService],
    }).overrideProvider(BadgesService).useValue(mockBadgeService).compile();

    controller = module.get<BadgesController>(BadgesController);
    jest.clearAllMocks();
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

  it('should create a badge', async() => {
    const result = await controller.createBadge({
      name: 'Test Badge',
      description: 'Test description',
      condition: 10
    } as Badge);

    expect(result).toEqual({
      id: expect.any(Number),
      name: 'Test Badge',
      description: 'Test description',
      condition: 10
    });

    expect(mockBadgeService.createBadge).toHaveBeenCalledTimes(1);
    expect(mockBadgeService.createBadge).toHaveBeenCalledWith({
      name: 'Test Badge',
      description: 'Test description',
      condition: 10
    });
  });

  it('should update a badge', async() => {
    const mockBadge = new Badge();
    mockBadge.id = 1;
    mockBadge.name = "Badge One";
    mockBadge.description = "Badge Description";
    mockBadge.condition = 10;

    const newBadge = new Badge();
    newBadge.id = 1;
    newBadge.name = "Updated name";
    newBadge.description = "Updated description";
    newBadge.condition = 20;


    expect(await controller.updateBadge(newBadge, '1')).toEqual({
      ...newBadge,
      id: '1'
    });

    expect(mockBadgeService.updateBadge).toHaveBeenCalledTimes(1);
    expect(mockBadgeService.updateBadge).toHaveBeenCalledWith({
      id: 1,
      name: "Updated name",
      description: "Updated description",
      condition: 20
    }, '1');
  });

  it('should delete a badge', async() => {
    expect( await controller.deleteBadge('1')).toEqual({
      id: 1,
      name: 'Badge 1',
      description: 'Description for badge 1',
      condition: 10
    });

    expect(mockBadgeService.deleteBadge).toHaveBeenCalledTimes(1);
    expect(mockBadgeService.deleteBadge).toHaveBeenCalledWith('1');
  });

  // Test invalid inputs / errors

  // getBadges failures
  it('should return an empty error when no badges exist', async() => {
    mockBadgeService.getBadges.mockResolvedValue([]);
    const result = await controller.getAllBadges();
    expect(result).toEqual([]);
    expect(mockBadgeService.getBadges).toHaveBeenCalledTimes(1);
  });

  it('should throw an error when service throws', async() => {
    mockBadgeService.getBadges.mockRejectedValue(new Error('Database failure'));

    await expect(controller.getAllBadges()).rejects.toThrow('Database failure');
    expect(mockBadgeService.getBadges).toHaveBeenCalledTimes(1);
  });

  // getBadgeById failures
  it('should return not found exception when badge is not found', async() => {
    mockBadgeService.getBadgeById.mockRejectedValue(new NotFoundException('Badge not found'));
    
    await expect(controller.getBadgeById('1')).rejects.toThrow(new NotFoundException('Badge not found'));
    expect(mockBadgeService.getBadgeById).toHaveBeenCalledTimes(1);
  });

  // createBadge failures
  it('should fail due to invalid badge input', async() => {
    const invalidBadge = { name: '', description: 20, condition: -1};

    mockBadgeService.createBadge.mockRejectedValue(new Error('Invalid badge data'));

    await expect(controller.createBadge(invalidBadge as any)).rejects.toThrow('Invalid badge data');

    expect(mockBadgeService.createBadge).toHaveBeenCalledTimes(1);
    expect(mockBadgeService.createBadge).toHaveBeenCalledWith(invalidBadge);
  });

  it('should fail if db fails', async() => {
    mockBadgeService.createBadge.mockRejectedValue(new Error('Database error'));

    await expect(controller.createBadge({name: 'Test', description: 'Test', condition: 10})).rejects.toThrow('Database error');
    expect(mockBadgeService.createBadge).toHaveBeenCalledTimes(1);
  });

  // updateBadge
  
  it('should fail if id is not present in db', async() => {
    const mockBadge = new Badge();
    mockBadge.id = 1;
    mockBadge.name = "Test";
    mockBadge.description = "test desc";
    mockBadge.condition = 100;

    mockBadgeService.updateBadge.mockRejectedValue(new NotFoundException('Badge with id 1 not found'));

    await expect(controller.updateBadge(mockBadge, '1')).rejects.toThrow(new NotFoundException('Badge with id 1 not found'));
    expect(mockBadgeService.updateBadge).toHaveBeenCalledTimes(1);
  })

  it('should fail if db fails', async() => {
    mockBadgeService.updateBadge.mockRejectedValue(new Error('Database error'));

    await expect(controller.updateBadge({name: 'Test', description: 'Test', condition: 10}, '1')).rejects.toThrow('Database error');
    expect(mockBadgeService.updateBadge).toHaveBeenCalledTimes(1);
  });

  // delete badge

  it('should fail if badge id is not found', async() => {
    mockBadgeService.deleteBadge.mockRejectedValue(new NotFoundException('Badge with id 1 not found'));

    await expect(controller.deleteBadge('1')).rejects.toThrow(new NotFoundException('Badge with id 1 not found'));
    expect(mockBadgeService.deleteBadge).toHaveBeenCalledTimes(1);
  });
});
