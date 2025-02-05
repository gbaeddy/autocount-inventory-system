using AutoCountAPI.Services.Interface;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Data;
using System.Data.SqlClient;

namespace AutoCountAPI.Services
{
    public class LocalDBService : ILocalDBService
    {
        private readonly string _connectionString;
        private readonly IStockService _stockService;
        private readonly ILogger<LocalDBService> _logger;

        public LocalDBService(IConfiguration configuration, IStockService stockService, ILogger<LocalDBService> logger)
        {
            _connectionString = configuration.GetConnectionString("InventorySystemDB");
            _stockService = stockService;
            _logger = logger;
        }

        public void SyncItemDataToLocalDB()
        {
            DataTable itemData = _stockService.GetAllItemData();

            if (itemData != null)
            {
                EnsureInventorySchemaExists();
				_logger.LogInformation("INVENTORY_SYSTEM database has been created successfully");
            }
            else
            {
                _logger.LogError("Failed to retrieve item data from AutoCount API.");
            }
        }

        private void EnsureInventorySchemaExists()
        {
            // First, connect to the 'master' database to ensure we can create the target database if it doesn't exist
            string masterConnectionString = _connectionString.Replace("INVENTORY_SYSTEM", "master");

            using (SqlConnection connection = new SqlConnection(masterConnectionString))
            {
                connection.Open();

                // Check if the INVENTORY_SYSTEM database exists and create it if it doesn't
                string checkSchemaQuery = @"
                    IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'INVENTORY_SYSTEM')
                    BEGIN
                        CREATE DATABASE [INVENTORY_SYSTEM];
                    END";

                using (SqlCommand command = new SqlCommand(checkSchemaQuery, connection))
                {
                    command.ExecuteNonQuery();
                }
            }
        }
    }
}