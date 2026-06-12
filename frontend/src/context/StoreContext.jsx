import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const url = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const StoreContextProvider = (props) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem('cartItems');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    });
    const [token, setToken] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    // liveQuery updates immediately for UI filtering; searchQuery is the debounced/global value
    const [liveQuery, setLiveQuery] = useState("");
    const [food_list, setFoodList] = useState([]);

    // create a stable axios instance that updates its default header when token changes
    const api = useMemo(() => {
        const instance = axios.create({ baseURL: url, timeout: 8000 });
        if (token) instance.defaults.headers.common['token'] = token;
        else delete instance.defaults.headers.common['token'];
        return instance;
    }, [token]);

    // fetch food list
    const fetchFoodList = useCallback(async () => {
        try {
            const response = await api.get('/api/food/list');
            setFoodList(response?.data?.data || []);
        } catch (error) {
            console.error('fetchFoodList error:', error?.response || error.message || error);
            setFoodList([]);
        }
    }, [api]);

    // load cart from backend and sanitize values (filter zeros/invalids)
    const loadCartData = useCallback(async () => {
        if (!token) return;
        try {
            // backend expects GET /api/cart/get (no body)
            const response = await api.get('/api/cart/get');
            if (response?.data?.success) {
                const rawCart = response.data.cartData || {};
                const sanitized = {};
                Object.entries(rawCart).forEach(([id, qty]) => {
                    const q = Number(qty);
                    if (Number.isFinite(q) && Number.isInteger(q) && q > 0) {
                        sanitized[id] = q;
                    }
                });
                setCartItems(sanitized);
            }
        } catch (error) {
            console.error('loadCartData error:', error?.response || error.message || error);
        }
    }, [api, token]);

    // add item (optimistic update + backend sync)
    const addToCart = useCallback(async (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
        if (!token) return;
        try {
            await api.post('/api/cart/add', { itemId });
        } catch (error) {
            // revert on failure
            console.error('addToCart error:', error?.response || error.message || error);
            setCartItems((prev) => {
                const next = { ...prev };
                if (next[itemId] > 1) next[itemId] -= 1;
                else delete next[itemId];
                return next;
            });
        }
    }, [api, token]);

    // remove item (optimistic update + backend sync)
    const removeFromCart = useCallback(async (itemId) => {
        setCartItems((prev) => {
            const next = { ...prev };
            if (next[itemId] > 1) next[itemId] -= 1;
            else delete next[itemId];
            return next;
        });
        if (!token) return;
        try {
            await api.post('/api/cart/remove', { itemId });
        } catch (error) {
            // revert on failure: increment back
            console.error('removeFromCart error:', error?.response || error.message || error);
            setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
        }
    }, [api, token]);

    const getTotalCartAmount = useCallback(() => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                const itemInfo = food_list.find((product) => product._id === item);
                if (itemInfo) {
                    totalAmount += cartItems[item] * itemInfo.price;
                }
            }
        }
        return totalAmount;
    }, [cartItems, food_list]);

    // On mount: fetch food list first, then load cart (so components have product data available)
    useEffect(() => {
        let mounted = true;
        const init = async () => {
            await fetchFoodList(); // ensure food_list is populated before loading cart
            const storedToken = localStorage.getItem('token');
            if (storedToken && mounted) {
                setToken(storedToken);
            }
        };
        init();
        return () => { mounted = false; };
    }, [fetchFoodList]);

    // whenever token changes (set on mount above or after login), load cart data
    useEffect(() => {
        if (!token) return;
        loadCartData();
    }, [token, loadCartData]);

    // persist cart to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
        } catch (e) {
            // ignore write errors
        }
    }, [cartItems]);

    const contextValue = useMemo(() => ({
        food_list,
        cartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        url,
        token,
        setToken,
        searchQuery,
        setSearchQuery,
        liveQuery,
        setLiveQuery
    }), [food_list, cartItems, addToCart, removeFromCart, getTotalCartAmount, token, searchQuery, setSearchQuery]);

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;