import { Test, TestingModule } from '@nestjs/testing';
import { QueryHistoryService } from './query-history.service';

describe('QueryHistoryService', () => {
  let service: QueryHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueryHistoryService],
    }).compile();

    service = module.get<QueryHistoryService>(QueryHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
