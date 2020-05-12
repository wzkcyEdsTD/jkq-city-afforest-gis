using System;
using System.Configuration;
using System.Net;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;
using System.Web.UI;

namespace Client {
    /// <summary>
    /// 登录验证和配置类
    /// </summary>
    public class LoginSetting : IHttpHandler {
        /// <summary>
        /// 登录验证
        /// </summary>
        /// <param name="userName"></param>
        /// <param name="userPwd"></param>
        /// <param name="url"></param>
        /// <returns></returns>
        public static VerifyResult Verify(string userName, string userPwd, string url) {
            if (!String.IsNullOrEmpty(userName) && !String.IsNullOrEmpty(userPwd)) {
                try {
                    //验证
                    string newUrl = url + "/cpzx/core/validate/verify/{0}/{1}";
                    string verifyUrl = String.Format(newUrl, userName, userPwd);
                    WebClient web = new WebClient();
                    web.Encoding = System.Text.Encoding.UTF8;
                    string json = web.DownloadString(verifyUrl);
                    json = json.Trim('"').Replace("\\", "");
                    JavaScriptSerializer jsonser = new JavaScriptSerializer();
                    return jsonser.Deserialize<VerifyResult>(json);
                } catch (Exception ex) {
                    return new VerifyResult(false, "验证服务发生错误" + ex.Message);
                }
            }
            return new VerifyResult();
        }

        /// <summary>
        /// 登录验证领导桌面权限
        /// </summary>
        /// <param name="userName"></param>
        /// <param name="userPwd"></param>
        /// <param name="url"></param>
        /// <returns></returns>
        public static string VerifyLdzm(string userId, string url)
        {
            try
            {
                //验证
                string newUrl = url + "/cpzx/manage/user/ldzm/access/{0}";
                string VerifyLdzm = String.Format(newUrl, userId);
                WebClient web = new WebClient();
                web.Encoding = System.Text.Encoding.UTF8;
                string json = web.DownloadString(VerifyLdzm);
                json = json.Trim('"').Replace("\\", "");
                return json;
            }
            catch (Exception ex)
            {
                return false.ToString();
            }
        }

        /// <summary>
        /// 登录验证运维系统权限
        /// </summary>
        /// <param name="userName"></param>
        /// <param name="userPwd"></param>
        /// <param name="url"></param>
        /// <returns></returns>
        public static string VerifyYwxt(string userId, string url)
        {
            try
            {
                //验证
                string newUrl = url + "/cpzx/manage/user/ywxt/access/{0}";
                string VerifyLdzm = String.Format(newUrl, userId);
                WebClient web = new WebClient();
                web.Encoding = System.Text.Encoding.UTF8;
                string json = web.DownloadString(VerifyLdzm);
                json = json.Trim('"').Replace("\\", "");
                return json;
            }
            catch (Exception ex)
            {
                return false.ToString();
            }
        }


