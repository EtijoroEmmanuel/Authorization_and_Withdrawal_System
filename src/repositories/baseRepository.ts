import {
  Model,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
  Types,
  ClientSession,
} from "mongoose";

export class BaseRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  async create(data: Partial<T>, session?: ClientSession): Promise<T> {
    if (session) {
      const [created] = await this.model.create([data], { session });
      return created;
    }
    return this.model.create(data);
  }

  async findOne(
    filter: FilterQuery<T>,
    session?: ClientSession
  ): Promise<T | null> {
    return this.model.findOne(filter).session(session || null);
  }

  async findById(
    id: string | Types.ObjectId,
    session?: ClientSession
  ): Promise<T | null> {
    return this.model.findById(id).session(session || null);
  }

  async find(
    filter: FilterQuery<T> = {},
    session?: ClientSession
  ): Promise<T[]> {
    return this.model.find(filter).session(session || null);
  }

  async findOneAndUpdate(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options: QueryOptions = { new: true },
    session?: ClientSession
  ): Promise<T | null> {
    return this.model.findOneAndUpdate(filter, update, { ...options, session });
  }

  async findByIdAndUpdate(
    id: string | Types.ObjectId,
    update: UpdateQuery<T>,
    options: QueryOptions = { new: true },
    session?: ClientSession
  ): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, { ...options, session });
  }

  async deleteOne(
    filter: FilterQuery<T>,
    session?: ClientSession
  ): Promise<void> {
    await this.model.deleteOne(filter).session(session || null);
  }

  async deleteMany(
    filter: FilterQuery<T>,
    session?: ClientSession
  ): Promise<void> {
    await this.model.deleteMany(filter).session(session || null);
  }
}
