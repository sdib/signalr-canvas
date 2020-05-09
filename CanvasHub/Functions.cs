using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Microsoft.Azure.WebJobs.Extensions.SignalRService;

namespace CanvasHub
{
	public static class Functions
	{

		[FunctionName("negotiate")]
		public static SignalRConnectionInfo Negotiate(
			[HttpTrigger(AuthorizationLevel.Anonymous)]HttpRequest req,
			[SignalRConnectionInfo(HubName = "canvas")]SignalRConnectionInfo connectionInfo)
		{
			return connectionInfo;
		}

		[FunctionName("CanvasHub")]
		public static async Task<IActionResult> Run(
			[HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)] HttpRequest req,
			[SignalR(HubName = "canvas")] IAsyncCollector<SignalRMessage> signalRMessages,
			ILogger log)
		{
			log.LogInformation("C# HTTP trigger function processed a request.");

			string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
			object data = JsonConvert.DeserializeObject(requestBody);

			await signalRMessages.AddAsync(new SignalRMessage { Arguments = new[] { data }, Target = "newStrokes" });

			return new OkResult();
		}
	}
}
