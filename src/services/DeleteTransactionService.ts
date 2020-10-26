import { getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface TransactionId {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: TransactionId): Promise<void> {
    const transactionsRepository = getRepository(Transaction);

    await transactionsRepository.delete(id);
  }
}

export default DeleteTransactionService;
