import { Router } from 'express';

import multer from 'multer';
import path from 'path';

import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (_request, response) => {
  const transactionsRepository = new TransactionsRepository();

  const transactionsList = await transactionsRepository.getTransactions();
  const categoriesList = await transactionsRepository.getCategories();

  const transactions = transactionsList.map(transaction => {
    const categoriesArray = categoriesList.map(
      category => category.id === transaction.category_id && category,
    );
    const categoryIndex = categoriesArray.findIndex(category => category);
    return {
      id: transaction.id,
      title: transaction.title,
      value: transaction.value,
      type: transaction.type,
      category: categoriesArray[categoryIndex],
      created_at: transaction.created_at,
      updated_at: transaction.updated_at,
    };
  });

  const balance = await transactionsRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  const returnTransaction = {
    id: transaction.id,
    title: transaction.title,
    value: transaction.value,
    type: transaction.type,
    category,
  };

  return response.json(returnTransaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteRepository = new DeleteTransactionService();

  await deleteRepository.execute({ id });

  return response.json({ ok: true });
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const { filename } = request.file;

    const csvFilePath = path.resolve(uploadConfig.directory, filename);

    const dataTransactions = new ImportTransactionsService();

    const oneDataLine = await dataTransactions.loadCSV(csvFilePath);

    const createTransactions = new CreateTransactionService();

    oneDataLine.forEach(data => createTransactions.execute({ ...data }));

    return response.json({ ok: oneDataLine });
  },
);

export default transactionsRouter;
