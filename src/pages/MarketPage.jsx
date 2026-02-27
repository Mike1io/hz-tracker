import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, Activity, RefreshCw, X, Search, Globe, Twitter, Heart } from 'lucide-react';

export default function MarketPage() {
    const [coins, setCoins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [coinDetails, setCoinDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem('market_favorites');
        try {
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('market_favorites', JSON.stringify(favorites));
    }, [favorites]);

    const fetchPrices = async () => {
        try {
            const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h');
            const data = await res.json();

            if (Array.isArray(data)) {
                setCoins(data);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error('Failed to fetch market prices:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrices();
        const interval = setInterval(fetchPrices, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedAsset) {
            fetchCoinDetails(selectedAsset.id);
        } else {
            setCoinDetails(null);
        }
    }, [selectedAsset]);

    const fetchCoinDetails = async (id) => {
        setDetailsLoading(true);
        try {
            const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`);
            const data = await res.json();
            setCoinDetails(data);
        } catch (error) {
            console.error('Failed to fetch coin details:', error);
        } finally {
            setDetailsLoading(false);
        }
    };

    const filteredCoins = useMemo(() => {
        let result = coins;

        if (activeTab === 'favorites') {
            result = result.filter(coin => favorites.includes(coin.id));
        }

        if (searchQuery) {
            result = result.filter(coin =>
                coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return result;
    }, [coins, searchQuery, activeTab, favorites]);

    const toggleFavorite = (e, coinId) => {
        e.stopPropagation();
        setFavorites(prev =>
            prev.includes(coinId)
                ? prev.filter(id => id !== coinId)
                : [...prev, coinId]
        );
    };

    const formatPrice = (price) => {
        if (price === undefined || price === null) return '---';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: price < 1 ? 4 : 2,
            maximumFractionDigits: price < 1 ? 6 : 2,
        }).format(price);
    };

    const formatVolume = (vol) => {
        if (!vol) return '---';
        if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`;
        if (vol >= 1e6) return `$${(vol / 1e6).toFixed(2)}M`;
        return `$${vol.toLocaleString()}`;
    };

    const getTradingViewLink = (coin) => {
        const symbol = coin.symbol.toUpperCase();
        return `https://s.tradingview.com/widgetembed/?symbol=BINANCE:${symbol}USDT&interval=D&theme=dark`;
    };

    return (
        <div className="market-page">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h1>Market Overview</h1>
                    <p className="page-subtitle">Top 100 Cryptocurrencies by Market Cap</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div className="search-container" style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search tokens..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                padding: '10px 12px 10px 40px',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: '10px',
                                color: 'var(--text)',
                                width: '250px',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'var(--bg-card)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <button
                            onClick={() => setActiveTab('all')}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                background: activeTab === 'all' ? 'var(--bg-elevated)' : 'transparent',
                                color: activeTab === 'all' ? 'var(--text)' : 'var(--text-muted)',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Activity size={16} /> All Tokens
                        </button>
                        <button
                            onClick={() => setActiveTab('favorites')}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                background: activeTab === 'favorites' ? 'var(--bg-elevated)' : 'transparent',
                                color: activeTab === 'favorites' ? 'var(--text)' : 'var(--text-muted)',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Heart size={16} fill={activeTab === 'favorites' ? 'var(--red)' : 'none'} color={activeTab === 'favorites' ? 'var(--red)' : 'currentColor'} />
                            Favorites
                        </button>
                    </div>

                    <button
                        onClick={() => { setLoading(true); fetchPrices(); }}
                        className="btn-icon"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', width: '40px', height: '40px' }}
                        title="Refresh prices"
                    >
                        <RefreshCw size={18} className={loading && !coins.length ? 'spin' : ''} />
                    </button>
                </div>
            </div>

            {loading && !coins.length ? (
                <div className="loading-screen">
                    <div className="spinner" />
                    <p>Loading market data...</p>
                </div>
            ) : (
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                    {filteredCoins.map(coin => {
                        const isPositive = coin.price_change_percentage_24h >= 0;

                        return (
                            <div
                                key={coin.id}
                                className={`stat-card market-card-hover ${isPositive ? 'positive' : 'negative'}`}
                                onClick={() => setSelectedAsset(coin)}
                            >
                                <div style={{ width: '100%' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {coin.image ? (
                                                    <img src={coin.image} alt={coin.name} style={{ width: '100%', height: '100%' }} />
                                                ) : (
                                                    <Activity size={18} />
                                                )}
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '1.1rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{coin.name}</h3>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{coin.symbol.toUpperCase()}</span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <button
                                                onClick={(e) => toggleFavorite(e, coin.id)}
                                                className="fav-toggle"
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: '4px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: favorites.includes(coin.id) ? 'var(--red)' : 'var(--text-muted)',
                                                    transition: 'transform 0.2s'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                            >
                                                <Heart size={20} fill={favorites.includes(coin.id) ? 'var(--red)' : 'none'} />
                                            </button>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    background: isPositive ? 'rgba(0, 212, 170, 0.1)' : 'rgba(255, 75, 75, 0.1)',
                                                    color: isPositive ? 'var(--green)' : 'var(--red)',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                {Math.abs(coin.price_change_percentage_24h || 0).toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={{ fontSize: '1.6rem', fontWeight: '700', fontFamily: '"Space Grotesk", sans-serif' }}>
                                                {formatPrice(coin.current_price)}
                                            </span>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                MCap: {formatVolume(coin.market_cap)}
                                            </span>
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '0.75rem',
                                                color: 'var(--text-muted)',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                background: 'rgba(255,255,255,0.05)'
                                            }}
                                        >
                                            Rank #{coin.market_cap_rank}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )
            }

            {filteredCoins.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-secondary)' }}>
                    {activeTab === 'favorites' ? <Heart size={48} style={{ marginBottom: '16px', opacity: 0.2 }} /> : <Search size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />}
                    <h3>{activeTab === 'favorites' ? 'No favorites yet' : 'No tokens found'}</h3>
                    <p>{activeTab === 'favorites' ? 'Start favoriting tokens to see them here' : 'Try searching for a different name or symbol'}</p>
                </div>
            )}

            {lastUpdated && (
                <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                    Last updated: {lastUpdated.toLocaleTimeString()} (CoinGecko)
                </div>
            )}

            {selectedAsset && (
                <div
                    className="chart-modal-overlay"
                    onClick={() => setSelectedAsset(null)}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.85)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}
                >
                    <div
                        className="chart-modal-content"
                        onClick={e => e.stopPropagation()}
                        style={{
                            width: '100%',
                            maxWidth: '1000px',
                            height: '80vh',
                            minHeight: '500px',
                            backgroundColor: 'var(--bg-card)',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            position: 'relative',
                            border: '1px solid var(--border)',
                            boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <button
                            onClick={() => setSelectedAsset(null)}
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                zIndex: 10,
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border)',
                                color: 'var(--text)',
                                borderRadius: '50%',
                                width: '36px',
                                height: '36px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--red-bg)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                        >
                            <X size={18} />
                        </button>
                        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <img src={selectedAsset.image} alt="" style={{ width: '28px', height: '28px' }} />
                                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {selectedAsset.name} ({selectedAsset.symbol.toUpperCase()})
                                </h3>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginRight: '40px' }}>
                                {detailsLoading ? (
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading info...</span>
                                ) : coinDetails ? (
                                    <>
                                        {coinDetails.links?.homepage?.[0] && (
                                            <a
                                                href={coinDetails.links.homepage[0]}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="token-link"
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}
                                            >
                                                <Globe size={16} /> Website
                                            </a>
                                        )}
                                        {coinDetails.twitter_screen_name || coinDetails.links?.twitter_screen_name ? (
                                            <a
                                                href={`https://x.com/${coinDetails.links?.twitter_screen_name || coinDetails.twitter_screen_name}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="token-link"
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#fff', textDecoration: 'none', fontWeight: '500' }}
                                            >
                                                <Twitter size={16} /> Twitter
                                            </a>
                                        ) : null}
                                    </>
                                ) : null}
                            </div>
                        </div>
                        <iframe
                            src={getTradingViewLink(selectedAsset)}
                            style={{ width: '100%', flex: 1, border: 'none' }}
                            title={`${selectedAsset.name} Chart`}
                        />
                    </div>
                </div>
            )}

            <style>{`
        .spin { animation: spin 1s linear infinite; }
        .market-card-hover { cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
        .market-card-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div >
    );
}
