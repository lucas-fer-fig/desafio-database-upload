import { getRepository } from 'typeorm';

import Category from '../models/Category';

interface Request {
  category: string;
}

class CreateCategoryService {
  public async execute({ category }: Request): Promise<Category> {
    const categoryRepository = getRepository(Category);

    const createdCategory = categoryRepository.create({ title: category });

    await categoryRepository.save(createdCategory);

    return createdCategory;
  }
}

export default CreateCategoryService;
