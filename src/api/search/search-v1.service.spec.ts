import { Test, TestingModule } from '@nestjs/testing';
import { SearchV1Service } from './search-v1.service';

describe('SearchV1Service', () => {
  let service: SearchV1Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SearchV1Service],
    }).compile();

    service = module.get<SearchV1Service>(SearchV1Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
