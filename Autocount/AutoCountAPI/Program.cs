using System;
using AutoCountAPI.Services;
using AutoCountAPI.Services.Interface;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.Web.Http.SelfHost;
using System.Web.Http;
using System.Web.Http.Dependencies;
using System.Collections.Generic;
using System.Linq;
using AutoCountAPI.Controllers;
using AutoCountAPI.Models;
using System.Threading.Tasks;

namespace AutoCountAPI
{
    public class Program
    {
		static async Task Main(string[] args)
		{
			try
			{
				// Set up the configuration to read from appsettings.json
				var config = new ConfigurationBuilder()
					.SetBasePath(AppContext.BaseDirectory)
					.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
					.Build();

				// Create a service collection
				var servicecollection = new ServiceCollection();
				ConfigureServices(servicecollection, config);

				// Build the service provider
				var serviceProvider = servicecollection.BuildServiceProvider();

				// Initialize AutoCount login in background
				_ = Task.Run(async () =>
				{
					try
					{
						var loginAutoCountService = serviceProvider.GetRequiredService<ILoginService>();
						Console.WriteLine("Initializing AutoCount connection...");
						await Task.Run(() => loginAutoCountService.AutoCountLogin());
						Console.WriteLine("AutoCount initialized successfully.");

						// Sync item data after successful login
						var localDBService = serviceProvider.GetRequiredService<ILocalDBService>();
						await Task.Run(() => localDBService.SyncItemDataToLocalDB());
						Console.WriteLine("Initial data sync completed.");
					}
					catch (Exception ex)
					{
						Console.WriteLine($"Background initialization error: {ex.Message}");
					}
				});

				// Set up HTTP server configuration
				var httpConfig = new HttpSelfHostConfiguration("http://localhost:5000");

				// Configure routes
				httpConfig.Routes.MapHttpRoute(
					name: "Default",
					routeTemplate: "api/{controller}/{action}/{id}",
					defaults: new { id = RouteParameter.Optional }
				);

				// Set up the dependency resolver
				httpConfig.DependencyResolver = new MyDependencyResolver(serviceProvider);

				// Add request timeout handling
				httpConfig.ReceiveTimeout = TimeSpan.FromMinutes(2);

				// Create and start the server
				using (var server = new HttpSelfHostServer(httpConfig))
				{
					try
					{
						await server.OpenAsync();
						Console.WriteLine("Web API running at http://localhost:5000");

						// Keep the application running
						var tcs = new TaskCompletionSource<bool>();
						Console.CancelKeyPress += (s, e) => {
							e.Cancel = true;
							tcs.SetResult(true);
						};

						await tcs.Task;
						await server.CloseAsync();
					}
					catch (Exception ex)
					{
						Console.WriteLine($"Error in server operation: {ex.Message}");
					}
				}
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Critical error: {ex.Message}");
			}
		}

		private static void ConfigureServices(IServiceCollection services, IConfiguration config)
        {
            Console.WriteLine("Loaded Configuration:");
            Console.WriteLine($"AutoCount User: {config["AutoCountSettings:AutoCountUser"]}");
            Console.WriteLine($"Server Name: {config["AutoCountSettings:ServerName"]}");
            Console.WriteLine($"Database Name: {config["AutoCountSettings:DBName"]}");

            // Register the services
            services.AddSingleton<ILoginService, LoginService>();
            services.AddSingleton<IStockService, StockService>();
            services.AddSingleton<ILocalDBService, LocalDBService>();

            // Register AutoCountSettings from appsettings.json
            services.Configure<AutoCountSettings>(config.GetSection("AutoCountSettings"));
            services.AddSingleton(sp => sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<AutoCountSettings>>().Value);

            // Register the controllers
            services.AddTransient<StockController>();

            // Register the logger
            services.AddLogging(builder =>
            {
                builder.AddConfiguration(config.GetSection("Logging"));
                builder.AddConsole();
            });

            // Register the configuration
            services.AddSingleton(config);
        }

        private class MyDependencyResolver : IDependencyResolver
        {
            private readonly IServiceProvider _serviceProvider;

            public MyDependencyResolver(IServiceProvider serviceProvider)
            {
                _serviceProvider = serviceProvider;
            }

            public IDependencyScope BeginScope()
            {
                return this; // This example does not implement a scope
            }

            public void Dispose()
            {
                // Dispose if necessary
            }

            public object GetService(Type serviceType)
            {
                return _serviceProvider.GetService(serviceType);
            }

            public IEnumerable<object> GetServices(Type serviceType)
            {
                return (IEnumerable<object>)_serviceProvider.GetService(serviceType) ?? Enumerable.Empty<object>();
            }
        }
    }
}
