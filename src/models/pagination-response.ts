import { Exclude, Expose, Type } from 'class-transformer';

export class BasePaginationResponse<T> {
  @Expose({ toClassOnly: true })
  public page: number;

  @Expose({ toClassOnly: true })
  public size: number;

  @Expose({ toClassOnly: true })
  public pages: number;

  @Expose({ toClassOnly: true })
  public total: number;

  @Expose({ toClassOnly: true })
  @Type(() => Object)
  public items: Array<T>;

  constructor(private entityClass: new () => T) {}

  @Expose({ toClassOnly: true })
  @Type((options) => {
    return options?.newObject.entityClass;
  })
  @Exclude()
  public get transformedData(): Array<T> {
    return this.items.map(() => new this.entityClass());
  }
}
