import { Expose } from 'class-transformer';

export class BasePaginationRequest {
  @Expose({ toPlainOnly: true })
  public page?: number;

  @Expose({ toPlainOnly: true })
  public size?: number;

  @Expose({ toPlainOnly: true })
  public query?: string;

  constructor(model: Partial<BasePaginationRequest> = {}) {
    Object.assign(this, model);
  }
}
