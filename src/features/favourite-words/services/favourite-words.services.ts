import api from '../../../services/api';

export const getAll = async (page: number = 1, limit: number = 10) => {
    try {
        const response = await api.get('/api/v1/favorite-words/my-words', {
            params: {
                page,
                limit,
            },
        });
        return response.data;
    } catch (err) {
        console.error(err);
    }
};

export const removeFromFavourites = async (wordId: number) => {
    try {
        const response = await api.delete(`/api/v1/favorite-words/${wordId}`);
        return response.data;
    } catch (err) {
        console.error(err);
    }
};
