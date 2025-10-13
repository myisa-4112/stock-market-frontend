import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import axios from "axios";

// Define the shape of a stock object
interface Stock {
  name: string;
  symbol: string;
  exchange_token: string;
}

export const StockSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<Stock[]>([]);
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data...");
        
        const response = await axios.get("http://127.0.1.0:3000/symbols");
        console.log("Data fetched:", response);
        
        setData(response.data.symbols);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return data.filter(
      (stock) =>
        stock.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        stock.symbol.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [data, searchTerm]);
  
  // This function now uses navigate
  const handleStockSelect = (stock: Stock) => {
    navigate('/trade', { state: { selectedStock: stock } });
  };

  return (
    <div className="space-y-6">
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
        {filteredData.map((stock, id) => (
          <Card
            key={id}
            className="glass-card p-4 cursor-pointer transition-all duration-300 hover:glow-effect hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => handleStockSelect(stock)} // Call the updated handler
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

