import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const usersServiceMock = {
    findById: jest.fn(),
    searchPublicUsers: jest.fn(),
    getPublicProfileWithStats: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCurrentUser', () => {
    it('should return wrapped current user profile', async () => {
      const userPayload = { id: 'u1', email: 'test@example.com' };
      usersServiceMock.findById.mockResolvedValue(userPayload);

      const result = await controller.getCurrentUser({ userId: 'u1' });

      expect(usersServiceMock.findById).toHaveBeenCalledWith('u1');
      expect(result).toEqual({ success: true, data: userPayload });
    });
  });

  describe('search', () => {
    it('should delegate to searchPublicUsers with query and current user id', async () => {
      const response = { success: true, data: [{ id: 'u2' }] };
      usersServiceMock.searchPublicUsers.mockResolvedValue(response);

      const result = await controller.search('hugo', { userId: 'u1' });

      expect(usersServiceMock.searchPublicUsers).toHaveBeenCalledWith('hugo', 'u1');
      expect(result).toEqual(response);
    });
  });

  describe('getPublicProfile', () => {
    it('should delegate to getPublicProfileWithStats', async () => {
      const response = { success: true, data: { user: { id: 'u2' } } };
      usersServiceMock.getPublicProfileWithStats.mockResolvedValue(response);

      const result = await controller.getPublicProfile('u2');

      expect(usersServiceMock.getPublicProfileWithStats).toHaveBeenCalledWith('u2');
      expect(result).toEqual(response);
    });
  });

  describe('findOne', () => {
    it('should delegate to findById', async () => {
      const user = { id: 'u2' };
      usersServiceMock.findById.mockResolvedValue(user);

      const result = await controller.findOne('u2');

      expect(usersServiceMock.findById).toHaveBeenCalledWith('u2');
      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    it('should throw Unauthorized error when route id and current user id mismatch', async () => {
      await expect(controller.update('u1', { firstName: 'Neo' }, { id: 'u2' })).rejects.toThrow(
        'Unauthorized',
      );
      expect(usersServiceMock.update).not.toHaveBeenCalled();
    });

    it('should delegate to update when user updates own profile', async () => {
      const response = { success: true, data: { id: 'u1' } };
      usersServiceMock.update.mockResolvedValue(response);

      const result = await controller.update('u1', { firstName: 'Neo' }, { id: 'u1' });

      expect(usersServiceMock.update).toHaveBeenCalledWith('u1', { firstName: 'Neo' });
      expect(result).toEqual(response);
    });
  });

  describe('remove', () => {
    it('should throw Unauthorized error when route id and current user id mismatch', async () => {
      await expect(controller.remove('u1', { userId: 'u2' })).rejects.toThrow('Unauthorized');
      expect(usersServiceMock.remove).not.toHaveBeenCalled();
    });

    it('should delegate to remove when user deletes own account', async () => {
      const response = { success: true, message: 'User deleted successfully' };
      usersServiceMock.remove.mockResolvedValue(response);

      const result = await controller.remove('u1', { userId: 'u1' });

      expect(usersServiceMock.remove).toHaveBeenCalledWith('u1');
      expect(result).toEqual(response);
    });
  });
});
