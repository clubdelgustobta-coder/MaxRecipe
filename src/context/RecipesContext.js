import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadRecipes } from '../services/sheetsService';

const RecipesContext = createContext(null);

export function RecipesProvider({ children, onReady }) {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
                const data = await loadRecipes();
            setRecipes(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
            onReady?.();
        }
    };

    useEffect(() => { load(); }, []);

    return (
        <RecipesContext.Provider value={{ recipes, loading, error, refresh: load }}>
            {children}
        </RecipesContext.Provider>
    );
}

export function useRecipes() {
    return useContext(RecipesContext);
}
