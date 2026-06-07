import api from '../../../services/api';

export const addFavouriteWord = async (word: string) => {
    try {
        const response = await api.post('/api/v1/favorite-words', {
            word,
        });
        return response.data;
    } catch (error) {
        console.log(error);
    }
};
