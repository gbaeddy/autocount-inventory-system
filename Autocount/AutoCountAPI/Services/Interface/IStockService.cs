using AutoCount.Stock.Item;
using AutoCountAPI.Models;
using System.Data;

namespace AutoCountAPI.Services.Interface
{
    public interface IStockService
    {
		ItemEntity GetItemData(string itemCode);
        DataTable GetAllItemData();
        void NewStockItem(StockItem stockItem, decimal? qty = null);
        void EditStockItem(string itemCode, StockItem stockItem, decimal? qty = null);
        void DeleteStockItem(string itemCode);
    }
}