        /// <summary>
        /// 通过token验证系统进入系统
        /// </summary>
        /// <param name="page"></param>
        /// <param name="token"></param>
        public static void VerifyByToken(Page page, string token) {    
            HttpResponse Response = page.Response;
            HttpSessionState Session = page.Session;
            
            string url = ConfigurationManager.AppSettings["LoginVerifyUrl"];
            if (string.IsNullOrEmpty(url)) {
                Response.Write("<script>alert('系统未设置验证服务,请联系管理员')</script>");
                Response.Redirect("~/login.aspx");
                Response.End();
            }

            if (string.IsNullOrEmpty(token)) {
                Response.Redirect("~/login.aspx");
                Response.End();
            }
            try {
                string newUrl = url + "/cpzx/core/validate/verify?token={0}";
                string verifyUrl = String.Format(newUrl, token);
                WebClient web = new WebClient();
                web.Encoding = System.Text.Encoding.UTF8;
                string json = web.DownloadString(verifyUrl);
                json = json.Trim('"').Replace("\\", "");
                JavaScriptSerializer jsonser = new JavaScriptSerializer();
                VerifyResult result = jsonser.Deserialize<VerifyResult>(json);
                if (result.status) {//验证成功
                    Session["token"] = token;
                    Session["userData"] = result.userData;
                    Session["UserName"] = result.userData.userName;
                    Session["PWD"] = result.userData.password;

                    string userdata = jsonser.Serialize(result.userData);
                    HttpCookie co = new HttpCookie("userdata");
                    co.Value = HttpUtility.UrlEncode(userdata);
                    Response.AppendCookie(co);
                } else {
                    Response.Redirect("~/login.aspx");
                }
            } catch (Exception ex) {
                Response.Redirect("~/login.aspx");
            }

        }
        /// <summary>
        /// 登录处理
        /// </summary>
        /// <param name="page"></param>
        public static void Login(Page page) {
            HttpRequest Request = page.Request;
            HttpResponse Response = page.Response;
            HttpSessionState Session = page.Session;

            string userName = Request.Form["UserName"];
            string userPwd = Request.Form["PWD"];
            string verifyUrl = Request.Form["LoginVerifyUrl"];

            HttpCookie coo = new HttpCookie("loginmsg");
            coo.Value = "";

            VerifyResult r = Verify(userName, userPwd, verifyUrl);
            if (r.status) {
                //验证成功
                Session["UserName"] = userName;
                Session["PWD"] = userPwd;
                Session["LoginVerifyUrl"] = verifyUrl;
                Session["userData"] = r.userData;

                if (Session["scene"] != null) {
                    string sceneId = Session["scene"].ToString();
                    Session["scene"] = null;
                    Response.Redirect("~/default.aspx?scene=" + sceneId);
                }else
                {
                    UserData abc = (UserData)(Session["userData"]);
                    string userId = abc.userId;
                    string ldzm = VerifyLdzm(userId, verifyUrl);

                    if (ldzm == "True")
                    {
                        Response.Redirect("~/home.aspx");
                    }
                    else {
                        if (Session["exurl"] != null)
                        {
                            string exurl = Session["exurl"].ToString();
                            Session["exurl"] = null;
                            Response.Redirect(exurl);
                        }else{
                            Response.Redirect("~/default.aspx");
                        }
                        
                    }                    
                };                             
                JavaScriptSerializer jsonser = new JavaScriptSerializer();
                string userdata = jsonser.Serialize(r.userData);
                HttpCookie co = new HttpCookie("userdata");
                co.Value = HttpUtility.UrlEncode(userdata);
                Response.AppendCookie(co);
            } else {
                //验证失败
                coo.Value = HttpUtility.UrlEncode(r.msg);
            }

            Response.AppendCookie(coo);
        }

        /// <summary>
        /// home页权限判断
        /// </summary>
        /// <param name="page"></param>
        public static void ldzm(Page page)
        {
            HttpRequest Request = page.Request;
            HttpResponse Response = page.Response;
            HttpSessionState Session = page.Session;

            string url = ConfigurationManager.AppSettings["LoginVerifyUrl"];
            if (Session["userData"] != null)
            {
                if (Session["ldzm"] == null)
                {
                    UserData ldzmUD = (UserData)(Session["userData"]);

                    JavaScriptSerializer jsonser = new JavaScriptSerializer();
                    string userdata = jsonser.Serialize(ldzmUD);
                    HttpCookie co = new HttpCookie("userdata");
                    co.Value = HttpUtility.UrlEncode(userdata);
                    Response.AppendCookie(co);

                    string userId = ldzmUD.userId;
                    string ldzm = VerifyLdzm(userId, url);

                    if (ldzm == "True")
                    {
                        Session["ldzm"] = true;
                    }
                    else
                    {
                        Response.Redirect("~/default.aspx");
                    };
                }                
            }
            else {
                Response.Redirect("~/login.aspx");
            }
            
        }

