using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace Client {
    public partial class _Default : System.Web.UI.Page {
        protected void Page_Load(object sender, EventArgs e) {
            if (!IsPostBack)
            {
                string token=null;
                if (Request.QueryString["token"] == null)
                {
                    if (Request.Form["data"] != null)
                    {
                        string data = Request.Form["data"];
                        string[] datas = data.Split('&');
                        //token = datas[0].Split('=')[1];
                        token = datas[0].Substring(6);
                        initZoom.Value = datas[1].Split('=')[1];
                        initCenter.Value = datas[2].Split('=')[1];
                        initBtmId.Value = datas[3].Split('=')[1];
                        initCaseId.Value = datas[4].Split('=')[1];
                    }
                }
                else
                    token = Request.QueryString["token"];

                if (token == null) {
                    LoginSetting.Exist(Page);
                } else {
                    LoginSetting.VerifyByToken(Page, token);

                }
            }
        }
    }
}