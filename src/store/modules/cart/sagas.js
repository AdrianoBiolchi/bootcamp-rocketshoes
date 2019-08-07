import { call, select, put, all, takeLatest } from 'redux-saga/effects';
import { toast } from 'react-toastify';

import api from '../../../services/api';
import history from '../../../services/history';
import { formatPrice } from '../../../util/format';
import { addToCartSuccess, updateAmountSuccess } from './actions';

function* addToCart({ id }) {
  const productExists = yield select(state =>
    state.cart.find(p => p.id === id)
  );

  const stock = yield call(api.get, `/stock/${id}`); // Chama api de stock
  const stockAmount = stock.data.amount; // pega a qtd de itens que existem
  const currentAmount = productExists ? productExists.amount : 0; // verifica se o produto existe e seta a quantidade se tiver ou 0 se não tiver

  const amount = currentAmount + 1;

  if (amount > stockAmount) {
    toast.error('Quantidade solicitada fora de estoque!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
    });
    return;
  }

  if (productExists) {
    yield put(updateAmountSuccess(id, amount));

    toast.info(`Adicionado ${amount} vezes o mesmo item!`, {
      position: 'top-left',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
    });
  } else {
    const response = yield call(api.get, `/products/${id}`);

    const data = {
      ...response.data,
      amount: 1,
      priceFormatted: formatPrice(response.data.price),
    };
    yield put(addToCartSuccess(data));

    history.push('/cart');

    toast.success('Adicionado ao carrinho', {
      position: 'top-left',
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
    });
  }
}

function* updateAmount({ id, amount }) {
  if (amount <= 0) return;

  const stock = yield call(api.get, `stock/${id}`);
  const stockAmount = stock.data.amount;

  if (amount > stockAmount) {
    toast.error('Quantidade solicitada fora de estoque!', {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
    });
    return;
  }
  yield put(updateAmountSuccess(id, amount));
}

export default all([
  takeLatest('@cart/ADD_REQUEST', addToCart),
  takeLatest('@cart/UPDATE_AMOUNT_REQUEST', updateAmount),
]);
