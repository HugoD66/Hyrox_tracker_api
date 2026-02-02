import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------------- REGISTER ----------------
  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      mockUsersService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockUsersService.create.mockResolvedValue({
        id: 'user-id',
        ...registerDto,
        password: 'hashed-password',
      });
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(registerDto);

      expect(result.success).toBe(true);
      expect(result.data.user.email).toBe(registerDto.email);
      expect(result.data.accessToken).toBe('jwt-token');
      expect(mockUsersService.create).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
    });

    it('should throw ConflictException if email already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      mockUsersService.findByEmail.mockResolvedValue({ id: 'user-id', email: registerDto.email });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should throw error if email is invalid', async () => {
      const registerDto: RegisterDto = {
        email: 'not-an-email',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      await expect(service.register(registerDto)).rejects.toThrow();
    });

    it('should throw error if password is too short', async () => {
      const registerDto: RegisterDto = {
        email: 'test2@example.com',
        password: '123',
        firstName: 'Test',
        lastName: 'User',
      };

      await expect(service.register(registerDto)).rejects.toThrow();
    });
  });

  // ---------------- LOGIN ----------------
  describe('login', () => {
    it('should login with valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-id',
        email: loginDto.email,
        password: 'hashed-password',
        firstName: 'Test',
        lastName: 'User',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(result.success).toBe(true);
      expect(result.data.user.email).toBe(loginDto.email);
      expect(result.data.accessToken).toBe('jwt-token');

      // ✅ matcher partiel pour éviter les erreurs si JWT a d'autres champs
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: mockUser.id }),
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto: LoginDto = {
        email: 'notfound@example.com',
        password: 'password123',
      };

      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      const mockUser = {
        id: 'user-id',
        email: loginDto.email,
        password: 'hashed-password',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw error if email is empty', async () => {
      const loginDto: LoginDto = {
        email: '',
        password: 'password123',
      };

      await expect(service.login(loginDto)).rejects.toThrow();
    });

    it('should throw error if password is empty', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: '',
      };

      await expect(service.login(loginDto)).rejects.toThrow();
    });
  });
});
