using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace Client
{
    public partial class manage : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                LoginSetting.ywxt(Page);
                //if (Request.QueryString["token"] != null
                //    || Request.Form["token"] != null)
                //{
                //    LoginSetting.Login(Page);
                //}
                //else
                //{
                //    if (Session["UserName"] != null && Session["PWD"] != null)
                //    {

                //    }
                //    else
                //    {
                //        Response.Redirect("~/login.aspx");
                //    }
                //}

            }
        }
    }
}