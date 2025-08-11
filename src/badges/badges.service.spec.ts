import { Test, TestingModule } from '@nestjs/testing';
import { BadgesService } from './badges.service';
import { DeepPartial, Repository } from 'typeorm';
import { Badge } from 'src/entities/badge.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const badge = {name: 'Test badge', description: 'Test description', condition: 10, id: 1};

describe('BadgesService', () => {
  let service: BadgesService;
  let repo: jest.Mocked<Repository<Badge>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BadgesService,
        {
          provide: getRepositoryToken(Badge),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            insert: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
          }
        }
      ],
    }).compile();

    service = module.get<BadgesService>(BadgesService);
    repo = module.get(getRepositoryToken(Badge));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repo).toBeDefined();
  });

  // get all badges
  it('should return all badges', async() => {
    const badges = [{name: 'Test badge', description: 'Test description', condition: 10, id: 1}];
    jest.spyOn(repo, 'find').mockResolvedValue(badges);

    await expect(service.getBadges()).resolves.toEqual(badges);
    expect(repo.find).toHaveBeenCalledTimes(1);
  });

  it('should return a badge by id', async() => {
    jest.spyOn(repo, 'findOne').mockResolvedValue(badge);

    await expect(service.getBadgeById('1')).resolves.toEqual(badge);
    expect(repo.findOne).toHaveBeenCalledTimes(1);
  });

  // create badge

  it('should create a badge', async() => {
    const mockBadge: DeepPartial<Badge> = {name: 'Test badge', description: 'Test description', condition: 10};
    jest.spyOn(repo, 'save').mockResolvedValue(mockBadge as Badge);

    await expect(service.createBadge(mockBadge as Badge)).resolves.toEqual(mockBadge);
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(repo.save).toHaveBeenCalledWith(mockBadge);
  });

  // update badge
  it('should update an existing badge', async() => {
    const updatedBadge = {name: 'Test badge updated', description: 'Test description updated', condition: 12, id: 1};

    const updateResult = { affected: 1 };

    jest.spyOn(repo, 'findOne').mockResolvedValue(badge);
    jest.spyOn(repo, 'update').mockResolvedValue(updateResult as any);

    await expect(service.updateBadge(updatedBadge, '1')).resolves.toEqual(updateResult);
    expect(repo.update).toHaveBeenCalledTimes(1);
  });

  // delete badge
  it('should delete a badge', async() => {
    const deleteResult = { affected: 1};

    jest.spyOn(repo, 'findOne').mockResolvedValueOnce(badge);
    jest.spyOn(repo, 'delete').mockResolvedValue(deleteResult as any);

    await expect(service.deleteBadge('1')).resolves.toEqual(deleteResult);
    expect(repo.delete).toHaveBeenCalledTimes(1);
  });

  // empty badges repo or db failure
  it('should return an empty array if no badges', async() => {
    jest.spyOn(repo, 'find').mockResolvedValue([]);

    await expect(service.getBadges()).resolves.toEqual([]);
    expect(repo.find).toHaveBeenCalledTimes(1);
  });

  it('should throw an error when db failure', async() => {
    jest.spyOn(repo, 'find').mockRejectedValue(new Error('DB Failure'));
    await expect(service.getBadges()).rejects.toThrow(new Error('DB Failure'));
  });

  // get badge by id when no badge with id is present
  it('should throw not found error when badge with id is not present', async() => {
    jest.spyOn(repo, 'findOne').mockResolvedValue(null);
    
    await expect(service.getBadgeById('-1')).rejects.toThrow(new NotFoundException('Badge not found'));
    expect(repo.findOne).toHaveBeenCalledTimes(1);
  });

  // should throw if body is not proper type for Badge
  it('should throw if body is not proper type for creation', async() => {
    const wrongBody: DeepPartial<Badge> = { name: 'Test', description: 'Test'};
    await expect(service.createBadge(wrongBody as Badge)).rejects.toThrow();
  });

  // update if id not present
  it('should throw if update id is not present', async() => {
    await expect(service.updateBadge(badge, '-1')).rejects.toThrow(new NotFoundException('Badge with id -1 not found'))
  });

  // update if body not correctly formatted
  it('should throw update if body is not properly formatted', async() => {
    const incorrectBadge: DeepPartial<Badge> = {
      name: 'as'
    };

    jest.spyOn(repo, 'findOne').mockResolvedValue(badge);
    await expect(service.updateBadge(incorrectBadge as Badge, '1')).rejects.toThrow(new BadRequestException('Missing required fields'));
  });

  // delete fail if id missing
  it('should fail delete if id is not present', async() => {
    await expect(service.deleteBadge('-1')).rejects.toThrow(new NotFoundException('Badge with id -1 not found'));
  });
});
