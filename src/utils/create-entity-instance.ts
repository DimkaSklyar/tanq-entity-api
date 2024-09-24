import {
  ClassConstructor,
  instanceToPlain,
  plainToInstance
} from 'class-transformer';

export const createEntityInstance = <TEntity, TPlain extends object = object>(
  entityConstructor: ClassConstructor<TEntity>,
  data: TPlain | TEntity,
  options: {
    fromInstancePartial?: boolean;
    convertFromInstance?: ClassConstructor<unknown>;
  } = { fromInstancePartial: false }
): TEntity => {
  if (data instanceof entityConstructor) {
    return data as TEntity;
  }

  if (options.fromInstancePartial) {
    return new entityConstructor(data) as TEntity;
  }

  return plainToInstance(
    entityConstructor as ClassConstructor<TEntity>,
    options.convertFromInstance
      ? instanceToPlain(new options.convertFromInstance(data))
      : data,
    { excludeExtraneousValues: true, exposeUnsetFields: false }
  ) as TEntity;
};
