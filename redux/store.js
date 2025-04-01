import { createStore } from 'redux';
import favoritesReducer from './reducers';

const store = createStore(favoritesReducer);

export default store;
