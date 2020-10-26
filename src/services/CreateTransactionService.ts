import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

import CategoryRepository from '../repositories/CategoryRepository';
import TransactionsRepository from '../repositories/TransactionsRepository';

import CreateCategoryService from './CreateCategoryService';

interface Request {
  title: string;
  value: number;
  type: string;
  category: string;
}

class CreateTransactionService {
  private categoryId: string;

  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getRepository(Transaction);
    const categoriesRepository = getCustomRepository(CategoryRepository);

    const getTransactionsRepository = new TransactionsRepository();
    const balance = await getTransactionsRepository.getBalance();

    if (type === 'outcome' && balance.total - value < 0) {
      throw new AppError('Outcome value is bigger than cash balance');
    }

    const findCategoryId = await categoriesRepository.findByName(category);

    if (!findCategoryId) {
      const createNewCategory = new CreateCategoryService();

      const createdCategory = await createNewCategory.execute({ category });

      this.categoryId = createdCategory.id;
    } else {
      this.categoryId = findCategoryId.id;
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: this.categoryId,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
