using AutoCount.Authentication;
using AutoCount.Data;
using AutoCountAPI.Controllers;
using AutoCountAPI.Models;
using AutoCountAPI.Services.Interface;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;


namespace AutoCountAPI.Services
{
    public class LoginService : ILoginService
    {
        private readonly AutoCountSettings _autoCountSettings;
        private readonly ILogger<StockController> _logger;

        public LoginService(IOptions<AutoCountSettings> autoCountSettings, ILogger<StockController> logger)
        {
            _autoCountSettings = autoCountSettings.Value;
            _logger = logger;
        }

        public UserSession AutoCountLogin()
        {
            try
            {
                string userName = _autoCountSettings.AutoCountUser;
                string passWord = _autoCountSettings.AutoCountPassword;
                string serverName = _autoCountSettings.ServerName;
                string dbName = _autoCountSettings.DBName;
                string saPassword = _autoCountSettings.SaPassword;

                DBSetting dbSetting = new DBSetting(DBServerType.SQL2000, serverName, dbName);

                if (dbSetting == null)
                {
                    _logger.LogError("DBSetting is null. Failed to retrieve database settings.");
                    return null;
                }

                var newSession = new UserSession(dbSetting);
                newSession.Login(userName, passWord);

                if (newSession.IsLogin)  
                {
                    _logger.LogInformation("Login to AutoCount successfully!");
                    return newSession;
                }
                else
                {
                    _logger.LogError("Failed to login to AutoCount. Please check your credentials.");
                    return null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"An error occurred during login: {ex.Message}");
                return null;
            }
        }
    }
}
