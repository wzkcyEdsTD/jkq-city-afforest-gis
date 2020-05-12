using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Script.Serialization;

namespace Client.modules.output {
    /// <summary>
    /// output 的摘要说明
    /// </summary>
    public class export : IHttpHandler {

        public void ProcessRequest(HttpContext context) {
            try {
                string name = context.Request["name"];
                string data = context.Request["data"];
                if (name == null || data == null) {
                    throw new Exception("文件名称和数据不能为空");
                }
                JavaScriptSerializer serializer = new JavaScriptSerializer();
                var json = serializer.Deserialize(data,Type.Missing.GetType());
                string fileName = name + ".csv";
                string FilePath = HttpContext.Current.Server.MapPath("~/temp/") + fileName;
                FileInfo fi = new FileInfo(FilePath + ".csv");
                //判断文件是否已经存在,如果存在就删除! 
                if (fi.Exists) {
                    fi.Delete();
                }
                File.WriteAllText(FilePath, data, Encoding.GetEncoding("gb2312"));
                context.Response.Write("[{\"fileName\":\"" + fileName + "\"}]");
            } catch (Exception ex) {
                context.Response.Write("导出Excel异常:"+ex.Message);
            }
        }

        public bool IsReusable {
            get {
                return false;
            }
        }
    }
}