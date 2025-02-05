using AutoCount.Authentication;
using AutoCount.Stock.Item;
using AutoCount.Stock.StockAdjustment;
using AutoCountAPI.Models;
using AutoCountAPI.Services.Interface;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using System.Threading;
using System.Data.SqlClient;

namespace AutoCountAPI.Services
{
	public class StockService : IStockService
	{
		private readonly ILoginService _loginService;
		private readonly ILogger<StockService> _logger;
		private UserSession _userSession;
		private readonly SemaphoreSlim _sessionLock = new SemaphoreSlim(1, 1);
		private Dictionary<string, List<string>> _itemDocNoMap = new Dictionary<string, List<string>>();
		private ItemDataAccess _itemDataAccess;
		private bool _isInitialized;
		private readonly TimeSpan _initTimeout = TimeSpan.FromSeconds(30);

		public StockService(ILoginService loginService, ILogger<StockService> logger)
		{
			_loginService = loginService;
			_logger = logger;
			InitializeService().ConfigureAwait(false);
		}

		// Initialize the service
		private async Task InitializeService()
		{
			CancellationTokenSource cts = null;
			try
			{
				// Set a timeout for initialization
				cts = new CancellationTokenSource(_initTimeout);
				// Ensure session is initialized
				await EnsureSessionAsync(cts.Token);

				if (_userSession != null && !_isInitialized)
				{
					await Task.Run(() =>
					{
						try
						{
							// Create item data access
							_itemDataAccess = ItemDataAccess.Create(_userSession, _userSession.DBSetting);
							// Warm-up query
							_userSession.DBSetting.GetDataTable("SELECT TOP 1 ItemCode FROM Item", false);
							_isInitialized = true;
							_logger.LogInformation("StockService initialized successfully");
						}
						catch (Exception ex)
						{
							_logger.LogWarning($"Initial warm-up failed (non-critical): {ex.Message}");
						}
					}, cts.Token);
				}
			}
			catch (Exception ex)
			{
				_logger.LogError($"Service initialization error: {ex.Message}");
			}
			finally
			{
				// Cancel the timeout
				cts?.Dispose();
			}
		}

		// Ensure session is initialized
		private async Task EnsureSessionAsync(CancellationToken cancellationToken = default)
		{
			if (_userSession != null && _isInitialized) return;

			// Wait for session initialization
			await _sessionLock.WaitAsync(cancellationToken);
			try
			{
				if (_userSession == null)
				{
					_userSession = _loginService.AutoCountLogin();
					_logger.LogInformation("AutoCount session initialized");
				}
			}
			finally
			{
				// Release the lock
				_sessionLock.Release();
			}
		}

		// Get item data by item code
		public ItemEntity GetItemData(string itemCode)
		{
			try
			{
				EnsureSessionAsync().Wait();

				var cmd = _itemDataAccess ?? ItemDataAccess.Create(_userSession, _userSession.DBSetting);
				return cmd.LoadItem(itemCode, ItemEntryAction.View);
			}
			catch (Exception ex)
			{
				_logger.LogError($"Error retrieving item data: {ex.Message}");
				throw;
			}
		}

		// Get all item data
		public DataTable GetAllItemData()
		{
			try
			{
				EnsureSessionAsync().Wait();

				string sqlSelectAllItems = "SELECT ItemCode FROM Item WHERE IsActive='T'";
				DataTable tblItemCode = _userSession.DBSetting.GetDataTable(sqlSelectAllItems, false);

				string[] itemArray = tblItemCode.AsEnumerable()
					.Select(r => r.Field<string>("ItemCode"))
					.ToArray();

				var cmd = _itemDataAccess ?? ItemDataAccess.Create(_userSession, _userSession.DBSetting);
				ItemEntities items = cmd.LoadAllItem(itemArray);

				return items.ItemTable;
			}
			catch (Exception ex)
			{
				_logger.LogError($"Error retrieving all item data: {ex.Message}");
				throw;
			}
		}

		public void NewStockItem(StockItem stockItem, decimal? qty = null)
		{
			try
			{
				EnsureSessionAsync().Wait();
				bool recalculate = false;

				var cmd = _itemDataAccess ?? ItemDataAccess.Create(_userSession, _userSession.DBSetting);
				ItemEntity itemEntity = cmd.NewItem();

				MapItemProperties(itemEntity, stockItem);

				cmd.SaveData(itemEntity, ref recalculate);
				_logger.LogInformation($"Stock item {stockItem.ItemCode} created successfully");

				if (qty.HasValue && qty.Value != 0)
				{
					CreateNewStockAdjustment(itemEntity.ItemCode, qty.Value, stockItem.BaseUOM);
				}
			}
			catch (Exception ex)
			{
				_logger.LogError($"Error creating stock item: {ex.Message}");
				throw;
			}
		}

		// Map stock item properties to item entity
		private void MapItemProperties(ItemEntity itemEntity, StockItem stockItem)
		{
			itemEntity.ItemCode = stockItem.ItemCode;
			itemEntity.ItemGroup = stockItem.ItemGroup;
			itemEntity.ItemType = stockItem.ItemType;
			itemEntity.Description = stockItem.Description;
			itemEntity.StockControl = stockItem.StockControl == "T";
			itemEntity.HasSerialNo = stockItem.HasSerialNo == "T";
			itemEntity.HasBatchNo = stockItem.HasBatchNo == "T";
			itemEntity.DutyRate = stockItem.DutyRate;
			itemEntity.IsActive = stockItem.IsActive == "T";
			itemEntity.CostingMethod = stockItem.CostingMethod;
			itemEntity.BaseUomRecord.Uom = stockItem.BaseUOM;
			itemEntity.SalesUom = stockItem.BaseUOM;
			itemEntity.PurchaseUom = stockItem.BaseUOM;
			itemEntity.BaseUomRecord.StandardSellingPrice = stockItem.Price;
		}

