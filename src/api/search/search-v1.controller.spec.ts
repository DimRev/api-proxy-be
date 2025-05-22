import { Test, TestingModule } from '@nestjs/testing';
import { SearchV1Controller } from './search-v1.controller';

describe('SearchController', () => {
  let controller: SearchV1Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchV1Controller],
    }).compile();

    controller = module.get<SearchV1Controller>(SearchV1Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
