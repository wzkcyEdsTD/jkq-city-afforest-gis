using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Script.Serialization;

namespace Manage.data
{
    /// <summary>
    /// varifyUrl 的摘要说明
    /// 验证服务地址是否正确
    /// </summary>
    public class proxy : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            try
            {
                StreamReader reader = new StreamReader(context.Request.InputStream);
                string strJson = HttpUtility.UrlDecode(reader.ReadToEnd());
                JavaScriptSerializer jss = new JavaScriptSerializer();
                Dictionary<String, String> dicParameter = jss.Deserialize<Dictionary<String, String>>(strJson);
                string url = dicParameter["url"];
                //验证
                WebClient web = new WebClient();
                web.Encoding = System.Text.Encoding.UTF8;
                string json = web.DownloadString(url);
                context.Response.ContentType = "text/plain";
                string result = "{\"varify\":true,\"error\":\"\"}";
                context.Response.Write(jss.Serialize(result));
            }
            catch (Exception ex)
            {
                context.Response.ContentType = "text/plain";
                string result = "{\"varify\":false,\"error\":\""+ ex.Message +"\"}";
                JavaScriptSerializer jss = new JavaScriptSerializer();
                context.Response.Write(jss.Serialize(result));
            }
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}