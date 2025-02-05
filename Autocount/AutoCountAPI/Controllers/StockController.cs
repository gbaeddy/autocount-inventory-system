using AutoCountAPI.Models;
using AutoCountAPI.Services.Interface;
using Microsoft.Extensions.Logging;
using System;
using System.Web.Http;

namespace AutoCountAPI.Controllers
{
    [RoutePrefix("api/stock")]
    public class StockController : ApiController
    {
        private readonly IStockService _stockService;
        private readonly ILogger<StockController> _logger;

        public StockController(IStockService stockService, ILogger<StockController> logger)
        {
            _stockService = stockService;
            _logger = logger;
        }

        [HttpGet]
		[ActionName("GetItemData")]
		public IHttpActionResult GetItemData(string itemCode)
		{
			if (string.IsNullOrEmpty(itemCode))
			{
				_logger.LogError("Received empty item code.");
				return BadRequest("Invalid item code.");
			}

			try
			{
				_stockService.GetItemData(itemCode);
				return Ok("Item Received Successfully");
			}
			catch (Exception ex)
			{
				_logger.LogError($"An error occurred while retrieving item: {ex.Message}");
				return InternalServerError();
			}
		}

		[HttpGet]
        [ActionName("GetAllItemData")]
        public IHttpActionResult GetAllItemData()
        {
            try
            {
                var itemData = _stockService.GetAllItemData();

                if (itemData == null || itemData.Rows.Count == 0)
                {
                    _logger.LogWarning("No items found.");
                    return NotFound();
                }

                return Ok(itemData);
            }
            catch (Exception ex)
            {
                _logger.LogError($"An error occurred while retrieving items: {ex.Message}");
                return InternalServerError();
            }
        }

        [HttpPost]
        [ActionName("CreateNewStockItem")]
        public IHttpActionResult CreateNewStockItem([FromBody] StockItem model, [FromUri] decimal? qty = null)
        {
            if (model == null)
            {
                _logger.LogError("Received null model.");
                return BadRequest("Invalid item data.");
            }

            if (string.IsNullOrEmpty(model.BaseUOM))
            {
                _logger.LogError("Received empty base UOM.");
				return BadRequest("Invalid base UOM.");
			}

            try
            {
                _stockService.NewStockItem(model, qty);
                return Ok("New stock item created successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating stock item: {ex.Message}");
                return InternalServerError(ex);
            }
        }

        [HttpPut]
        [ActionName("EditStockItem")]
        public IHttpActionResult EditStockItem([FromUri] string itemCode, [FromBody] StockItem model, [FromUri] decimal? qty = null)
        {
            if (model == null)
            {
                _logger.LogError("Received null model.");
                return BadRequest("Invalid item data.");
            }

			if (string.IsNullOrEmpty(model.BaseUOM))
			{
				_logger.LogError("Received empty base UOM.");
				return BadRequest("Invalid base UOM.");
			}

			try
            {
                _stockService.EditStockItem(itemCode, model, qty);
                return Ok("Stock item updated successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating stock item: {ex.Message}");
                return InternalServerError(ex);
            }
        }

        [HttpDelete]
        [ActionName("DeleteStockItem")]
        public IHttpActionResult DeleteStockItem([FromUri] string itemCode)
        {
            if (string.IsNullOrEmpty(itemCode))
            {
                _logger.LogError("Received empty item code.");
                return BadRequest("Invalid item code.");
            }

            try
            {
                _stockService.DeleteStockItem(itemCode);
                return Ok("Stock item deleted successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting stock item: {ex.Message}");
                return InternalServerError(ex);
            }
        }
    }
}
