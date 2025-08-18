// Vercel Serverless Function for Yahoo Finance API Proxy
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { symbol, symbols } = req.query;

  try {
    let data;

    if (symbols) {
      // Handle multiple symbols
      const symbolArray = symbols.split(',').map(s => s.trim()).filter(s => s);
      
      if (symbolArray.length === 0) {
        res.status(400).json({ error: 'No valid symbols provided' });
        return;
      }
      
      const promises = symbolArray.map(async (sym) => {
        try {
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}`;
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; YahooFinanceProxy/1.0)',
              'Accept': 'application/json',
              'Accept-Encoding': 'gzip, deflate, br',
              'Accept-Language': 'en-US,en;q=0.9',
            }
          });
          
          if (!response.ok) {
            throw new Error(`Yahoo API returned ${response.status} for ${sym}`);
          }
          
          const result = await response.json();
          return { symbol: sym, data: result, success: true };
        } catch (error) {
          console.error(`Error fetching ${sym}:`, error.message);
          return { symbol: sym, data: null, success: false, error: error.message };
        }
      });
      
      data = await Promise.all(promises);
    } else if (symbol) {
      // Handle single symbol
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol.trim())}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; YahooFinanceProxy/1.0)',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept-Language': 'en-US,en;q=0.9',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Yahoo API returned ${response.status} for symbol ${symbol}`);
      }
      
      data = await response.json();
    } else {
      res.status(400).json({ error: 'Symbol or symbols parameter required' });
      return;
    }

    // Add success response headers
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(data);
    
  } catch (error) {
    console.error('Error fetching Yahoo Finance data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch market data',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