        /// <summary>
        /// manage页权限判断
        /// </summary>
        /// <param name="page"></param>
        public static void ywxt(Page page)
        {
            HttpRequest Request = page.Request;
            HttpResponse Response = page.Response;
            HttpSessionState Session = page.Session;

            string url = ConfigurationManager.AppSettings["LoginVerifyUrl"];
            if (Session["userData"] != null)
            {
                if (Session["ywxt"] == null)
                {
                    UserData ywxtUD = (UserData)(Session["userData"]);

                    JavaScriptSerializer jsonser = new JavaScriptSerializer();
                    string userdata = jsonser.Serialize(ywxtUD);
                    HttpCookie co = new HttpCookie("userdata");
                    co.Value = HttpUtility.UrlEncode(userdata);
                    Response.AppendCookie(co);

                    string userId = ywxtUD.userId;
                    string ywxt = VerifyYwxt(userId, url);

                    if (ywxt == "True")
                    {
                        Session["ywxt"] = true;
                    }
                    else
                    {
                        Response.Redirect("~/default.aspx");
                    };
                }
            }
            else
            {
                Response.Redirect("~/login.aspx?exurl=manage.aspx");
            }

        }


        /// <summary>
        /// 登录后直接进去系统
        /// </summary>
        /// <param name="page"></param>
        public static void Exist(Page page) {
            HttpResponse Response = page.Response;
            HttpSessionState Session = page.Session;
            object ouserName = Session["UserName"];
            object ouserPwd = Session["PWD"];
            if (ouserName != null && ouserPwd != null)
            {
                UserData userData = Session["userData"] as UserData;
                JavaScriptSerializer jsonser = new JavaScriptSerializer();
                string userdata = jsonser.Serialize(userData);
                HttpCookie co = new HttpCookie("userdata");
                co.Value = HttpUtility.UrlEncode(userdata);
                Response.AppendCookie(co);
            }
            else {
                //判断时候包含scene信息，若带scene参数则保持
                var param = page.ClientQueryString;
                if (param != null) // 
                {
                    string para = param;
                    string[] array = para.Split('&');
                    foreach (string arr in array)
                    {
                        if (arr != "")
                        {
                            string[] mid = arr.Split('=');
                            Session[mid[0]] = mid[1];
                        };
                    };
                };
                Response.Redirect("~/login.aspx");
            }
        }

        /// <summary>
        /// 用户设置
        /// </summary>
        /// <param name="context"></param>
        public void ProcessRequest(HttpContext context) {
            try {
                HttpPostedFile _upfile = context.Request.Files["imgfile"];
                if (_upfile == null) {
                    ResponseWriteEnd(context, "4"); //请选择要上传的文件  
                } else {
                    string fileName = _upfile.FileName; /*获取文件名： C:\Documents and Settings\Administrator\桌面\123.jpg*/
                    string suffix = fileName.Substring(fileName.LastIndexOf(".") + 1).ToLower(); /*获取后缀名并转为小写： jpg*/
                    int bytes = _upfile.ContentLength; //获取文件的字节大小  

                    if (suffix != "jpg")
                        ResponseWriteEnd(context, "2"); //只能上传JPG格式图片  
                    if (bytes > 1024 * 1024)
                        ResponseWriteEnd(context, "3"); //图片不能大于1M  
                    HttpCookie cookie = context.Request.Cookies.Get("userdata");
                    var user = new UserData();
                    JavaScriptSerializer serializer = new JavaScriptSerializer();
                    user = serializer.Deserialize<UserData>(HttpUtility.UrlDecode(cookie.Value));
                    _upfile.SaveAs(
                        HttpContext.Current.Server.MapPath("~/themes/default/images/headimage/" + user.userName + ".jpg"));
                    //保存图片  
                    ResponseWriteEnd(context, "/themes/default/images/headimage/" + user.userName + ".jpg"); //上传成功  
                }
            } catch (Exception ex) {
            }
        }

        private void ResponseWriteEnd(HttpContext context, string msg) {
            context.Response.Write(msg);
            context.Response.End();
        }

        public bool IsReusable {
            get {
                return false;
            }
        }
    }

    /// <summary>
    /// 用户数据类
    /// </summary>
    public class UserData {
        public string userId;
        public string userName;
        public string password;
        public string displayName;
        public string shortName;
        public string nickName;
        public string userTypeName;
        public string userTypeDescription;
        public string userImages;
        public string extraId;
    }

    /// <summary>
    /// 验证结果类
    /// </summary>
    public class VerifyResult {
        public bool status;
        public string msg;
        public UserData userData;
        public VerifyResult() {
            status = false;
            msg = "";
        }
        public VerifyResult(bool status, string msg) {
            this.status = status;
            this.msg = msg;
        }
    }
}