import { Test, TestingModule } from '@nestjs/testing';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';

describe('GoalsController', () => {
  let controller: GoalsController;

  const goalsServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    markAsAchieved: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoalsController],
      providers: [
        {
          provide: GoalsService,
          useValue: goalsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<GoalsController>(GoalsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate create with userId from current user', async () => {
    const dto = { title: 'Sub 1h20' };
    const response = { success: true, data: { id: 'g1' } };
    goalsServiceMock.create.mockResolvedValue(response);

    const result = await controller.create(dto, { userId: 'u1' });

    expect(goalsServiceMock.create).toHaveBeenCalledWith('u1', dto);
    expect(result).toEqual(response);
  });

  it('should delegate findAll with userId', async () => {
    const response = { success: true, data: [] };
    goalsServiceMock.findAll.mockResolvedValue(response);

    const result = await controller.findAll({ userId: 'u1' });

    expect(goalsServiceMock.findAll).toHaveBeenCalledWith('u1');
    expect(result).toEqual(response);
  });

  it('should delegate findOne with id and userId', async () => {
    const response = { success: true, data: { id: 'g1' } };
    goalsServiceMock.findOne.mockResolvedValue(response);

    const result = await controller.findOne('g1', { userId: 'u1' });

    expect(goalsServiceMock.findOne).toHaveBeenCalledWith('g1', 'u1');
    expect(result).toEqual(response);
  });

  it('should delegate update with id, userId and dto', async () => {
    const dto = { title: 'Updated title' };
    const response = { success: true, data: { id: 'g1' } };
    goalsServiceMock.update.mockResolvedValue(response);

    const result = await controller.update('g1', dto, { userId: 'u1' });

    expect(goalsServiceMock.update).toHaveBeenCalledWith('g1', 'u1', dto);
    expect(result).toEqual(response);
  });

  it('should delegate markAsAchieved with id and userId', async () => {
    const response = { success: true, data: { id: 'g1', achieved: true } };
    goalsServiceMock.markAsAchieved.mockResolvedValue(response);

    const result = await controller.markAsAchieved('g1', { userId: 'u1' });

    expect(goalsServiceMock.markAsAchieved).toHaveBeenCalledWith('g1', 'u1');
    expect(result).toEqual(response);
  });

  it('should delegate remove with id and userId', async () => {
    const response = { success: true, message: 'Goal deleted successfully' };
    goalsServiceMock.remove.mockResolvedValue(response);

    const result = await controller.remove('g1', { userId: 'u1' });

    expect(goalsServiceMock.remove).toHaveBeenCalledWith('g1', 'u1');
    expect(result).toEqual(response);
  });
});

