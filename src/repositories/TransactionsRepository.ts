import { EntityRepository, getRepository, Repository } from 'typeorm';

import Category from '../models/Category';
import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  private findBalance: Balance;

  constructor() {
    super();
    this.findBalance = {
      income: 0,
      outcome: 0,
      total: 0,
    };
  }

  public async getCategories(): Promise<Category[]> {
    const findAllCategories = getRepository(Category);
    const categories = await findAllCategories.find();

    return categories;
  }

  public async getBalance(): Promise<Balance> {
    const transactions = await this.getTransactions();

    const allIncomeValuesArray = transactions.map(transaction =>
      transaction.type === 'income' ? transaction.value : 0,
    );

    const allOutcomeValuesArray = transactions.map(transaction =>
      transaction.type === 'outcome' ? transaction.value : 0,
    );

    const sum = (acc: number, cur: number): number => acc + cur;

    const reducer = (valuesArray: Array<number>): number =>
      valuesArray.reduce(sum);

    if (allIncomeValuesArray.length > 0 && allOutcomeValuesArray.length > 0) {
      const income = reducer(allIncomeValuesArray) || 0;
      const outcome = reducer(allOutcomeValuesArray) || 0;
      const total = income - outcome;

      this.findBalance = {
        income,
        outcome,
        total,
      };
    }

    return this.findBalance;
  }

  public async getTransactions(): Promise<Transaction[]> {
    const findAllTransactions = getRepository(Transaction);
    const transactions = await findAllTransactions.find();

    return transactions;
  }
}

export default TransactionsRepository;