		public void EditStockItem(string itemCode, StockItem stockItem, decimal? qty = null)
		{
			try
			{
				EnsureSessionAsync().Wait();
				bool recalculate = false;

				var cmd = _itemDataAccess ?? ItemDataAccess.Create(_userSession, _userSession.DBSetting);
				ItemEntity itemEntity = cmd.LoadItem(itemCode, ItemEntryAction.Edit);

				MapItemProperties(itemEntity, stockItem);

				cmd.SaveData(itemEntity, ref recalculate);
				_logger.LogInformation($"Stock item {itemCode} updated successfully");

				if (qty.HasValue && qty.Value != 0)
				{
					CreateNewStockAdjustment(itemCode, qty.Value, stockItem.BaseUOM);
				}
			}
			catch (Exception ex)
			{
				_logger.LogError($"Error editing stock item: {ex.Message}");
				throw;
			}
		}

		public void DeleteStockItem(string itemCode)
		{
			try
			{
				EnsureSessionAsync().Wait();

				// Delete associated adjustments first
				DeleteStockAdjustmentsforItem(itemCode);

				var cmd = _itemDataAccess ?? ItemDataAccess.Create(_userSession, _userSession.DBSetting);
				cmd.Delete(itemCode);
				_logger.LogInformation($"Stock item {itemCode} deleted successfully");
			}
			catch (Exception ex)
			{
				_logger.LogError($"Error deleting stock item: {ex.Message}");
				throw;
			}
		}

		public void CreateNewStockAdjustment(string itemCode, decimal qty, string uom = null)
		{
			try
			{
				EnsureSessionAsync().Wait();

				StockAdjustmentCommand cmd = StockAdjustmentCommand.Create(_userSession, _userSession.DBSetting);
				StockAdjustment doc = cmd.AddNew();

				doc.DocDate = DateTime.Today.Date;
				doc.Description = "Adjust Stock Quantity";
				doc.RefDocNo = GenerateUniqueRefDocNo();

				var dtl = doc.AddDetail();
				dtl.ItemCode = itemCode;
				dtl.Qty = qty;
				dtl.UOM = uom;

				doc.Save();
				string docNo = doc.DocNo;

				// Update document mapping
				lock (_itemDocNoMap)
				{
					if (!_itemDocNoMap.ContainsKey(itemCode))
					{
						_itemDocNoMap[itemCode] = new List<string>();
						_logger.LogInformation($"New stock adjustment mapping created for {itemCode}");
					}
					_itemDocNoMap[itemCode].Add(docNo);
				}

				_logger.LogInformation($"Stock adjustment created for {itemCode}, quantity: {qty}");
			}
			catch (Exception ex)
			{
				_logger.LogError($"Error creating stock adjustment: {ex.Message}");
				throw;
			}
		}

		private string GenerateUniqueRefDocNo()
		{
			return $"DD{DateTime.Now:yyyyMMddHHmmssff}";
		}

		public void DeleteStockAdjustmentsforItem(string itemCode)
		{
			try
			{
				// Get all document numbers for the item using GetItemAnalysisSummaryTable
				string getAllDocKeysQuery = @"
					SELECT DISTINCT A.DocNo 
					FROM ADJ A 
					INNER JOIN ADJDTL D ON A.DocKey = D.DocKey 
					WHERE D.ItemCode = @ItemCode";

				// Get all document numbers for the item
				var docNoParam = new SqlParameter("@ItemCode", itemCode);
				var docNoTable = _userSession.DBSetting.GetDataTable(getAllDocKeysQuery, false, docNoParam);

				if (docNoTable == null || docNoTable.Rows.Count == 0)
				{
					_logger.LogInformation($"No adjustments found for item {itemCode}");
					return;
				}

				// Extract document numbers
				var docNos = docNoTable.AsEnumerable()
					.Select(row => row.Field<string>("DocNo"))
					.Where(docNo => !string.IsNullOrEmpty(docNo))
					.Distinct()
					.ToList();

				_logger.LogInformation($"Found {docNos.Count} adjustments to delete for item {itemCode}");

				foreach (var docNo in docNos)
				{
					try
					{
						DeleteStockAdjustment(docNo);
					}
					catch (Exception ex)
					{
						_logger.LogError($"Failed to delete adjustment {docNo}: {ex.Message}");
					}
				}

				// Remove the item from the mapping
				lock (_itemDocNoMap)
				{
					_itemDocNoMap.Remove(itemCode);
				}

				_logger.LogInformation($"Completed deleting adjustments for {itemCode}. ");
			}
			catch (Exception ex)
			{
				_logger.LogError($"Error deleting stock adjustments for {itemCode}: {ex.Message}");
				throw;
			}
		}

		private void DeleteStockAdjustment(string docNo)
		{
			try
			{
				EnsureSessionAsync().Wait();
				StockAdjustmentCommand cmd = StockAdjustmentCommand.Create(_userSession, _userSession.DBSetting);	

				// Verify the document exists before attempting deletion
				var adjustment = cmd.View(docNo);
				if (adjustment == null)
				{
					_logger.LogWarning($"Stock adjustment {docNo} not found");
					return;
				}

				cmd.Delete(docNo);
				_logger.LogInformation($"Stock adjustment {docNo} deleted successfully");
				
			}
			catch (Exception ex)
			{
				_logger.LogError($"Error deleting stock adjustment {docNo}: {ex.Message}");
				throw;
			}
			finally
			{
				// Ensure proper cleanup of command resources
				GC.Collect();
			}
		}
	}
}