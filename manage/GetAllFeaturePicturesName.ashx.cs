using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;

namespace Manage
{
    /// <summary>
    /// GetAllFeaturePicturesName 的摘要说明
    /// 获取Manage项目下的所有专题图片的名称
    /// 图片路径：themes/default/images/feature/
    /// </summary>
    public class GetAllFeaturePicturesName : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            //context.Response.ContentType = "text/plain";
            //context.Response.Write("Hello World");

            context.Response.ContentType = "json";
            string path = context.Server.MapPath("~/themes/default/images/feature/");    //服务器文件夹路径
            string[] paths = Directory.GetFiles(path);
            List<string> files = new List<string>();
            foreach (string filepath in paths)
            {
                FileInfo file = new FileInfo(filepath);
                string name = file.Name;
                files.Add(name);
            }
            //List数据转为Json数据
            JavaScriptSerializer js = new JavaScriptSerializer();
            string pictureData = js.Serialize(files);
            context.Response.Write(pictureData);
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