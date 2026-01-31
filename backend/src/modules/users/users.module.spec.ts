import { Test } from '@nestjs/testing';
import { UsersModule } from './users.module';

describe('UsersModule', () => {
  it('should be defined', () => {
    expect(UsersModule).toBeDefined();
  });
});
