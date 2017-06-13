using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace StubHubScraper.Web.Models
{
    public class BaseModel
    {
        public BaseModel()
        {
            this.CustomProperties = new Dictionary<string, object>();
        }

        /// <summary>
        /// Use this property to store any custom value for your models. 
        /// </summary>
        public Dictionary<string, object> CustomProperties { get; set; }
    }

    /// <summary>
    /// Base entity model
    /// </summary>
    public partial class BaseEntityModel : BaseModel
    {
        public virtual int Id { get; set; }
    }
}