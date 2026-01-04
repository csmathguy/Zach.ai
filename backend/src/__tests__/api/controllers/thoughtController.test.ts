import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { ThoughtController } from '@/api/controllers/thoughtController';
import { IThoughtRepository } from '@domain/repositories/IThoughtRepository';
import { Thought } from '@domain/models/Thought';
import { ValidationError, DatabaseError } from '@/errors';

/**
 * Test suite for ThoughtController
 *
 * Tests controller layer responsibilities:
 * - Accept validated request data
 * - Call repository with correct parameters
 * - Format responses per API contract (201 Created)
 * - Forward errors to error middleware
 *
 * Uses mocked repository for unit testing.
 */
describe('ThoughtController', () => {
  let controller: ThoughtController;
  let mockRepository: jest.Mocked<IThoughtRepository>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  const createMockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res) as unknown as Response['status'];
    res.json = jest.fn().mockReturnValue(res) as unknown as Response['json'];
    return res;
  };

  beforeEach(() => {
    // Create mock repository
    mockRepository = {
      create: jest.fn<IThoughtRepository['create']>(),
      findById: jest.fn<IThoughtRepository['findById']>(),
      findByUser: jest.fn<IThoughtRepository['findByUser']>(),
      findAll: jest.fn<IThoughtRepository['findAll']>(),
    };

    // Create controller with mocked repository
    controller = new ThoughtController(mockRepository);

    // Setup Express mocks
    mockRequest = {
      body: {},
    };

    mockResponse = createMockResponse();

    mockNext = jest.fn() as unknown as NextFunction;
  });

  describe('create()', () => {
    it('should create thought and return 201 with thought JSON', async () => {
      // Arrange
      const input = {
        text: 'Test thought',
        source: 'text' as const,
      };

      const mockThought = new Thought(
        '123e4567-e89b-12d3-a456-426614174000',
        'Test thought',
        '00000000-0000-4000-8000-000000000001', // MVP_USER_ID
        new Date('2026-01-03T10:00:00.000Z'),
        'text',
        'UNPROCESSED'
      );

      mockRequest.body = input;
      mockRepository.create.mockResolvedValue(mockThought);

      // Act
      await controller.create(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert - repository called with correct DTO
      expect(mockRepository.create).toHaveBeenCalledWith({
        text: 'Test thought',
        source: 'text',
        userId: '00000000-0000-4000-8000-000000000001',
      });

      // Assert - response 201 with thought JSON
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        id: '123e4567-e89b-12d3-a456-426614174000',
        text: 'Test thought',
        source: 'text',
        timestamp: new Date('2026-01-03T10:00:00.000Z'),
        processedState: 'UNPROCESSED',
      });

      // Assert - error handler not called
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should forward ValidationError to error middleware', async () => {
      // Arrange
      const input = {
        text: 'Test thought',
        source: 'text' as const,
      };

      const validationError = new ValidationError('User not found');
      mockRequest.body = input;
      mockRepository.create.mockRejectedValue(validationError);

      // Act
      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert - error forwarded to middleware
      expect(mockNext).toHaveBeenCalledWith(validationError);

      // Assert - response methods not called
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should forward DatabaseError to error middleware', async () => {
      // Arrange
      const input = {
        text: 'Test thought',
        source: 'text' as const,
      };

      const databaseError = new DatabaseError('Database connection failed');
      mockRequest.body = input;
      mockRepository.create.mockRejectedValue(databaseError);

      // Act
      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert - error forwarded to middleware
      expect(mockNext).toHaveBeenCalledWith(databaseError);

      // Assert - response methods not called
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should forward unknown errors to error middleware', async () => {
      // Arrange
      const input = {
        text: 'Test thought',
        source: 'text' as const,
      };

      const unknownError = new Error('Unexpected error');
      mockRequest.body = input;
      mockRepository.create.mockRejectedValue(unknownError);

      // Act
      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert - error forwarded to middleware
      expect(mockNext).toHaveBeenCalledWith(unknownError);

      // Assert - response methods not called
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should use hardcoded MVP_USER_ID for userId', async () => {
      // Arrange
      const input = {
        text: 'Test thought',
        source: 'text' as const,
      };

      const mockThought = new Thought(
        '123e4567-e89b-12d3-a456-426614174001', // Valid UUID
        'Test thought',
        '00000000-0000-4000-8000-000000000001',
        new Date(),
        'text',
        'UNPROCESSED'
      );

      mockRequest.body = input;
      mockRepository.create.mockResolvedValue(mockThought);

      // Act
      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert - repository called with hardcoded MVP_USER_ID
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: '00000000-0000-4000-8000-000000000001',
        })
      );
    });

    it('should return all required fields in response JSON', async () => {
      // Arrange
      const input = {
        text: 'Test thought',
        source: 'voice' as const,
      };

      const timestamp = new Date('2026-01-03T15:30:00.000Z');
      const mockThought = new Thought(
        '123e4567-e89b-12d3-a456-426614174002', // Valid UUID
        'Test thought',
        '00000000-0000-4000-8000-000000000001',
        timestamp,
        'voice',
        'UNPROCESSED'
      );

      mockRequest.body = input;
      mockRepository.create.mockResolvedValue(mockThought);

      // Act
      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert - response includes all required fields
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          text: expect.any(String),
          source: expect.any(String),
          timestamp: expect.any(Date),
          processedState: expect.any(String),
        })
      );

      // Assert - specific field values
      const responseData = (mockResponse.json as jest.MockedFunction<Response['json']>).mock
        .calls[0][0] as {
        id: string;
        text: string;
        source: string;
        timestamp: Date;
        processedState: string;
      };
      expect(responseData.id).toBe('123e4567-e89b-12d3-a456-426614174002');
      expect(responseData.text).toBe('Test thought');
      expect(responseData.source).toBe('voice');
      expect(responseData.timestamp).toEqual(timestamp);
      expect(responseData.processedState).toBe('UNPROCESSED');
    });
  });
});
