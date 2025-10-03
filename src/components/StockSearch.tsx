import { useState, useEffect, useMemo } from "react"; // Added useMemo for efficiency
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import axios from "axios";


interface Stock {
  name: string;
  symbol: string;
  exchange_token: string;
}

interface StockSearchProps {
  onStockSelect: (stock: Stock) => void;
}

export const StockSearch = ({ onStockSelect }: StockSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  // Explicitly type the state array to hold Stock objects
  const [data, setData] = useState<Stock[]>([]); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://127.0.1.0:3000/symbols");
        setData(response.data.symbols);
        localStorage.setItem("exchange_token", JSON.stringify(response.data.symbols.map((stock: Stock) => stock.exchange_token)));
        localStorage.setItem("stock_symbols", JSON.stringify(response.data.symbols.map((stock: Stock) => stock.symbol)));
      } catch (error) {
        console.error("Error fetching data:", error); // Use console.error for errors
      }
    };

    fetchData();
  }, []);

  // Filter the Data ---
  const filteredData = useMemo(() => {
    if (!searchTerm) {
      return data; // If no search term, return all data
    }
    
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return data.filter((stock) => 
      // Check if the stock name or symbol includes the search term
      stock.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      stock.symbol.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [data, searchTerm]);


  return (
    <div className="space-y-6">
      {/* ... (Your header and search input div remains the same) */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold gradient-text">Stock Trader</h1>
        <p className="text-muted-foreground">
          Search and select a stock to start trading
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search stocks (AAPL, GOOGL, etc.)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 text-lg"
        />
      </div>

      <div className="grid gap-3">
        <h2 className="text-lg font-semibold text-foreground">
          {searchTerm ? "Search Results" : "Popular Stocks"} 
        </h2>
        {/* Map over the filteredData, NOT the original 'data' */}
        {filteredData.map((stock,id) => ( 
          <Card
            key={id}
            className="glass-card p-4 cursor-pointer transition-all duration-300 hover:glow-effect hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => onStockSelect(stock)}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-foreground">
                    {stock.name}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">{stock.symbol}</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">
                  {stock.exchange_token}
                </div>
              </div>
            </div>
          </Card>
        ))}
        {filteredData.length === 0 && searchTerm && (
            <p className="text-center text-muted-foreground pt-4">No stocks found matching "{searchTerm}".</p>
        )}
      </div>
    </div>
  );
};