namespace AutoCountAPI.Models
{
    public class StockItem
    {
        public string ItemCode { get; set; }
        public string ItemGroup { get; set; }
        public string ItemType { get; set; }
        public string Description { get; set; }
        public string StockControl { get; set; }
		public string HasSerialNo { get; set; }
        public string HasBatchNo { get; set; }
        public decimal DutyRate { get; set; }
        public int CostingMethod { get; set; }
        public decimal Price { get; set; }
		public string BaseUOM { get; set; }
        public string IsActive { get; set; }
    }
}
