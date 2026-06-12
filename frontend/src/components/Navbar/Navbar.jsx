import React, { useState, useContext, useRef, useEffect } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const Navbar = ({ setShowLogin }) => {
    const [menu, setMenu] = useState("home");
    const { getTotalCartAmount, token, setToken, searchQuery, setSearchQuery, liveQuery, setLiveQuery } = useContext(StoreContext);
    const [showSearch, setShowSearch] = useState(false);
    const [localQuery, setLocalQuery] = useState(searchQuery || "");
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const DEBOUNCE_MS = 300;
    
    const logout = () => {
        localStorage.removeItem("token");
        setToken("");
        navigate("/");
    }

    // when opening search, autofocus the input
    useEffect(() => {
        if (showSearch && inputRef.current) {
            inputRef.current.focus();
        }
    }, [showSearch]);

    // initialize from URL query param on mount
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get('q') || '';
        if (q) {
            setLocalQuery(q);
            setSearchQuery(q);
            setLiveQuery(q);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // debounce localQuery -> setSearchQuery and sync to URL
    useEffect(() => {
        const handle = setTimeout(() => {
            if (localQuery !== searchQuery) {
                setSearchQuery(localQuery);
                const params = new URLSearchParams(location.search);
                if (localQuery) params.set('q', localQuery);
                else params.delete('q');
                const search = params.toString();
                navigate(search ? `${location.pathname}?${search}` : location.pathname, { replace: true });
            }
        }, DEBOUNCE_MS);
        return () => clearTimeout(handle);
    }, [localQuery, setSearchQuery, searchQuery, navigate, location]);

    return (
        <div className='navbar'>
            <Link to='/' className="brand">Avocado.</Link>
            <ul className="navbar-menu">
                <Link to='/' onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>home</Link>
                <a href='#explore-menu' onClick={() => setMenu("menu")} className={menu === "menu" ? "active" : ""}>menu</a>
                <a href='#app-download' onClick={() => setMenu("mobile-app")} className={menu === "mobile-app" ? "active" : ""}>mobile-app</a>
                <a href='#footer' onClick={() => setMenu("contact us")} className={menu === "contact us" ? "active" : ""}>contact us</a>
            </ul>
            <div className="navbar-right">
                <img src={assets.search_icon} alt="" onClick={() => setShowSearch(true)} className="search-trigger" />
                {showSearch && (
                    <div className="navbar-search-input">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search your favorite dish..."
                            value={localQuery}
                            onChange={(e) => { const v = e.target.value; setLocalQuery(v); setLiveQuery(v); }}
                        />
                        <button className="search-clear" onClick={() => { setLocalQuery(''); setSearchQuery(''); setShowSearch(false); navigate(location.pathname, { replace: true }); }} aria-label="Close search">×</button>
                    </div>
                )}
                <div className="navbar-search-icon">
                    <Link to='cart'><img src={assets.basket_icon} alt="" /></Link> 
                    <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
                </div>
                
                {!token ? <button onClick={() => setShowLogin(true)}>sign in</button>
                    : <div className='navbar-profile'>
                        <img src={assets.profile_icon} alt="" />
                        <ul className='nav-profile-dropdown'>
                            <li onClick={() => navigate('/myorders')}>
                                <svg className="nav-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                    <path d="M6 7V6a6 6 0 0112 0v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M3 7h18l-1.2 11.2A2 2 0 0117.8 20H6.2a2 2 0 01-1.999-1.8L3 7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <p>Orders</p>
                            </li>
                            <hr />
                            <li onClick={logout}>
                                <svg className="nav-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                    <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M7 5v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <p>Logout</p>
                            </li>
                        </ul>
                      </div>
                }
            </div>
        </div>
    )
}

export default Navbar