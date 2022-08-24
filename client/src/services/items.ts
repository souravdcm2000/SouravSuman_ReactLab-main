import axios from 'axios';
import IItem from '../models/IItem';

const baseURL = process.env.REACT_APP_BASE_URL;

/**
 * getItems - 2. This runs when the effect function in ExpenseTracker runs
 */
const getItems = async () => {
    const response = await axios.get<IItem[]>
    (`${baseURL}/items`);

    return response.data;
}

/**
 * addItem - Add Expense to the database
 */
const addItem = async ( item : Omit<IItem, 'id'> ) => {
    const response = await axios.post<IItem>(
        `${baseURL}/items`,
        item,
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    )

    return response.data;
}

export {
    getItems,
    addItem
};
